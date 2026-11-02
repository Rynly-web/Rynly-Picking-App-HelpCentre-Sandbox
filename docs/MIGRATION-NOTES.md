# Migration from uploaded Rynly Help Centre ZIP

Reviewed source files: `index.html`, `picking.html`, `manageissues.html`, `substitutions.html` and the image files present in the user-supplied ZIP.

## Existing layout → new location

| Previous content | New location | Status |
| --- | --- | --- |
| Home page guide links and inline FAQs | `#/` with three entry cards | Redesigned |
| Support contacts in FAQ 8 | `#/support` | Migrated; needs phone-number verification |
| Picking guide (`picking.html`, slides 1–42) | `#/guides` with individual topics | Topics migrated; training videos/PDFs intentionally pending |
| FAQ 1: identify order | FAQs → Orders & picking | Text migrated; existing `FAQ1.png` included |
| FAQ 2: keep alerts ringing | FAQs → Devices & notifications | Text migrated; missing screenshot placeholder |
| FAQ 3: extra driver | FAQs → Couriers & support | Old channel guidance paraphrased; requires operational review |
| FAQ 4: stuck orders | FAQs → Managing issues | Migrated; missing screenshot placeholder |
| FAQ 5: Chop Chop payment failure | FAQs → Managing issues | Migrated; missing screenshot placeholder |
| FAQ 6: cancel order | FAQs → Orders & picking | Migrated; missing screenshot placeholder |
| FAQ 7: stop on-demand orders | FAQs → Managing issues | Existing contingency link preserved; check access and accuracy |
| FAQ 8: contact support | FAQs → Couriers & support + Contact support page | Consolidated |
| FAQ 9: batch picking | FAQs → Substitutions & scanning | Missing slide placeholders, plus dedicated how-to guide |
| FAQ 10: pick scan / pack scan | FAQs → Substitutions & scanning | Missing slide placeholders, plus dedicated how-to guide |
| FAQ 11: signed-in account | FAQs → Accounts & settings | Missing screenshot placeholder |
| Original `images/logo/rynly-logo.png` | `assets/images/brand/logo.svg` | **New placeholder logo**; replace with final branding |

## Backwards-compatible old links

The new package includes minimal redirect stubs for `picking.html`, `substitutions.html`, and `manageissues.html`, so existing saved links do not simply return a 404. The two old picking anchors `#slide-11` (substitutions) and `#slide-32` (managing issues) are specifically mapped to their new destinations. Other picking slide fragments lead to the picking guide overview.

## Notes on missing media

The ZIP contained the images `images/FAQ/FAQ1.png`, `images/Picking/Slide1.png`, `images/manageissues/slide12.5.png`, `images/substitutions/slide5.png` and an older logo. The original HTML referenced numerous additional screenshots and picking slides that were **not** in the ZIP. No missing visual or procedural steps have been invented to fill these gaps.

The new site includes the available `FAQ1.png`. The other existing slide illustrations are left in the old source ZIP and are not implicitly treated as complete training documents. Export and add approved updated slides to `assets/pdf/` when ready.

## Original guide chapter headings used to draft topics

- Getting started
- Substitutions
- Additional picking flows
- Batch picking flows
- Managing orders
- Bag scanning
- Channel-specific issues and actions
- Order history and settings

One issue in the old slide implementation was overlapping chapter slide ranges and references to slide images that were not present. The new guide model assigns one page per topic instead of attempting to reconstruct a continuous 42-slide sequence.

## What is NOT implemented in the sandbox

- Actual MP4 videos: none supplied in this conversation.
- Final PDFs or new slide designs: none supplied.
- Live/verified support numbers or operational procedure sign-off.
- Search, backend analytics, CMS or helpdesk ticket creation.
- Authenticated/private content delivery (GitHub Pages alone does not provide this).

## Source-of-truth policy

The `content.js` file is the editable content source. The app deliberately does not scrape, link dynamically to or depend on the old Help Centre at runtime. This avoids silently changing content and gives the team one place to review edits.
