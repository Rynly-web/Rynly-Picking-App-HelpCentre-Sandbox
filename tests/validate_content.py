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
const cats=new Set(d.faqCategories.map(x=>x.id));
const faqs=new Set(d.faqs.map(x=>x.id));
const all=[...guides,...cats,...faqs];
const errs=[];
if(all.some(x=>!(/^[a-z0-9-]+$/).test(x))) errs.push('Invalid route ID');
if(guides.size!==d.guides.length) errs.push('Duplicate guide ID');
if(cats.size!==d.faqCategories.length) errs.push('Duplicate category ID');
if(faqs.size!==d.faqs.length) errs.push('Duplicate FAQ ID');
if(d.support.length!==new Set(d.support.map(x=>x.id)).size) errs.push('Duplicate support ID');
for(const faq of d.faqs) {
 if(!cats.has(faq.category)) errs.push('FAQ '+faq.id+' references unknown category '+faq.category);
 for(const g of faq.relatedGuides||[]) if(!guides.has(g)) errs.push('FAQ '+faq.id+' references unknown guide '+g);
 for(const id of faq.relatedFaq||[]) if(!faqs.has(id)) errs.push('FAQ '+faq.id+' references unknown related FAQ '+id);
 if((faq.relatedFaq||[]).includes(faq.id)) errs.push('FAQ '+faq.id+' links to itself');
 if(!faq.slide || typeof faq.slide.src !== 'string') errs.push('FAQ '+faq.id+' is missing its supporting slide configuration');
 else if(faq.slide.src && !fs.existsSync(faq.slide.src)) errs.push('FAQ '+faq.id+' slide missing: '+faq.slide.src);
 for(const b of faq.blocks||[]) if(b.type==='image' && !b.src.startsWith('assets/images/faq/')) errs.push('Invalid FAQ image path');
}
for(const guide of d.guides) {
 for(const f of guide.relatedFaq||[]) if(!faqs.has(f)) errs.push('Guide '+guide.id+' references unknown FAQ '+f);
 if(typeof guide.videoText !== 'string') errs.push('Guide '+guide.id+' missing editable video description');
 if(guide.pdf.src && !fs.existsSync(guide.pdf.src)) errs.push('Guide '+guide.id+' PDF missing: '+guide.pdf.src);
 if(guide.video.type==='local' && !fs.existsSync(guide.video.src)) errs.push('Guide '+guide.id+' MP4 missing: '+guide.video.src);
}
if(!d.faqCategories.some(x=>x.id==='managing-issues')) errs.push('Managing issues category missing');
if(!d.support.length||!d.guides.length||!d.faqs.length) errs.push('Missing core content');
console.log('Content: '+d.support.length+' support contacts, '+d.guides.length+' guides, '+d.faqCategories.length+' categories, '+d.faqs.length+' FAQ articles');
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
    if not (ROOT / name).exists():
        missing_images.append(name)
print(f"INFO {len(missing_images)} intentionally pending FAQ screenshots (the app shows placeholders).")
for name in missing_images:
    print(f"  - {name}")
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
check("Related questions" in renderer, "FAQ-to-FAQ links enabled")
check(not list(ROOT.rglob("README.md")), "No README files in distributed project")
