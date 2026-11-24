#!/usr/bin/env node
'use strict';
// V20: Preserve legacy IDs and generate non-editable UUIDs for new CMS records.
// Requires no dependencies. Operates on existing files, not copied historical content.
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const apply = process.argv.includes('--apply');
if (process.argv.slice(2).some(arg => !['--apply', '--check'].includes(arg))) {
  console.error('Usage: node tools/install-locked-ids.cjs [--check|--apply]');
  process.exit(2);
}
const targets = ['.pages.yml', 'assets/js/content-loader.js', 'tools/check-content.cjs', 'index.html'];
const before = Object.fromEntries(targets.map(file => {
  const full = path.join(root,file);
  if (!fs.existsSync(full)) throw Error(`Required project file not found: ${file}`);
  return [file,fs.readFileSync(full,'utf8')];
}));
const descriptions = new Map([
  ['Permanent video ID', 'Video'],
  ['Permanent guide ID', 'Guide'],
  ['Permanent FAQ ID', 'FAQ'],
  ['Permanent contact ID', 'Contact'],
  ['Permanent ID', 'Guide'],
]);
function modifyYaml(text) {
  const lines = text.split('\n');
  let changed=0, existing=0;
  for(let i=0;i<lines.length;i++) {
    const m=lines[i].match(/^(\s*)- name: id\s*$/);
    if(!m)continue;
    const indent=m[1].length;
    const labelLine=lines.slice(i+1,i+6).find(l=>l.trim().startsWith('label: '));
    const label=labelLine?.trim().slice(7).trim();
    if(label && /^Existing (?:video|guide|faq|contact) ID \(locked\)$/.test(label)) { existing++; continue; }
    if(!label || !/^(Permanent (?:video|guide|FAQ|contact)? ?ID|Permanent ID)/i.test(label)) continue;
    const baseLabel=label.match(/^Permanent (?:video|guide|FAQ|contact)? ?ID/i)?.[0] || 'Permanent ID';
    const kind=descriptions.get(baseLabel) || 'Guide';
    let end=i+1;
    while(end<lines.length && (!lines[end].trim() || lines[end].match(/^\s*/)[0].length>indent))end++;
    if(lines[end]?.match(new RegExp(`^\\s{${indent}}- name: autoId\\s*$`))) {existing++;continue;}
    const block=lines.slice(i,end);
    if (!block.some(l=>l.trim()==='type: string')) throw Error(`Unexpected ${kind} ID field; no changes made`);
    const prop=' '.repeat(indent+2), prefix=' '.repeat(indent);
    const replacement=[
      `${prefix}- name: id`,
      `${prop}label: Existing ${kind.toLowerCase()} ID (locked)`,
      `${prop}type: string`,
      `${prop}readonly: true`,
      `${prop}description: Existing IDs are protected. For a new item, use the automatically generated ID below.`,
      `${prefix}- name: autoId`,
      `${prop}label: Automatically generated ID (locked)`,
      `${prop}type: uuid`,
      `${prop}description: Generated for new items and cannot be edited. Existing entries continue using their original ID.`,
      `${prop}options:`,
      `${prop}  editable: false`,
      `${prop}  generate: false`
    ];
    lines.splice(i,end-i,...replacement);
    i += replacement.length-1;
    changed++;
  }
  if(changed+existing!==4) throw Error(`Expected 4 permanent ID fields, found ${changed} to change and ${existing} already converted; no changes made.`);
  return {text:lines.join('\n'), changed, existing};
}
const yaml=modifyYaml(before['.pages.yml']);
function addOnce(text,marker,insert,alreadyTag,file){
  if(text.includes(alreadyTag))return text;
  const matches=text.split(marker).length-1;
  if(matches!==1)throw Error(`Expected one insertion anchor in ${file}; found ${matches}. No files changed.`);
  return text.replace(marker,marker+'\n'+insert);
}
const loaderMarker="for (const name of ['faqs','guides','support','sections']) content[name] = records(content[name],name);";
const loaderInsert=`    // V20: Old human-readable IDs are preserved; new CMS records have a locked UUID.\n    function resolveLockedId(entry) {\n      if (entry && typeof entry === 'object' && !entry.id && typeof entry.autoId === 'string') entry.id = entry.autoId;\n    }\n    for (const name of ['faqs','guides','support']) content[name].forEach(resolveLockedId);\n    content.guides.forEach(guide => {\n      if (Array.isArray(guide.videos)) guide.videos.forEach(resolveLockedId);\n    });`;
const validatorMarker="const site=read('site');";
const validatorInsert=`// V20: Support auto-generated, non-editable UUIDs for newly created CMS items.\nfunction resolveLockedId(item){\n if(item && typeof item==='object' && !item.id && typeof item.autoId==='string')item.id=item.autoId;\n}\n[faqs,guides,support].forEach(items=>items.forEach(resolveLockedId));\nguides.forEach(guide=>(Array.isArray(guide.videos)?guide.videos:[]).forEach(resolveLockedId));`;
let loader=addOnce(before['assets/js/content-loader.js'],loaderMarker,loaderInsert,'// V20: Old human-readable IDs','assets/js/content-loader.js');
let validator=addOnce(before['tools/check-content.cjs'],validatorMarker,validatorInsert,'// V20: Support auto-generated','tools/check-content.cjs');
let html=before['index.html'];
if(!/assets\/js\/content-loader\.js\?v=\d+/.test(html))throw Error('Cannot find loader cache version in index.html; no files changed.');
html=html.replace(/assets\/js\/content-loader\.js\?v=\d+/, 'assets/js/content-loader.js?v=20');
const result={...before,'.pages.yml':yaml.text,'assets/js/content-loader.js':loader,'tools/check-content.cjs':validator,'index.html':html};
const changedFiles=targets.filter(f=>result[f]!==before[f]);
console.log(`V20 locked IDs: ${yaml.changed} CMS fields adjusted; ${yaml.existing} already configured.`);
console.log('Files to update: '+(changedFiles.join(', ') || '(none)'));
console.log('Existing content JSON, human-readable IDs, and CMS action controls will not be modified.');
if(!apply){console.log('Dry run: to apply, run node tools/install-locked-ids.cjs --apply');process.exit(0)}
if(!changedFiles.length){console.log('Already installed.');process.exit(0)}
// Build output entirely in memory and validate all anchors before touching any file.
for(const name of changedFiles) {
  const tmp=path.join(root,name+'.v20tmp');
  fs.writeFileSync(tmp,result[name]);
  fs.renameSync(tmp,path.join(root,name));
}
console.log('V20 applied. Run the project checks and review git diff before committing.');
