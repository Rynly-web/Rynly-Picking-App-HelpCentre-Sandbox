#!/usr/bin/env node
/* One-time, idempotent migration: support contacts own email and reminder settings.
 * Current CMS files, media and existing visibility choices are preserved.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'content');
const file = name => path.join(root, name + '.json');
const read = name => JSON.parse(fs.readFileSync(file(name), 'utf8'));
const save = (name, value) => fs.writeFileSync(file(name), JSON.stringify(value,null,2)+'\n');
const site=read('site');
const support=read('support');
if (!site || typeof site !== 'object' || Array.isArray(site)) throw Error('Invalid site.json');
if (!support || typeof support !== 'object' || Array.isArray(support) || !Array.isArray(support.items)) {
  throw Error('Run the V16 JSON list conversion before V17 (support.json needs items array)');
}
const fields=['supportEmail','supportEmailNote','operationalReminderTitle','operationalReminderText'];
let changed=false;
for (const key of fields) {
 if ((support[key] === undefined || support[key] === null) && site[key] !== undefined) {
   support[key] = site[key]; changed=true;
 }
 if (site[key] !== undefined) {delete site[key];changed=true;}
}
site.home ||= {};
if (site.home.showGuides === undefined) {site.home.showGuides=true;changed=true;}
if (changed) {save('site',site);save('support',support);console.log('V17 support settings moved, UAT Guided videos visibility preserved.');}
else console.log('V17 content already prepared; no changes made.');
