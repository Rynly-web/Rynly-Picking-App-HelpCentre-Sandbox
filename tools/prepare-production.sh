#!/usr/bin/env bash
# Copy approved Help Centre code/content into the existing PROD clone.
# Never pushes, deletes repository folders or changes the UAT checkout.
# Production always hides all guided videos and does not receive their JSON/media.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo 'Usage: bash tools/prepare-production.sh "$HOME/RiderProjects/Rynly-Picking-App-HelpCentre-PROD"' >&2
  exit 2
fi
SRC="$(cd "$(dirname "$0")/.." && pwd -P)"
DEST="$(cd "$1" && pwd -P)"
if [[ "$SRC" == "$DEST" ]]; then echo 'ERROR: Source and destination cannot be the same.' >&2; exit 1; fi
if [[ ! -d "$DEST/.git" ]]; then echo 'ERROR: Destination is not a Git repository clone.' >&2; exit 1; fi
origin="$(git -C "$DEST" remote get-url origin)"
case "$origin" in
  https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre|https://github.com/Rynly-web/Rynly-Picking-App-HelpCentre.git|git@github.com:Rynly-web/Rynly-Picking-App-HelpCentre.git) ;;
  *) echo "ERROR: Destination origin is not the known production repo: $origin" >&2; exit 1;;
esac
if [[ "$(git -C "$DEST" branch --show-current)" != main ]]; then
  echo 'ERROR: Production must be on the main branch.' >&2;exit 1
fi
if [[ -n "$(git -C "$DEST" status --porcelain)" ]]; then
  echo 'ERROR: Production working tree is not clean. Review or commit existing edits first.' >&2;exit 1
fi
if [[ ! -f "$DEST/CNAME" || "$(tr -d '\r\n' < "$DEST/CNAME")" != 'helpcentre.rynly.com' ]]; then
  echo 'ERROR: Production CNAME missing/unexpected. This script will not change DNS configuration.' >&2;exit 1
fi
for f in index.html content/site.json content/support.json content/faqs.json content/guides.json content/sections.json assets/js/app.js assets/js/content-loader.js assets/js/search.js; do
  if [[ ! -f "$SRC/$f" ]]; then echo "ERROR: Missing source: $f" >&2; exit 1;fi
done

# Abort early if the current CMS content has not been migrated to V17.
node - "$SRC" <<'NODE'
const fs=require('node:fs');const path=require('node:path');
const root=path.join(process.argv[2],'content');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name+'.json'),'utf8'));
const site=read('site'), support=read('support');
if (!site.home || typeof site.home.showGuides !== 'boolean' ||
    !support || Array.isArray(support) || !Array.isArray(support.items) ||
    !support.supportEmail) {
 console.error('ERROR: CMS content has not been migrated to V17. Run: node tools/prepare-v17.cjs');
 process.exit(1);
}
NODE

# Update files without deleting pre-existing FAQ/slide images or changing CNAME.
mkdir -p "$DEST/assets" "$DEST/content"
cp "$SRC/index.html" "$DEST/index.html"
[[ ! -f "$SRC/.nojekyll" ]] || cp "$SRC/.nojekyll" "$DEST/.nojekyll"
rsync -a --exclude='.DS_Store' --exclude='videos/' --exclude='posters/' --exclude='content.js' "$SRC/assets/" "$DEST/assets/"
if [[ -d "$SRC/images" ]]; then
  mkdir -p "$DEST/images"
  rsync -a --exclude='.DS_Store' "$SRC/images/" "$DEST/images/"
fi
for name in site support faqs guides sections; do cp "$SRC/content/$name.json" "$DEST/content/$name.json";done

# PROD-only override: never modifies the CMS/UAT site. Don't ship guide drafts.
node - "$DEST" <<'NODE'
const fs=require('node:fs');const path=require('node:path');
const root=process.argv[2];
const sitePath=path.join(root,'content/site.json');
const site=JSON.parse(fs.readFileSync(sitePath,'utf8'));
if (!site.home || typeof site.home!=='object')site.home={};
site.home.showGuides=false;
fs.writeFileSync(sitePath,JSON.stringify(site,null,2)+'\n');
const guidesPath=path.join(root,'content/guides.json');
fs.writeFileSync(guidesPath,JSON.stringify({items:[]},null,2)+'\n');
if (site.home.showGuides !== false) throw new Error('Production video override failed');
console.log('Production override: Guided videos OFF, guide draft JSON excluded.');
NODE

# Old bookmarked training URLs should not serve outdated instructions.
for old in picking.html manageissues.html substitutions.html; do
  if [[ -e "$DEST/$old" ]]; then
    case "$old" in picking.html) redirect='/#/faq/complete-picking-guide';; *) redirect='/#/faq';;esac
    cat > "$DEST/$old" <<HTML
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=$redirect"><title>Rynly Help Centre</title></head><body><p>This page has moved to the <a href="$redirect">new Help Centre</a>.</p></body></html>
HTML
  fi
done

# The custom domain and Git history remain in place.
echo "Prepared production checkout: $DEST"
echo 'Next: inspect changes with git diff; test locally; commit and push from production clone.'
echo 'No files have been pushed to GitHub.'
