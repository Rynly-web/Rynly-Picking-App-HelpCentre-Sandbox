# Rynly Picking App — Help Centre (redesign sandbox)

A mobile-first Help Centre designed for Zebra/Android handheld devices, phones and desktops. Inspired by the **navigation pattern** of the Uber Eats Orders Help Centre, using Rynly's own colour palette and content.

**No npm, React, backend, database, framework or build step required.** This is a static GitHub Pages site with semantic HTML, plain CSS, and small JavaScript modules. Its internal links use URL hashes (for example `#/guides/batch-picking`), so deep links and the browser's Back button work on GitHub Pages without server routing.

## 1. Clone the sandbox in Rider (Mac)

1. Open Rider → **Git → Clone** (or **Clone Repository** on the Welcome screen).
2. URL: `https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre-Sandbox.git`.
3. Choose your folder, e.g. `~/RiderProjects/Rynly-Picking-App-HelpCentre-Sandbox`.
4. Click **Clone** and **Trust Project**.
5. If Rider asks for a `.sln`, use **File → Open** and select the cloned repository **folder** instead. It is a static website, not a .NET solution.

Alternatively:

```bash
cd ~/RiderProjects
git clone https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre-Sandbox.git
```

## 2. Replace the sandbox content safely

The downloaded ZIP of this redesign is a **set of site files**, not a replacement Git repository. Do **not** remove the `.git` directory in your cloned sandbox.

1. Open the cloned sandbox in Rider.
2. Make a dedicated branch: Rider's branch menu → **New Branch** → `help-centre-redesign` (or run `git switch -c help-centre-redesign`).
3. Extract `Rynly-Help-Centre-Redesign.zip` from the download.
4. Copy the contents of its `Rynly-Help-Centre-Redesign/` folder into the **root** of your cloned sandbox. Overwrite `index.html` if prompted.
5. The package includes new `picking.html`, `substitutions.html`, and `manageissues.html` **compatibility redirects**. Overwrite the old pages with these stubs so older links still reach the new content. Keep the stubs when deploying.
6. Optionally delete or archive the old `images/` folder only **after** confirming you have copies of all original screenshots you still need.
7. Confirm the cloned repo's root contains `index.html`, `assets/`, `docs/`, `README.md` and `.nojekyll`.

A terminal alternative, from **inside the cloned sandbox directory**, is:

```bash
git switch -c help-centre-redesign
# Example only: adjust the source path to your extracted ZIP folder.
rsync -av --exclude '.git' --delete ~/Downloads/Rynly-Help-Centre-Redesign/ ./
```

**Caution:** `--delete` removes old website files not found in the new package. It protects `.git` via the exclusion but only run it in the correct cloned sandbox folder after creating the branch.

## 3. Run it locally

In Rider, open **Terminal** in the project root and run:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/> in your browser. Stop with `Ctrl+C`. You can edit CSS/JS in Rider, save, and refresh. Do not open `index.html` as a `file://` page: the local HTTP server is a more realistic environment, especially for media.

For a Zebra-sized test: Chrome → Developer Tools → Toggle Device Toolbar → Responsive and set a viewport of around **360 × 640** or the exact screen resolution of the Zebra model. Also test **320px width** and landscape. Browser emulation does not replace tests on the real device.

### Test on a real Zebra connected to the same Wi-Fi

For local-network testing, run:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Use your Mac's local IP address, e.g. `http://192.168.x.x:8000/`, in the Zebra browser (substitute your actual IP). This works only if the device and Mac can communicate and company policies permit it. For more reliable device validation, use the sandbox GitHub Pages HTTPS URL.

## 4. Deploy the sandbox to GitHub Pages

1. Test locally first.
2. In Rider, review changes in **Commit**, then commit on your redesign branch.
3. Push the branch using **Git → Push**.
4. On GitHub, open a pull request from `help-centre-redesign` to `main` in the **sandbox repository**.
5. Merge after reviewing the changes. Do not merge into production yet.
6. Sandbox repository → **Settings → Pages → Build and deployment**.
7. Choose **Deploy from a branch**, select **main**, and **/(root)** (if not already configured).
8. Wait for GitHub's deployment status and use the Pages URL shown in settings to open the sandbox. Its default URL would usually be `https://rynly-web.github.io/Rynly-Picking-App-HelpCentre-Sandbox/` if no custom domain is set.
9. On the Zebra handset, test the Pages URL directly, including an article and the Back navigation.

Because the site uses relative paths and hash-based routes, **no custom base URL or build configuration is needed**.

## Project structure

```text
Rynly-Help-Centre-Redesign/
├── index.html                 # Header, icon sprite, navigation shell
├── .nojekyll                  # Serve as a plain static site
├── picking.html, etc.        # Redirects to preserve old bookmarks
├── assets/
│   ├── css/
│   │   └── styles.css        # Brand tokens, components, Zebra/mobile layout
│   ├── js/
│   │   ├── config.js         # Site name, support email, future-search switch
│   │   ├── content.js        # All guides, FAQ questions and phone numbers
│   │   └── app.js            # Navigation, video/PDF UI, FAQ rendering
│   ├── images/
│   │   ├── brand/logo.svg    # REPLACE with approved company logo
│   │   ├── brand/favicon.svg # REPLACE with approved app favicon
│   │   ├── faq/             # Existing FAQ1.png + missing future slides
│   │   └── posters/         # Optional video thumbnails
│   ├── videos/              # Optional short MP4s (not recommended for large assets)
│   └── pdf/                 # Optional approved slide decks
├── docs/
│   ├── CONTENT-MANAGEMENT.md # How to add articles, video, PDF, logo, support numbers
│   ├── MIGRATION-NOTES.md    # What was carried across from old site
│   └── QA-CHECKLIST.md       # Release criteria and device test cases
└── tests/
    └── validate_content.py  # Structural/content data checks
```

## Design decisions

- **Three primary entrances:** Contact support, How-to guides and Help & FAQs.
- **Guides:** topic list → dedicated guide → training video + PDF slides → related FAQ links.
- **FAQs:** category list → questions → article. `Managing issues` is a dedicated category.
- **Persistent escapes:** parent-section Back link, breadcrumb trail, Home link and menu. Android hardware/browser Back uses hash history.
- **No search UI yet:** `#search-slot` is present in `index.html` and `searchEnabled` is in `config.js` as deliberate extension points. Flipping the switch alone will **not** create a search feature.
- **Backwards compatibility:** old `picking.html`, `substitutions.html` and `manageissues.html` URLs redirect into the new pages (including two known picking slide links).
- **No fake media:** Unpopulated guides show intentional placeholders; absent FAQ images show fallbacks.
- **No backend:** A lightweight article-helpfulness prompt stores its choice locally on the device and explicitly states that nothing is reported to Rynly. Remove or replace this with real analytics when needed.
- **Security:** External article links are HTTPS-only and use safe link attributes; textual content is injected using `textContent`, not interpolated HTML. Avoid storing sensitive documents in this public Pages site.

**Before production:** verify support numbers, operational procedures, all videos, images, terminology, branding and Zebra-device playback. This package is a working sandbox framework with draft training content, not a fully approved operational manual.
