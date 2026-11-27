# V22 – Support page, FAQ editing, loading indicators and footer exit

Apply in the Sandbox repository after pulling the latest CMS changes. This update patches your current files, rather than replacing them with earlier snapshots.

1. Copy `tools/install-v22.py`, `tools/v22-enhancements.css`, and this guide into the project (keep their paths).
2. Run `python3 tools/install-v22.py --check`. If an expected anchor is missing, stop; no files have been changed. Do not force the patch.
3. Run `python3 tools/install-v22.py --apply`.
4. Run `node tools/check-content.cjs`, `node --check assets/js/app.js`, `node --check assets/js/content-loader.js`, `node --check assets/js/search.js`, `git diff --check`, and inspect `git status --short`.
5. Test locally, then commit and push to Sandbox only. Do not invoke Publish to production before team testing and approval of the release.

## Support page

In **Support contacts & Rynly email**, edit Support page title and drag the entries in Support page section order. The order starts as contacts, email, reminder to avoid changing the content layout unexpectedly. Drag Operational reminder to the top if desired. Partner contacts can still be reordered separately. Missing or repeated section choices never hide support information; the renderer shows all three sections exactly once.

## FAQ articles

Use Article content to add/reorder text, subheadings, lists, important notes, screenshots and links. Screenshot blocks now allow text above and below, optional bullets, and separate accessibility descriptions. Additional supporting material is optional; an empty selection produces no placeholder. Text around related video links is only shown if there are actual visible related videos. Existing FAQ images and links are preserved. No change to actual video embeds.

## Image loading

Instructional images and the zoom viewer show a small loading state; on successful load the indicator disappears. Existing lazy loading and original-image zoom are retained. The optimized WebP remains preferred where available; a failed preview can retry the original image. No image files are recompressed by this release. Missing files have an unavailable state.

## Footer

The footer's Rynly Picking App label is a button that calls window.close(). If browser restrictions prevent closure, it displays a message to use the native X. A native in-app browser close handler would be necessary for guaranteed identical behavior to the X. Test on the real Picking App/Zebra; ordinary Chrome testing does not establish native closure support. The Help Centre footer link still returns home.

## Validation and rollback

Expected updated files: `.pages.yml`, `assets/js/app.js`, `assets/js/content-loader.js`, `assets/js/search.js`, `index.html`, `content/support.json` (new defaults only), `assets/css/v22-enhancements.css`, and three package files. FAQ/guide/section/site JSON, workflow definitions, IDs, and media are not modified. Production-copy script already copies assets and support JSON. V18 production actions are retained. This update requires a real CMS save and a real-device test. Use a normal Git revert to undo the V22 code commit if required; inspect later content edits before reverting a commit that touches support.json.
