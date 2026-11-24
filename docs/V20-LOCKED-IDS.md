# V20 — Locked permanent IDs in Pages CMS

The V19 editable IDs let people create items but could be modified later. V20 uses a native Pages CMS UUID field to generate a stable, non-editable ID for new content. Existing slugs (for example `pick-an-order`) remain unchanged and read-only.

**No custom Pages CMS fork or server is required.** The project JSON loader and validator resolve the ID of a new record from its `autoId` field when its legacy `id` field is blank. New URLs will contain UUIDs rather than readable slugs.

## Scope
- Main guides, grouped videos, FAQs, support contacts.
- Two fields appear in the CMS: Existing ID (read-only; populated on old records), Automatically generated ID (read-only; used on new records).
- Some older records may also acquire an `autoId` on their first subsequent CMS edit; the original `id` remains authoritative, so existing links do not change.
- For new records, Pages CMS generates the UUID automatically. If you do not see an ID or Save fails, do not try to type one; report the error.
- This protects IDs in the CMS user interface, not from direct GitHub editing or deliberate changes to files.
- Related FAQ/video dropdowns use fixed options; adding a new item does not automatically add it to those dropdowns.

## Installation
Run `node tools/install-locked-ids.cjs --check` then `node tools/install-locked-ids.cjs --apply` from the repository root. This script patches your existing `.pages.yml`, `content-loader.js`, `check-content.cjs`, and `index.html` without touching content JSON. Validate with `node tools/check-content.cjs`, `node --check assets/js/content-loader.js`, `node --check tools/check-content.cjs`, `git diff --check`.

After push, test a **new hidden item** in the live Pages CMS editor: its automatically generated ID should appear locked; Save should succeed; the UAT page should load without error. Also verify the existing `Pick an order` guide still has its original ID. Do not test by changing an existing real ID.
