# V21 — Hide permanent IDs in Pages CMS

This is a CMS editor-only refinement. It hides both `id` (existing legacy ID) and `autoId` (automatically generated locked UUID) on all four record types: main guides, grouped individual videos, FAQs and support contacts.

It **does not remove either field from the schema or modify any stored JSON**. The CMS still generates UUIDs and the website's V20 loader still resolves `autoId` for newly created content. The configuration must retain `settings.content.merge: true` to preserve stored fields across saves.

## Apply

From the Sandbox project root:

```bash
node tools/hide-cms-technical-ids.cjs --check
node tools/hide-cms-technical-ids.cjs --apply
node tools/check-content.cjs
git diff --check
git diff -- .pages.yml
```

## Test before treating as complete

1. Commit/push **Sandbox only**, refresh Pages CMS and open an existing video/FAQ. Neither ID field should be visible.
2. Make a harmless edit to an existing item, Save, and verify its original `id` remains unchanged in `content/guides.json` or `content/faqs.json` on GitHub.
3. Create a temporary item, keep **Visible on the Help Centre** off, enter its required title and Save. Verify the resulting JSON contains a nonempty `autoId` UUID and the item loads when appropriate. Then delete only that test item and Save again.
4. If a Save fails or a new `autoId` is missing, do not publish to production. Restore the previous `.pages.yml` via Git and investigate.

This requires no CSS/JS changes and does **not** publish to production.
