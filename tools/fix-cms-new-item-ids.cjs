#!/usr/bin/env node
'use strict';
// V19: Fix required-but-readonly IDs in Pages CMS without replacing editor schema or content.
// Node.js standard library only. Run from the Sandbox repository root.
const fs = require('node:fs');
const path = require('node:path');
const yamlPath = path.resolve(process.cwd(), '.pages.yml');
const apply = process.argv.includes('--apply');
const allowed = new Set(['--apply', '--check']);
for (const arg of process.argv.slice(2)) {
  if (!allowed.has(arg)) {
    console.error('Usage: node tools/fix-cms-new-item-ids.cjs [--check | --apply]');
    process.exit(2);
  }
}
if (!fs.existsSync(yamlPath)) {
  console.error('ERROR: .pages.yml not found. Run from the Sandbox project root.');
  process.exit(1);
}
const original = fs.readFileSync(yamlPath, 'utf8');
const items = [
  {
    old: 'Permanent video ID — read only',
    label: 'Permanent video ID (required for new videos)',
    afterLabel: 'Video title',
    afterKey: 'title',
    description: 'New video: enter a unique lowercase ID with hyphens, for example checking-order-alerts. For an existing video, do not change its ID; links and related FAQs depend on it.'
  },
  {
    old: 'Permanent ID — read only',
    label: 'Permanent guide ID (required for new guides)',
    afterLabel: 'Guide title',
    afterKey: 'title',
    description: 'New guide: enter a unique lowercase ID with hyphens, for example receiving-a-new-order. Do not change the ID of an existing guide because links depend on it.'
  },
  {
    old: 'Permanent FAQ ID — read only',
    label: 'Permanent FAQ ID (required for new FAQs)',
    afterLabel: 'Question shown on the website',
    afterKey: 'title',
    description: 'New FAQ: enter a unique lowercase ID with hyphens, for example rescan-bag-label. Do not change existing FAQ IDs because links and related guides depend on them.'
  },
  {
    old: 'Permanent contact ID — read only',
    label: 'Permanent contact ID (required for new contacts)',
    afterLabel: 'Partner/team name',
    afterKey: 'name',
    description: 'New contact: enter a unique lowercase ID with hyphens, for example service-desk. Do not change existing contact IDs because page links may depend on them.'
  }
];
let lines = original.split('\n');
let changes = 0;
let alreadyUpdated = 0;
for (const item of items) {
  let i = lines.findIndex(l => l.trim() === `label: ${item.old}`);
  if (i === -1) {
    i = lines.findIndex(l => l.trim() === `label: ${item.label}`);
    if (i >= 0) {
      alreadyUpdated++;
      continue;
    }
    console.error(`ERROR: Expected ID field not found: ${item.old}. No files changed.`);
    process.exit(1);
  }
  // The label should belong to the exact "- name: id" sibling, not the embedded provider video.id.
  const labelIndent = (lines[i].match(/^\s*/) || [''])[0].length;
  const nameLineIndex = i - 1;
  const m = lines[nameLineIndex]?.match(/^(\s*)- name: id\s*$/);
  if (!m || m[1].length !== labelIndent - 2) {
    console.error(`ERROR: Unexpected structure for ${item.old}. No files changed.`);
    process.exit(1);
  }
  const baseIndent = m[1].length;
  let end = i + 1;
  while (end < lines.length) {
    const l = lines[end];
    if (l.trim() && l.match(/^\s*/)[0].length <= baseIndent) break;
    end++;
  }
  const block = lines.slice(nameLineIndex, end);
  if (!block.some(l => l.trim() === 'type: string') ||
      !block.some(l => l.trim() === 'required: true') ||
      !block.some(l => l.trim() === 'readonly: true')) {
    console.error(`ERROR: Unexpected field rules for ${item.old}. No files changed.`);
    process.exit(1);
  }
  const indent = ' '.repeat(labelIndent);
  const newBlock = [];
  let inOldDescription = false;
  let foundDescription = false;
  let foundPattern = false;
  for (let b = 0; b < block.length; b++) {
    const l = block[b];
    if (l.trim() === 'readonly: true') continue;
    if (l.trim().startsWith('label: ')) {
      newBlock.push(`${indent}label: ${item.label}`);
      continue;
    }
    if (l.startsWith(`${indent}description:`)) {
      newBlock.push(`${indent}description: ${JSON.stringify(item.description)}`);
      inOldDescription = true;
      foundDescription = true;
      continue;
    }
    // Skip YAML wrapped description continuation lines.
    if (inOldDescription && l.trim() && l.match(/^\s*/)[0].length > labelIndent) continue;
    inOldDescription = false;
    if (l.startsWith(`${indent}pattern:`)) foundPattern = true;
    newBlock.push(l);
  }
  if (!foundDescription) newBlock.push(`${indent}description: ${JSON.stringify(item.description)}`);
  if (!foundPattern) newBlock.push(`${indent}pattern: ^[a-z0-9-]+$`);
  lines.splice(nameLineIndex, end - nameLineIndex, ...newBlock);
  changes++;
}
// Put the newly editable ID immediately after the record title/name, not below Advanced fields.
// This makes new-record creation clear and does not change the stored JSON structure.
for (const item of items) {
  const idLabel = lines.findIndex(l => l.trim() === `label: ${item.label}`);
  if (idLabel < 1) throw Error(`Updated field missing: ${item.label}; no files changed`);
  const idStart = idLabel - 1;
  const idMatch = lines[idStart].match(/^(\s*)- name: id\s*$/);
  if (!idMatch) throw Error(`Unexpected ID structure for ${item.label}; no files changed`);
  const idIndent = idMatch[1].length;
  function blockEnd(start, indent) {
    let k = start + 1;
    while (k < lines.length && (!lines[k].trim() || lines[k].match(/^\s*/)[0].length > indent)) k++;
    return k;
  }
  const idEnd = blockEnd(idStart, idIndent);
  const originalIdBlock = lines.slice(idStart, idEnd);
  const targetLabel = lines.findIndex(l => l.trim() === `label: ${item.afterLabel}`);
  const targetStart = targetLabel - 1;
  const targetMatch = lines[targetStart]?.match(new RegExp(`^(\\s*)- name: ${item.afterKey}\\s*$`));
  if (targetLabel < 1 || !targetMatch || targetMatch[1].length !== idIndent) {
    throw Error(`Cannot safely locate title field for ${item.label}; no files changed`);
  }
  const targetEnd = blockEnd(targetStart, idIndent);
  // If an ID field already follows its label, do nothing; supports re-running the installer.
  if (idStart === targetEnd) continue;
  lines.splice(idStart, idEnd - idStart);
  // Recompute insertion point after removing lines to avoid shifted positions.
  const newTargetLabel = lines.findIndex(l => l.trim() === `label: ${item.afterLabel}`);
  const newTargetStart = newTargetLabel - 1;
  const insertion = blockEnd(newTargetStart, idIndent);
  lines.splice(insertion, 0, ...originalIdBlock);
}
const next = lines.join('\n');
if (changes === 0 && next === original) {
  console.log('V19 CMS ID fields already updated. No changes needed.');
  process.exit(0);
}
console.log(`Found ${changes} ID fields to update (${alreadyUpdated} already updated).`);
console.log('Fields: grouped video, main guide, FAQ article, partner contact.');
console.log('Permanent ID fields will appear directly below the title/name.');
console.log('Existing content JSON and all stored IDs stay unchanged.');
if (!apply) {
  console.log('Dry run only. To apply: node tools/fix-cms-new-item-ids.cjs --apply');
  process.exit(0);
}
if (next === original) {
  console.log('No additional changes needed.');
  process.exit(0);
}
const tmp = yamlPath + '.v19-tmp';
fs.writeFileSync(tmp, next);
fs.renameSync(tmp, yamlPath);
console.log('Updated .pages.yml only. Review `git diff -- .pages.yml` before committing.');
