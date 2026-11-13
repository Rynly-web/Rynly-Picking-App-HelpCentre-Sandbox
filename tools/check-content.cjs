#!/usr/bin/env node
/* Check CMS-edited content before publication. No npm dependencies. */
'use strict';
const fs=require('node:fs'); const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'content',name+'.json'),'utf8'));
const [faqs,guides,support,sections,site]=['faqs','guides','support','sections','site'].map(read);
let errors=[]; let warnings=[];
const fail=msg=>errors.push(msg),warn=msg=>warnings.push(msg);
if(![faqs,guides,support,sections].every(Array.isArray) || !site || typeof site!=='object')fail('Invalid JSON content types.');
const ids=(a,label)=>{
 const seen=new Set();for(const x of a){
  if(!x || !/^[a-z0-9-]+$/.test(x.id||''))fail(label+' invalid id: '+x?.id);
  if(seen.has(x.id))fail(label+' duplicate id: '+x.id);
  seen.add(x.id);if(!x.title && label!=='support')fail(label+' missing title: '+x.id);
 }return seen;
};
if(!errors.length){
 const faqIDs=ids(faqs,'FAQ'), guideIDs=ids(guides,'Guide');
 const videos=guides.flatMap(g=>Array.isArray(g.videos)?g.videos:[g]);
 const videoIDs=ids(videos,'Video');
 const media=(ref,pathLabel)=>{
  if(!ref || typeof ref!=='string')return;
  if(!/^(?:assets\/(?:images|uploads|pdf|videos)\/|images\/(?:FAQ|Picking)\/|\/Rynly-Picking-App-HelpCentre-Sandbox\/assets\/)/.test(ref))warn(pathLabel+' has an unexpected local media path: '+ref);
 };
 for(const g of videos){
  (g.relatedFaq||[]).forEach(id=>{if(!faqIDs.has(id))fail('Video '+g.id+' links to missing FAQ '+id)});
  if(!['none','youtube','vimeo','local',undefined].includes(g.video?.type))fail('Video '+g.id+' invalid provider '+g.video.type);
  if(g.video?.type==='youtube'&&!/^[A-Za-z0-9_-]{11}$/.test(g.video.id||''))warn('Video '+g.id+' has an incomplete YouTube ID');
  if(g.video?.type==='vimeo'&&!/^\d{6,15}$/.test(g.video.id||''))warn('Video '+g.id+' has an incomplete Vimeo ID');
  media(g.pdf?.src,'PDF '+g.id);media(g.slide?.src,'Slide '+g.id);
  if(g.slide?.faqId&&!faqIDs.has(g.slide.faqId))fail('Guide '+g.id+' references missing supporting FAQ '+g.slide.faqId);
 }
 for(const f of faqs){
   (f.relatedGuides||[]).forEach(id=>{if(!videoIDs.has(id))fail('FAQ '+f.id+' links to missing video '+id)});
   if(!Array.isArray(f.blocks))fail('FAQ '+f.id+' blocks must be an array');
   for(const b of f.blocks||[]){
    if(!['paragraph','heading','notice','list','link','image'].includes(b.type))fail('FAQ '+f.id+' invalid block '+b.type);
    if(b.type==='image')media(b.src,'Image '+f.id);
    if(b.type==='link'&&b.url&&!b.url.startsWith('https://'))fail('FAQ '+f.id+' external URL must use https');
   }
   media(f.slide?.src,'Slide '+f.id);
 }
 const seenSections=new Set();
 sections.forEach(section=>(section.ids||[]).forEach(id=>{
  if(!faqIDs.has(id))fail('FAQ group '+section.title+' references missing FAQ '+id);
  if(seenSections.has(id))warn('FAQ '+id+' appears in multiple groups');seenSections.add(id);
 }));
 faqs.filter(f=>!seenSections.has(f.id)).forEach(f=>warn('FAQ '+f.id+' is not in a section (will appear under More questions).'));
 if(!site.supportEmail)warn('Support email is empty');
}
for(const w of warnings)console.log('WARN '+w);
for(const e of errors)console.error('ERROR '+e);
console.log(`Checked ${faqs.length} FAQs, ${guides.length} guide rows, ${guides.flatMap(g=>g.videos||[g]).length} video pages, ${support.length} support contacts.`);
if(errors.length){console.error(errors.length+' content issue(s) found');process.exit(1)}
console.log('CMS content validation passed.');
