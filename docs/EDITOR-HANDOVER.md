# Rynly Picking App Help Centre — CMS editor handover

This is a reference guide for colleagues updating text, training videos, PDFs and FAQ screenshots. Routine content edits **do not require Rider**.

## Sign in

1. Open https://app.pagescms.org/.
2. Sign in using the GitHub account approved for the Rynly repository, **or** accept an email-based Pages CMS collaborator invitation.
3. Open `Rynly-web / Rynly-Picking-App-HelpCentre-Sandbox` and select the configured branch (`main` for the sandbox).
4. Choose one of the five sections in the sidebar. Changes are saved as commits to GitHub; the current GitHub Pages deployment publishes the changes automatically.

## What each section edits

- **Guided videos** → training guide rows and their nested video pages. Open the requested row; `Common issues` and `Batching + bag scanning` contain smaller videos inside their `Videos within this group` list.
- **Help centre articles** → FAQ titles, answer blocks, screenshots, notices, search phrases, and related videos.
- **Partner contact numbers** → phone numbers, partner names and any usage notes.
- **Home page and support email** → homepage labels, subtitles, Rynly email, CC reminder and searchable section phrases.
- **FAQ section headings and order** → headings plus question membership/order.

## Upload or update a YouTube training video

1. Upload a reviewed MP4 to YouTube Studio and set **Unlisted**.
2. Open Pages CMS → **Guided videos** → relevant guide/video.
3. Under **Embedded video**, set **Video provider** to `YouTube (Unlisted)`.
4. Paste the *full URL* (e.g. `https://youtu.be/abcdefghijk`) in **YouTube/Vimeo link or video ID**. You can also paste just the 11-character video ID.
5. Set **Player orientation** to `Portrait 9:16` for phone recordings or `Landscape 16:9` for desktop recordings.
6. Optional: edit **Text beneath the video** and **One bullet beneath What this video covers**. Choose **Related FAQ questions** from the selectable list.
7. Save. Preview your changes on the sandbox after GitHub Pages has deployed them.

For a video not yet available, use `No video yet` as provider. The page shows no empty video player. The `Show in Help Centre` checkbox lets you hide whole guide entries from menus; it **does not make uploaded files confidential**.

## Upload a PDF or FAQ image

- **Video PDF:** Open a video → **Supporting PDF** → **PDF file**. Select or upload a PDF. The associated page shows a PDF link when set.
- **FAQ screenshot:** Open an FAQ → **Article content** → expand an **FAQ screenshot / slide** block, or add one. Use **Screenshot** to upload/select PNG, JPG or WebP. Add an accessible description. It will be tappable and pinch-to-zoomable in the public site.
- **FAQ supporting slide/PDF:** Open the FAQ → **Supporting slide** → **Slide image or PDF**. You may also reuse an existing FAQ image on a related video by selecting **Reuse screenshot from FAQ** in that video's **Supporting slide** field. This avoids uploading duplicates.
- **Original slide deck:** The `Full picking app guide (41 slides)` references legacy files under `images/Picking/`. Uploading replacements into those existing paths is a developer-assisted task; the slide-deck numbering is intentionally protected in the CMS.

## Edit a FAQ answer

Open **Help centre articles**, locate the question, and expand **Article content**. You can add/reorder different block types: Paragraph, Subheading, Bullet list, Important note, FAQ screenshot/slide, or External website link. Only `https://` external links are displayed.

## Related links and search

- **Related FAQ questions** on a video page point to specific FAQ IDs.
- **Related videos** on an FAQ point to specific individual video IDs.
- **Extra search phrases** help match colleagues' wording even if it's not visible (e.g. `closure`, `clousure`, `close shop`). Visible text is indexed automatically and search returns at most three pages.
- Do not change **Permanent ID** once a page is published: other pages and bookmarks depend on it.
- When you add a new FAQ, go to **FAQ section headings and order** and include it in a section (otherwise it displays under “More questions”). The CMS selection list for related links is generated from the schema; ask a developer to refresh `.pages.yml` to add the new ID to the dropdown options.

## Before and after saving

1. Check procedures, telephone numbers and video content with the responsible team before release.
2. Save changes in Pages CMS. Each save is committed to the selected GitHub branch.
3. Check `https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre-Sandbox/actions` for the successful Pages deployment.
4. View `https://rynly-web.github.io/Rynly-Picking-App-HelpCentre-Sandbox/`. Test the new video/slide and related links on a Zebra-size screen.
5. If something was published incorrectly, revert the corresponding GitHub commit (or restore the previous value through the editor). Do not manually delete other files.

## Limits and access

The sandbox is publicly hosted. Unlisted YouTube videos are link-accessible, not private. Do not upload confidential customer information, credentials, or sensitive operational details without approval.

The CMS itself needs one-time GitHub App installation/authorisation by the Rynly organisation. Editors can be invited as collaborators (including by email without a GitHub account), subject to the organisation's policies. Uploading content through the CMS does not change the hosting platform or require a separately hosted application.

`content/*.json` files are the **single source of truth** after migration. Do not manually update the old `assets/js/content.js` to make live changes. Do not re-run `node tools/migrate-content.cjs --force` after any CMS edits; it replaces the JSON data with the legacy JavaScript version.
