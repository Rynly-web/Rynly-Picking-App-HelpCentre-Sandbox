#!/usr/bin/env node
/**
 * One-time, safe Pages CMS list conversion.
 * Converts existing content/*.json top-level arrays into {items:[...]},
 * enabling custom collapsed labels while preserving every existing record.
 * Run AFTER pulling the latest Pages CMS edits. Re-running is harmless.
 * No dependencies and no hard-coded data; never overwrites content with an old copy.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..','content');
const names = ['guides','faqs','support','sections'];
const preview = process.argv.includes('--dry-run');
const plans = [];
for (const name of names) {
  const file = path.join(root,name+'.json');
  const raw = fs.readFileSync(file,'utf8');
  const parsed = JSON.parse(raw);
  const alreadyWrapped = parsed && !Array.isArray(parsed) && typeof parsed==='object' && Array.isArray(parsed.items);
  if (!Array.isArray(parsed) && !alreadyWrapped) throw new Error(name+'.json must be a JSON array or an object containing an items array');
  const originals = alreadyWrapped ? parsed.items : parsed;
  const ids = new Set();
  const converted = originals.map((item,index) => {
    if (!item || typeof item!=='object' || Array.isArray(item)) throw new Error(name+' item #'+(index+1)+' must be an object');
    if (name !== 'sections') {
      if (!item.id || typeof item.id!=='string' || ids.has(item.id)) throw new Error(name+' missing/duplicate ID: '+item.id);
      ids.add(item.id);
    }
    if (name==='guides' && Array.isArray(item.videos)) {
      const seenVideos=new Set();
      for (const video of item.videos) {
        if(!video || typeof video!=='object' || !video.id || seenVideos.has(video.id)) throw new Error('Duplicate/invalid video in guide '+item.id);
        seenVideos.add(video.id);
        if (video.published!==undefined && typeof video.published!=='boolean') throw new Error('Invalid video visibility: '+video.id);
      }
    }
    if (item.published!==undefined && typeof item.published!=='boolean') throw new Error(name+' visibility must be boolean: '+(item.id||item.title));
    const result={...item};
    if(result.published===undefined)result.published=true;
    if(name==='guides' && Array.isArray(result.videos))result.videos=result.videos.map(video=>video.published===undefined?{...video,published:true}:video);
    return result;
  });
  const output={...(alreadyWrapped?parsed:{}),items:converted};
  if (Object.keys(output).some(key=>key!=='items')) throw new Error(name+'.json contains unknown top-level fields; stopped to avoid altering them');
  const rewritten=JSON.stringify(output,null,2)+'\n';
  plans.push({name,file,rewritten,changed:rewritten!==raw,count:converted.length});
}
for (const plan of plans) {
  console.log(`${preview?'CHECK':'UPDATE'} ${plan.name}.json: ${plan.count} records, ${plan.changed?'conversion needed':'already current'}`);
}
if (preview) { console.log('Dry run only. No files changed.');process.exit(0); }
// All inputs have been validated before writing anything. Use atomic renames.
for (const plan of plans.filter(p=>p.changed)) {
  const temp=plan.file+'.v16-tmp';
  fs.writeFileSync(temp,plan.rewritten,'utf8');
  fs.renameSync(temp,plan.file);
}
console.log('Complete. All records, IDs, links, media settings and existing visibility choices preserved.');
console.log('The changes are local until you commit and push to GitHub.');
