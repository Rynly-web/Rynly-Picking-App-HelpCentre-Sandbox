# QA checklist for sandbox and Zebra rollout

## Basic navigation

- [ ] Home page shows **Contact support**, **How-to guides** and **Help & FAQs**.
- [ ] Each card opens the expected section.
- [ ] Every guide row leads to a unique detail page.
- [ ] Every FAQ category, including **Managing issues**, opens its questions.
- [ ] Each question opens its own article; breadcrumb links work.
- [ ] Parent Back link returns to the correct listing even when the page is loaded via a saved URL.
- [ ] Header logo and **Back to Help Centre** links return home.
- [ ] Menu opens, navigates and closes; tapping the backdrop closes it; Escape closes it with a keyboard.
- [ ] Browser / Zebra hardware Back navigates through prior hash URLs.
- [ ] Reloading a bookmarked `#/faq/...` or `#/guides/...` URL stays on that page.
- [ ] Old links `picking.html#slide-11`, `picking.html#slide-32`, `substitutions.html`, and `manageissues.html` redirect to sensible new content.

## Layout and accessibility

- [ ] Test width at **320px**, **360px**, **400px** and **600px+**.
- [ ] Test device rotation / landscape (especially Zebra screens).
- [ ] There is no horizontal page overflow.
- [ ] Text, numbers and buttons remain readable at 200% text zoom.
- [ ] Tappable controls are large enough for use in store conditions (target approximately 48px+).
- [ ] Keyboard focus is visible; Tab and Enter operate the menu and links.
- [ ] Screen reader describes icons/links appropriately; screenshot images have meaningful alt text.
- [ ] Confirm content contrast in strong shop lighting.
- [ ] Reduced-motion OS preference is respected.

## Media

- [ ] No empty video or PDF slot shows a broken link.
- [ ] MP4/Vimeo/YouTube loads on real Zebra Wi-Fi and managed Chrome (device policy may block sites).
- [ ] With network interrupted, failure to play a remotely hosted video does not stop text/FAQ browsing that is already loaded.
- [ ] Video controls are usable on the handset; portrait and landscape tested.
- [ ] A complete video plays with sound and can be paused.
- [ ] Each guide PDF link points to the correct approved slide deck.
- [ ] PDF opens/downloads in an approved Zebra app and users can get back to Help Centre.
- [ ] Missing FAQ screenshots show an intentional placeholder; all production images are eventually uploaded.
- [ ] All images are compressed appropriately and contain no customer PII.

## Content and security

- [ ] Official Rynly logo and favicon have replaced placeholders.
- [ ] Rynly colour palette and terminology are approved.
- [ ] All five original partner/service-desk phone numbers verified.
- [ ] All current store offline, cancellation, payment failure and courier guidance verified with operations.
- [ ] Contingency SharePoint link works for intended users on approved devices.
- [ ] Guide subtitles, MP4s, PDFs and FAQ screenshots are current.
- [ ] No secrets, internal credentials or confidential training files are in the public repository or published site.
- [ ] App shows no search bar (by current design).
- [ ] Article-helpfulness feedback is understood as **device-only demo state**, not a submitted ticket or reporting metric.
- [ ] Run `python3 tests/validate_content.py` in the site directory and check results.

## Go-live

- [ ] Deployment source on sandbox repo confirmed as `main` / `(root)` in GitHub Pages.
- [ ] Sandbox tested through its HTTPS Pages URL, not only on localhost.
- [ ] Product owner approves before merging changes to the actual production Help Centre.
