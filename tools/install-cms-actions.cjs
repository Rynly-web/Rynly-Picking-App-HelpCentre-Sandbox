#!/usr/bin/env node
// Add repository-level CMS buttons without replacing the existing editor schema.
const fs = require('node:fs');
const path = require('node:path');
const filename = path.resolve(process.cwd(), '.pages.yml');
if (!fs.existsSync(filename)) throw Error('Run from the Sandbox repository root (.pages.yml missing)');
const original = fs.readFileSync(filename, 'utf8');
if (/^actions\s*:/m.test(original)) {
  console.error('Root actions already exist. No changes made. Review .pages.yml before rerunning.');
  process.exit(1);
}
const anchor = /^(?:media|content)\s*:/m.exec(original);
if (!anchor) throw Error('Cannot find the root media: or content: section. No changes made.');
const actionConfig = `actions:
  - name: publish-production
    label: Publish to production
    workflow: pages-cms-publish-production.yml
    ref: current
    cancelable: false
    confirm:
      title: Publish the tested UAT version?
      message: This publishes the current UAT snapshot to the live Help Centre, excluding Guided videos. Check all recent UAT changes first.
      button: Publish to production
    fields:
      - name: confirm_publish
        label: I checked the current UAT website and want to publish its non-video changes.
        type: checkbox
        required: true
        default: false
  - name: restore-uat
    label: Restore UAT content from production
    workflow: pages-cms-restore-uat.yml
    ref: current
    cancelable: false
    confirm:
      title: Restore published content to UAT?
      message: Replaces UAT FAQs, support details, homepage text and FAQ sections with production versions. Unfinished videos and media uploads are preserved. The current UAT commit is backed up.
      button: Restore UAT content
    fields:
      - name: confirm_restore
        label: I understand this overwrites unpublished UAT content for the listed sections.
        type: checkbox
        required: true
        default: false

`;
const updated = original.slice(0, anchor.index) + actionConfig + original.slice(anchor.index);
fs.writeFileSync(filename, updated);
console.log('Added two root Pages CMS actions. All existing media and content fields preserved.');
