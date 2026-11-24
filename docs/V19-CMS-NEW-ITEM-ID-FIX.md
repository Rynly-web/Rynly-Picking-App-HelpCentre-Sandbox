# V19 – Allow creation of new CMS items

## Why
Pages CMS required IDs but marked those fields read-only, so an editor could not save a newly-added video, guide, FAQ or contact. Existing IDs were not missing; the schema prevented creating new ones.

## Installation
Run from the Rynly-Picking-App-HelpCentre-Sandbox repository root:

```bash
node tools/fix-cms-new-item-ids.cjs --check
node tools/fix-cms-new-item-ids.cjs --apply
git diff -- .pages.yml
node tools/check-content.cjs
git diff --check
```

The installer edits your CURRENT `.pages.yml`, moving the editable permanent ID directly below each title/name, while preserving all other CMS fields, the V18 Publish and Restore actions, and content JSON. It is idempotent. It does not modify production.

## New item instructions
- New **individual video** inside Common issues or Batching: add a record in **Individual videos in this group**; enter a title and a **unique permanent video ID** such as `scanning-multiple-quantities`. This ID is **not** the YouTube/Vimeo ID.
- New **single-video guide**: add a top-level guide and choose the provider under **Embedded video**; enter a unique permanent guide ID.
- New **FAQ**: add an FAQ article and enter a unique permanent FAQ ID.
- New **partner contact**: add a contact and enter a unique permanent contact ID.

All IDs must use lowercase letters, numbers or hyphens; no spaces. For existing records, do not edit their IDs. Changing an existing ID can break bookmarks, internal links and related content. The field is now editable because Pages CMS does not support a stock conditional rule to make it editable only on new items.

**Existing ID link dropdowns**: The current related-video and related-FAQ selectors contain a fixed set of options. Creating a new page does not automatically add it to those dropdowns. Ask the website maintainer to update `.pages.yml` if the new page must be selectable in those lists.

## Testing
1. Open Pages CMS > Guided videos > Common issues > Individual videos in this group.
2. Add a temporary video and enter a distinct ID (`test-video-...`), a title, and set **Visible on the Help Centre** to off while testing.
3. Save in UAT, verify it appears correctly, then delete only that temporary record and Save again.
4. Check one existing video to confirm its ID remains unchanged. Do not publish to production as part of this test.
