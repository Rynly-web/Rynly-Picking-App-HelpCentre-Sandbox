#!/usr/bin/env node
'use strict';
// V21: Hide technical ID controls in the Pages CMS editor without removing them
// from the schema or modifying content. Supports --check (default) and --apply.
const fs = require('node:fs');
const path = require('node:path');
const input = process.argv.slice(2);
if (input.some(arg => !['--check', '--apply'].includes(arg)) || (input.includes('--check') && input.includes('--apply'))) {
  console.error('Usage: node tools/hide-cms-technical-ids.cjs [--check|--apply]');
  process.exit(2);
}
const apply = input.includes('--apply');
const file = path.resolve(process.cwd(), '.pages.yml');
if (!fs.existsSync(file)) {
  console.error('Missing .pages.yml. Run this from the Help Centre repository root.');
  process.exit(1);
}
const original = fs.readFileSync(file, 'utf8');
// Pages CMS content merge protects stored fields when an editor saves.
if (!/^  content:\s*\r?\n    merge:\s*true\s*$/m.test(original)) {
  console.error('Expected settings.content.merge: true. Not changing the configuration: check stored-ID preservation first.');
  process.exit(1);
}
const lines = original.split('\n');
const targets = [
  { key: 'id', label: /^Existing (guide|video|faq|contact) ID \(locked\)$/, type: 'string', count: 4 },
  { key: 'autoId', label: /^Automatically generated ID \(locked\)$/, type: 'uuid', count: 4 }
];
const counts = { id: 0, autoId: 0 };
let additions = 0;
let alreadyHidden = 0;
for (let i = 0; i < lines.length; i++) {
  const start = lines[i].match(/^(\s*)- name: (id|autoId)\s*$/);
  if (!start) continue;
  const indent = start[1].length;
  const key = start[2];
  let end = i + 1;
  while (end < lines.length) {
    const current = lines[end];
    if (current.trim() && (current.match(/^\s*/)?.[0].length || 0) <= indent) break;
    end++;
  }
  const block = lines.slice(i + 1, end);
  const label = block.find(l => /^\s*label: /.test(l))?.trim().slice('label: '.length).trim();
  const def = targets.find(t => t.key === key && t.label.test(label || ''));
  if (!def) continue;
  if (!block.some(l => l.trim() === `type: ${def.type}`)) throw new Error(`Unexpected field type for ${label}; no files changed`);
  if (key === 'id' && !block.some(l => l.trim() === 'readonly: true')) throw new Error(`Existing ID is not locked: ${label}; no files changed`);
  if (key === 'autoId' && (!block.some(l => l.trim() === 'editable: false') || !block.some(l => l.trim() === 'generate: false'))) throw new Error('UUID is not locked; no files changed');
  counts[key]++;
  if (block.some(l => l.trim() === 'hidden: true')) { alreadyHidden++; i = end - 1; continue; }
  if (block.some(l => /^\s*hidden: /.test(l))) throw new Error(`Unexpected hidden value in ${label}; no files changed`);
  const prop = ' '.repeat(indent + 2);
  const typePos = block.findIndex(l => l.trim() === `type: ${def.type}`);
  lines.splice(i + 1 + typePos + 1, 0, `${prop}hidden: true`);
  additions++;
  i = end;
}
for (const target of targets) {
  if (counts[target.key] !== target.count) {
    throw new Error(`Expected ${target.count} ${target.key} fields; found ${counts[target.key]}. No files changed.`);
  }
}
const updated = lines.join('\n');
console.log(`Found ${counts.id} locked legacy IDs and ${counts.autoId} locked generated UUIDs.`);
console.log(`${additions} field(s) to hide; ${alreadyHidden} already hidden.`);
console.log('No field keys, validation rules, link logic or existing content will be removed.');
if (!apply) {
  console.log('Dry run. To apply: node tools/hide-cms-technical-ids.cjs --apply');
} else if (updated === original) {
  console.log('Already installed.');
} else {
  const temp = `${file}.v21tmp`;
  fs.writeFileSync(temp, updated);
  fs.renameSync(temp, file);
  console.log('Updated .pages.yml only. Verify the diff and test an actual CMS Save on UAT.');
}
