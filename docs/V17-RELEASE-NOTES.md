# V17 — CMS editing, image previews and guarded production release

This patch is applied to the existing **UAT/CMS checkout**. It does not include content JSON, original images, or video assets. All current editor changes are preserved by the one-time migration:

```
node tools/prepare-v17.cjs
node tools/check-content.cjs
```

CMS changes:
- Partner contacts **and** Rynly support email / reminders belong to the same CMS content entry.
- Homepage settings now include **Show Guided videos section**; keep ON in UAT.
- All individual guide/FAQ/contact visibility settings continue to work.
- The public site hides the guide homepage card, routes, and search results when the section is off.
- Existing FAQ images can load optional smaller WebP previews, retaining the original for zoom.

Image preview workflow:

```
python3 tools/optimise-webp-previews.py
python3 -m pip install Pillow
python3 tools/optimise-webp-previews.py --apply
```

The `--apply` command adds `.webp` sidecars and updates `assets/image-variants.json`. It never overwrites original images. After using it, commit the generated `.webp` files and manifest to UAT. New CMS uploads need the script rerun to get WebP previews.

Production release workflow:

```
git clone https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre.git "$HOME/RiderProjects/Rynly-Picking-App-HelpCentre-PROD"
# Run these commands from the UAT/CMS checkout:
bash tools/prepare-production.sh "$HOME/RiderProjects/Rynly-Picking-App-HelpCentre-PROD"
```

The production script checks the target repository origin, clean working tree and CNAME. It copies the current site, does **not** push, preserves legacy images/domain, excludes local video files/posters and draft video records, and forces `site.home.showGuides=false` in the production copy. The UAT source remains unchanged.

Test the production clone locally before doing a separate `git add -A && git commit && git push origin main` in that production repository.

For future approved changes, pull latest UAT and production versions, rerun the same production script, review `git diff`, test and push the production repository. **Do not merge the branches directly**: UAT and production deliberately have different video content and visibility settings.

Caution: public GitHub Pages URLs and repos are not suitable for secrets, even for unpublished pages. The absence of video links from production's interface is not an access-control mechanism.
