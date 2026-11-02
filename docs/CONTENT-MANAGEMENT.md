# Content management — practical editing guide

All content is editable in **Rider**, and updates are published with normal Git commits. Most changes require editing one JavaScript file: `assets/js/content.js`.

## 1. Branding

| What | File | How to change |
| --- | --- | --- |
| Header logo | `assets/images/brand/logo.svg` | Replace with your approved SVG, retaining the filename. Or use a PNG and update the `src` in `index.html`. |
| Browser icon | `assets/images/brand/favicon.svg` | Replace with the approved symbol. |
| Orange | `assets/css/styles.css` | Change `--orange: #FF663E`. |
| Primary teal | `assets/css/styles.css` | Change `--teal-800: #1D4146` and the other teal tokens. |
| Background | `assets/css/styles.css` | Change `--brand-white` and `--background`. |
| Headings, spacing and cards | `assets/css/styles.css` | Edit `.page-title`, `.feature-card`, `.row-link` etc. |
| Support email | `assets/js/config.js` | Edit `supportEmail`. |

The current logo is an **original, temporary text-based placeholder**. It is not the approved logo. The app does not load fonts, icons or CSS from a CDN.

## 2. Contact support

Open `assets/js/content.js`, find `support` near the top. An example:

```javascript
{id:"uber-eats", name:"Uber Eats", phone:"0808 178 5518", description:"Uber Eats orders, couriers and store availability"},
```

- Update or add contact rows here; phone buttons are built automatically.
- **Verify every number and support remit** before publishing beyond the sandbox. Existing numbers were transcribed from the uploaded original site.
- The email address is controlled separately in `config.js`.
- Do not put private access codes, employee credentials or internal secrets in these static files.

## 3. How-to topics

In `assets/js/content.js`, locate the `guides: [...]` array. Every guide includes:

```javascript
{
  id: "picking-an-order",            // Stable ID for bookmarked URL
  title: "How to pick an order",       // Topic list + page title
  description: "Follow the picking journey from accepting an order to handoff.",
  duration: "Picking basics",         // Editorial category / label
  icon: "bag",                        // One of the existing SVG icon IDs
  video: {type: "none"},              // Change when media is ready
  pdf: {src: "", filename: "picking-an-order.pdf"},
  introduction: "...",                // Description above the video
  relatedFaq: ["identify-order", "cancel-order"]
}
```

To **add** a new topic, copy an entire object, provide a unique lowercase hyphenated ID, and add its title/description. The row, video page, PDF section, navigation and related links are generated automatically.

### Option A: Vimeo (best fit for company-controlled hosted training)

Vimeo offers a clean embedded player and options to restrict which website domains may embed it (depending on your plan and privacy settings). This is my preferred hosted option if Rynly has a managed business account and Zebra devices can reach Vimeo.

1. Upload the MP4 to the company-owned Vimeo account.
2. Set the viewing/embedding privacy appropriate to the material; for example restrict embedding to the approved `rynly-web.github.io` host and any custom production host.
3. Test the video from **both sandbox and production domains** (whitelist both if required).
4. Copy the video ID into the guide:

```javascript
video: {type: "vimeo", id: "123456789"},
```

If the Vimeo link is **unlisted** and has a privacy hash, include it:

```javascript
video: {type: "vimeo", id: "123456789", hash: "0123456789abcdef"},
```

The application builds the embed URL `https://player.vimeo.com/video/123456789?h=0123456789abcdef` itself. Replace the sample ID/hash with the exact values from the video's embed URL. The `hash` value is not a password or access-control guarantee.

### Option B: YouTube Unlisted (fastest initial pilot)

1. Upload to an **organisation-owned** YouTube channel.
2. Set Visibility to **Unlisted**.
3. From the video link, for example `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`, use only the video ID:

```javascript
video: {type: "youtube", id: "YOUR_11_CHARACTER_VIDEO_ID"},
```

The app uses the privacy-enhanced `youtube-nocookie.com` embed domain. **Unlisted is not private**: anyone with the URL can share it. YouTube may also be filtered by corporate device/network policies. Test with a real Zebra.

### Option C: Local MP4 (simple, but only for approved small public files)

1. Export an MP4 encoded with **H.264 video + AAC audio**, ideally at a handheld-friendly resolution (e.g. 720p, suitable bit rate).
2. Name the file `picking-an-order.mp4` and place it in `assets/videos/`.
3. Optionally place a poster image in `assets/images/posters/picking-an-order.jpg`.
4. Set:

```javascript
video: {
  type: "local",
  src: "assets/videos/picking-an-order.mp4",
  poster: "assets/images/posters/picking-an-order.jpg"
},
```

The built-in HTML5 video player uses controls, `playsinline` and `preload="metadata"`. You can omit `poster`. There is also an `open the video directly` link for devices where embedded playback fails.

**Important:** files checked into GitHub Pages should be assumed publicly retrievable; avoid hosting internal-only material or large videos directly there. For more than a few small clips, a dedicated streaming host with adaptive delivery is better.

### Why not Cloudflare Stream immediately?

Cloudflare Stream is a viable dedicated streaming option for a larger library, with adaptive streaming and managed delivery. This starter implementation deliberately supports the three options above and does not assume a Cloudflare account, token system or iframe domain. If the team selects Cloudflare Stream, add an approved provider to `videoMedia()` in `assets/js/app.js` and test it on managed devices.

## 4. PDF slides — every guide already has a slot

For each guide, create an approved PDF of the corresponding training slides and put it in `assets/pdf/`, e.g.:

```text
assets/pdf/picking-an-order.pdf
assets/pdf/substitutions.pdf
assets/pdf/batch-picking.pdf
```

Then change the matching guide in `content.js`:

```javascript
pdf: {src: "assets/pdf/picking-an-order.pdf", filename: "picking-an-order.pdf"},
```

When the PDF path is empty, the page shows a **PDF slides coming soon** placeholder. When populated, it shows a **View PDF slides** link that opens the PDF separately. This is more dependable for managed Android handhelds than forcing an inline PDF iframe. If a browser does not render the PDF natively, the user can download/open it in an approved PDF viewer.

To display **individual slide images** rather than a PDF, extend the media component and use the same file placement approach as FAQ screenshots; this was intentionally left out of the first release to keep the interaction simple.

## 5. FAQs and Managing issues

`faqCategories` contains the top-level categories. The category ID is referenced by each FAQ entry. For example:

```javascript
{id:"managing-issues", title:"Managing issues", description:"Stuck orders, payment failures and taking a store offline.", icon:"alert"},
```

An FAQ answer is built from a `blocks` array:

```javascript
{
  id: "example-question",
  category: "managing-issues",
  title: "What should I do when ...?",
  blocks: [
    {type: "paragraph", text: "Start by confirming ..."},
    {type: "heading", text: "Next steps"},
    {type: "list", items: ["First ...", "Then ..."]},
    {type: "image", src: "assets/images/faq/example.png", alt: "Description of the screen"},
    {type: "notice", title: "Important", text: "Contact support if ..."},
    {type: "link", label: "View approved procedure", url: "https://example.com/..."}
  ],
  relatedGuides: ["resolving-issues"]
}
```

The app supports `paragraph`, `heading`, `list`, `image`, `notice` and HTTPS `link` blocks. It displays the FAQ in a dedicated article page with Back, breadcrumbs, a Home link and related guides. No HTML needs to be manually copied between pages.

### Missing screenshot files

Put screenshots into `assets/images/faq/` and ensure the filename matches each entry. For example:

```text
assets/images/faq/FAQ2.png
assets/images/faq/FAQ8.png
assets/images/faq/FAQ18.png
```

Your original ZIP only contained `FAQ1.png` out of the FAQ screenshots referenced in the old HTML. The other references have been preserved **without fabricating images**. On this redesign, the user sees a styled placeholder instead of a browser broken-image icon if a file is absent.

## 6. Search — prepared but not active

- In `index.html` there is a reserved `<div id="search-slot">`.
- In `config.js`, `searchEnabled` is currently `false`.
- When you decide to add search, implement it in a dedicated JavaScript component using the existing `guides` and `faqs` content arrays, then mount it into `#search-slot`.
- **Do not merely set `searchEnabled: true`; that flag is not a finished search function.** No search bar appears in this release, as requested.

## 7. Editorial safety and ownership

The source material includes order cancellation, extra drivers, store availability, payment failures and escalation instructions. Treat those as operational content requiring sign-off. Suggested process:

1. Editing owner changes `content.js`, replacing draft media and missing screenshots.
2. Technical support verifies support contacts and technical accuracy.
3. Marketplace/operations representatives confirm channel-specific actions.
4. Reviewer tests each link and video on a managed Zebra.
5. Merge sandbox changes and publish to production only after approval.

Use screenshots that do not expose customer data, credentials, private tokens or personal information. Public GitHub Pages is not an access-controlled document store.
