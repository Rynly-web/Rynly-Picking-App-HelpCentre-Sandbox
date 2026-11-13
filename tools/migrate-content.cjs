#!/usr/bin/env node
/* One-time migration from the LOCAL current RYNLY_CONTENT script.
 * Run with --force after extracting the CMS update over your Rider repository.
 * This script intentionally does not modify/delete the old content.js.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'assets/js/content.js');
const keywordsInput = path.join(root, 'assets/js/search-keywords.js');
const sectionsInput = path.join(root, 'assets/js/faq-sections.js');
const configInput = path.join(root, 'assets/js/config.js');
const output = path.join(root, 'content');
const force = process.argv.includes('--force');
function loadGlobal(filename, property) {
  if (!fs.existsSync(filename)) return undefined;
  const ctx = {window:{}};
  vm.runInNewContext(fs.readFileSync(filename,'utf8'), ctx, {timeout:1500,filename:path.basename(filename)});
  const data = ctx.window[property];
  if (!data) throw Error('Missing '+property+' in '+path.relative(root,filename));
  // Converts values to normal JSON, removes inherited VM prototypes and undefined keys.
  return JSON.parse(JSON.stringify(data));
}
if (!fs.existsSync(input)) {console.error('No original content.js found; no files written.');process.exit(1)}
const data = loadGlobal(input,'RYNLY_CONTENT');
const keywords = loadGlobal(keywordsInput,'RYNLY_SEARCH_KEYWORDS') || {};
const sections = loadGlobal(sectionsInput,'RYNLY_FAQ_SECTIONS') || [
  {title:'Questions',ids:data.faqs.map(x=>x.id)}
];
const config = loadGlobal(configInput,'RYNLY_CONFIG') || {};
const settings = {
  siteName: config.siteName || 'Rynly Picking App Help Centre',
  supportEmail: config.supportEmail || 'support@rynly.com',
  supportEmailNote: 'Please CC ondemand@sainsburys.co.uk when contacting support.',
  videoInfoPlaceholder: '[Place any extra info here to be beside the training video]',
  operationalReminderTitle:'Operational reminder',
  operationalReminderText:'For extra drivers or taking a store offline, use the dedicated marketplace support contacts and approved procedures; Rynly support cannot take the store offline.',
  home: {
    contactTitle:'Contact support', contactSubtitle:'Partner support numbers',
    guidesTitle:'Guided videos', guidesSubtitle:'Build confidence using the picking app',
    faqTitle:'Help centre and FAQs', faqSubtitle:'Answers and managing issues'
  },
  searchTermsHome: keywords[''] || [],
  searchTermsSupport: keywords.support || [],
  searchTermsGuides: keywords.guides || [],
  searchTermsFaq: keywords.faq || []
};
for (const faq of data.faqs) {
  faq.searchTerms = [...new Set([...(faq.searchTerms||[]),...(keywords['faq/'+faq.id]||[])])];
  faq.published = faq.published !== false;
}
for (const guide of data.guides) {
  const route='guides/'+guide.id;
  guide.searchTerms = [...new Set([...(guide.searchTerms||[]), ...(keywords[route]||[])])];
  guide.published = guide.published !== false;
  if (Array.isArray(guide.videos)) for (const video of guide.videos) {
    video.searchTerms = [...new Set([...(video.searchTerms||[]), ...(keywords[route+'/'+video.id]||[])])];
    video.published = video.published !== false;
  }
}
const files = {
  'faqs.json':data.faqs,
  'guides.json':data.guides,
  'support.json':data.support,
  'sections.json':sections,
  'site.json':settings
};
fs.mkdirSync(output,{recursive:true});
const existing=Object.keys(files).filter(f=>fs.existsSync(path.join(output,f)));
if (existing.length && !force) {
  console.error('CMS JSON already exists: '+existing.join(', '));
  console.error('To do this one-time migration using YOUR local edits, run: node tools/migrate-content.cjs --force');
  process.exit(2);
}
// All source inputs are parsed and validated before the first output is changed.
if (!Array.isArray(data.faqs) || !Array.isArray(data.guides) || !Array.isArray(data.support)) throw Error('Invalid source content');
for(const [name,value] of Object.entries(files)) {
  const target=path.join(output,name);
  const temp=target+'.tmp';
  fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n');
  fs.renameSync(temp,target);
}
console.log('Migrated YOUR local content.js: '+data.faqs.length+' FAQs, '+data.guides.length+' guide rows ('+data.guides.reduce((n,g)=>n+(g.videos?.length||1),0)+' video pages), '+data.support.length+' support contacts.');
console.log('Wrote '+Object.keys(files).map(x=>'content/'+x).join(', '));
console.log('Original content.js, FAQ URLs and media settings were left untouched.');
console.log('IMPORTANT: Do not re-run with --force after editing in Pages CMS: it would overwrite CMS edits.');
