#!/usr/bin/env node
// Restore published CMS content only; preserve video drafts, source code and media uploads.
const fs = require('node:fs');
const path = require('node:path');
const prod = process.argv[2];
if (!prod) throw Error('Usage: node tools/restore-uat-content.cjs /path/to/production');
const root = process.cwd();
const parse = (dir,name)=> JSON.parse(fs.readFileSync(path.join(dir,'content',name+'.json'),'utf8'));
const write = (name,data) => fs.writeFileSync(path.join(root,'content',name+'.json'), JSON.stringify(data,null,2)+'\n');
const uatSite = parse(root,'site');
const prodSite = parse(prod,'site');
// UAT video work and its presentation controls should remain unchanged.
if (!uatSite.home || !prodSite.home) throw Error('Missing home settings');
prodSite.home.showGuides = uatSite.home.showGuides;
for (const key of ['guidesTitle','guidesSubtitle']) {
  if (Object.hasOwn(uatSite.home,key)) prodSite.home[key]=uatSite.home[key];
}
if (Object.hasOwn(uatSite,'searchTermsGuides')) prodSite.searchTermsGuides=uatSite.searchTermsGuides;
const replacements={site:prodSite};
for (const name of ['faqs','sections','support']) {
  const data=parse(prod,name);
  if (!data || !Array.isArray(data.items)) throw Error('Production CMS content invalid: '+name);
  replacements[name]=data;
}
for(const [name,data] of Object.entries(replacements)) write(name,data);
console.log('Restored published homepage text, FAQs, FAQ section headings, and support contacts.');
console.log('Retained UAT content/guides.json, video visibility/labels, media and website code.');
console.log('This does not roll back media uploads or replace image files.');
