#!/usr/bin/env node
// Refuse to deploy/restore until the initial redesigned production launch is complete.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw Error('Usage: node tools/check-production-ready.cjs path/to/production');
function read(rel) { return JSON.parse(fs.readFileSync(path.join(root,rel),'utf8')); }
const cname = fs.readFileSync(path.join(root,'CNAME'),'utf8').trim();
if (cname !== 'helpcentre.rynly.com') throw Error('Production CNAME unexpected');
let site, guides;
try { site=read('content/site.json');guides=read('content/guides.json'); }
catch { throw Error('Production still has the old site; the redesigned initial launch must be done manually first'); }
if (site?.home?.showGuides !== false || !Array.isArray(guides?.items) || guides.items.length !== 0) {
  throw Error('Production is not initialised with videos hidden. Initial launch must happen manually first.');
}
console.log('Production release gate passed. CNAME preserved; Guided videos hidden.');
