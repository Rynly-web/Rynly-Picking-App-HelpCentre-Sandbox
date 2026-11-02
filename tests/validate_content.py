"""Dependency-free content checks. Run from project root: python3 tests/validate_content.py"""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "assets/js/content.js"
APP = ROOT / "assets/js/app.js"
CONFIG = ROOT / "assets/js/config.js"
INDEX = ROOT / "index.html"


def check(ok, message):
    print(("PASS" if ok else "FAIL") + " " + message)
    if not ok:
        global errors
        errors += 1


errors = 0
for path in [INDEX, CONFIG, CONTENT, APP, ROOT / "assets/css/styles.css", ROOT / ".nojekyll"]:
    check(path.is_file(), f"Required file: {path.relative_to(ROOT)}")

# Use Node if installed to inspect actual JS objects rather than parsing JS with regex.
script = r'''
const fs=require('fs'),vm=require('vm');
const context={window:{}}; vm.createContext(context);
vm.runInContext(fs.readFileSync('assets/js/config.js','utf8'),context);
vm.runInContext(fs.readFileSync('assets/js/content.js','utf8'),context);
const d=context.window.RYNLY_CONTENT;
const guides=new Set(d.guides.map(x=>x.id));
const childVideos=d.guides.flatMap(x=>Array.isArray(x.videos)?x.videos:[]);
const videos=d.guides.flatMap(x=>Array.isArray(x.videos)?x.videos:[x]);
const videoIds=new Set(videos.map(x=>x.id));
const cats=new Set(d.faqs.map(x=>x.category));
const faqs=new Set(d.faqs.map(x=>x.id));
const all=[...guides,...videoIds,...cats,...faqs];
const errs=[];
if(all.some(x=>!(/^[a-z0-9-]+$/).test(x))) errs.push('Invalid route ID');
if(guides.size!==d.guides.length) errs.push('Duplicate guide ID');
if(videoIds.size!==videos.length) errs.push('Duplicate video ID');
if(childVideos.some(x=>guides.has(x.id))) errs.push('Child video duplicates a top-level guide ID');
if(faqs.size!==d.faqs.length) errs.push('Duplicate FAQ ID');
if(d.support.length!==new Set(d.support.map(x=>x.id)).size) errs.push('Duplicate support ID');
for(const faq of d.faqs) {
 if(!cats.has(faq.category)) errs.push('FAQ '+faq.id+' references unknown category '+faq.category);
 for(const g of faq.relatedGuides||[]) if(!videoIds.has(g)) errs.push('FAQ '+faq.id+' references unknown video '+g);
 if(!faq.slide || typeof faq.slide.src !== 'string') errs.push('FAQ '+faq.id+' is missing its supporting slide configuration');
 else if(faq.slide.src && !fs.existsSync(faq.slide.src)) errs.push('FAQ '+faq.id+' slide missing: '+faq.slide.src);
 for(const b of faq.blocks||[]) if(b.type==='image' && !b.src.startsWith('assets/images/faq/')) errs.push('Invalid FAQ image path');
}
for(const guide of d.guides) {
 if(Array.isArray(guide.videos) && !guide.videos.length) errs.push('Empty video selector: '+guide.id);
}
for(const video of videos) {
 for(const f of video.relatedFaq||[]) if(!faqs.has(f)) errs.push('Video '+video.id+' references unknown FAQ '+f);
 if(typeof video.videoText !== 'string') errs.push('Video '+video.id+' missing editable video description');
 if(!Array.isArray(video.topics) || !video.topics.length) errs.push('Video '+video.id+' missing workshop topic outline');
 if(video.pdf.src && !fs.existsSync(video.pdf.src)) errs.push('Video '+video.id+' PDF missing: '+video.pdf.src);
 if(video.video.type==='local' && !fs.existsSync(video.video.src)) errs.push('Video '+video.id+' MP4 missing: '+video.video.src);
}
if(d.guides.length!==7) errs.push('Expected seven main guide rows');
if(d.guides.filter(x=>Array.isArray(x.videos)).length!==2) errs.push('Expected two video-selector guide rows');
if(videos.length!==10) errs.push('Expected ten individual video pages');
const expectedOrder=['logging-in-getting-started','picking-completing-an-order','troubleshooting-common-issues','requesting-an-extra-courier','batch-picking-bag-scanning','substitutions-deep-dive','in-store-barcode-scanning'];
if(d.guides.some((g,i)=>g.id!==expectedOrder[i])) errs.push('Incorrect main guide order');
for(const faq of d.faqs) if(typeof faq.icon!=='string') errs.push('FAQ '+faq.id+' lacks a row icon');
if(!d.support.length||!d.guides.length||!d.faqs.length) errs.push('Missing core content');
console.log('Content: '+d.support.length+' support contacts, '+d.guides.length+' guide rows, '+videos.length+' video pages, '+d.faqs.length+' FAQ articles');
errs.forEach(e=>console.error('FAIL '+e));
process.exit(errs.length?1:0);
'''
try:
    process = subprocess.run(["node", "-e", script], cwd=ROOT, check=False, capture_output=True, text=True)
except FileNotFoundError:
    print("SKIP Node not found; install Node or use Rider's JavaScript inspection to validate content.js")
else:
    print(process.stdout, end="")
    if process.returncode:
        print(process.stderr, end="")
        errors += 1

missing_images = []
source = CONTENT.read_text(encoding="utf-8")
for name in sorted(set(re.findall(r'assets/images/faq/[\w.-]+\.png', source))):
    filename = Path(name).name
    paths = [ROOT / name, ROOT / "images/FAQ" / filename, ROOT / "images/faq" / filename]
    if not any(path.is_file() for path in paths):
        missing_images.append(filename)
print(f"INFO {len(missing_images)} FAQ screenshots missing from both the new and original directories.")
for filename in missing_images:
    print(f"  - {filename} (expected in assets/images/faq/ or images/FAQ/)")
if errors:
    print(f"\n{errors} validation error(s).")
    sys.exit(1)
print("\nValidation complete.")

# Presentational / structural checks for the simplified no-menu design.
markup = INDEX.read_text(encoding="utf-8")
renderer = APP.read_text(encoding="utf-8")
check("menu-toggle" not in markup and "nav-panel" not in markup, "No hamburger menu or navigation overlay")
check("feedback(" not in renderer, "Article feedback removed")
check("slideMedia(faq, true)" in renderer, "FAQ slide rendering enabled")
check('relatedSection("Related questions", related)' in renderer, "Guide-to-FAQ related questions enabled")
check('function renderFaqList()' in renderer and 'renderFaqCategories()' not in renderer, "Single-level FAQs, no category screens")
check('video.topics.forEach' in renderer, "Individual video topic outlines are rendered")
check('function openImageViewer(' in renderer, "Zoomable image viewer enabled")
check('const hasArticleImages =' in renderer, "Duplicate FAQ slide placeholders suppressed")
check('const videosById = new Map()' in renderer, "FAQ related guides target individual videos")
check(not list(ROOT.rglob("README.md")), "No README files in distributed project")

# The complete picking guide is a single FAQ article immediately before support.
# Its source uses Slide1.png and Slide3.png through Slide42.png (41 images).
check('id:"complete-picking-guide"' in source, "Full picking guide exists as an FAQ")
check('slideDeck:{first:1,last:42,skip:[2]}' in source, "Original 41-slide sequence preserved")
check('function renderFullSlideDeck(' in renderer and 'zoomableImage(img, img.alt)' in renderer,
      "Slide guide uses the existing pinch-to-zoom viewer")
check(source.index('id:"complete-picking-guide"') < source.index('id:"contact-support-faq"'),
      "Full picking guide appears immediately above Contact support")
missing_picking_slides = [i for i in range(1,43) if i!=2 and not (ROOT / f"images/Picking/Slide{i}.png").is_file()]
print(f"INFO {41-len(missing_picking_slides)} of 41 original picking guide images available.")
if missing_picking_slides:
    print("INFO Missing picking slides (add these to images/Picking/): " + ", ".join(map(str,missing_picking_slides)))
if errors:
    print(f"\n{errors} validation error(s).")
    sys.exit(1)
