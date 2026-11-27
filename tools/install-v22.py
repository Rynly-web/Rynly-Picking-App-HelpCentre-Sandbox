#!/usr/bin/env python3
"""V22 additive patch. Run at repository root; stdlib only. --check is read-only."""
import argparse, json, re, subprocess, tempfile
from pathlib import Path
p=argparse.ArgumentParser(); m=p.add_mutually_exclusive_group(); m.add_argument('--check',action='store_true'); m.add_argument('--apply',action='store_true'); args=p.parse_args()
root=Path.cwd(); paths=['.pages.yml','assets/js/app.js','assets/js/content-loader.js','assets/js/search.js','index.html','content/support.json']
old={f:(root/f).read_text(encoding='utf-8') for f in paths}; out=dict(old)
csspath='assets/css/v22-enhancements.css'
def one(s,a,b,label):
    if s.count(a)!=1: raise SystemExit(f'Expected one {label} anchor, found {s.count(a)}. No files changed.')
    return s.replace(a,b,1)
def scope(s,a,b):
    start=s.index(a); end=s.index(b,start+len(a)); return s[:start],s[start:end],s[end:]
def subone(s,pat,rep,label):
    new,n=re.subn(pat,rep,s,flags=re.M)
    if n!=1: raise SystemExit(f'Expected one {label} anchor, found {n}. No files changed.')
    return new
if '# V22 support page and FAQ editor' in old['.pages.yml']:
    if not all(mark in old[f] for f,mark in [('assets/js/app.js','// V22 enhancements'),('assets/js/content-loader.js','app.js?v=22'),('index.html','v22-enhancements.css'),('assets/js/search.js','supportPageTitle')]) or not (root/csspath).is_file(): raise SystemExit('Partial V22 installation detected; inspect before proceeding.')
    print('V22 already installed. No changes made.'); raise SystemExit(0)
# Keep the latest live schema, including aliases, hidden IDs and actions. Patch only scoped entries.
y=old['.pages.yml']; a,faq,b=scope(y,'- name: faqs\n','- name: support\n')
faq=one(faq,'label: Answer content — text, screenshots and links','label: Article content — add and reorder blocks','FAQ answer label')
faq=one(faq,'label: Paragraph\n','label: Text / instructions\n','paragraph label')
faq=one(faq,'label: FAQ screenshot / slide','label: Screenshot / image','image label')
faq=one(faq,'        - name: src\n          label: Screenshot','        - name: textAbove\n          label: Text above image (optional)\n          type: text\n        - name: src\n          label: Image','image fields')
faq=one(faq,'          label: Accessible description\n          type: string','''          label: Accessibility description (screen readers, optional)
          type: string
        - name: textBelow
          label: Text below image (optional)
          type: text
        - name: bullets
          label: Bullet points below image (optional)
          type: string
          list: true''','image captions')
faq=one(faq,'description: Add, edit or reorder the blocks that make up the FAQ answer.','description: Add blocks in reading order. Drag to move them. Use a screenshot block for an image with optional instructions.','article help')
faq=one(faq,'label: Supporting slide (optional)','label: Additional supporting material (optional)','slide label')
faq=one(faq,'description: Upload one image/PDF, or leave empty to use a FAQ screenshot.','description: Only add an extra resource if needed. Leave empty if the article blocks already contain the screenshots.','slide help')
faq=one(faq,'      - name: alt\n        label: Image description (optional)\n        type: string','''      - name: alt
        label: Accessibility description (optional)
        type: string
      - name: textAbove
        label: Text above supporting material (optional)
        type: text
      - name: textBelow
        label: Text below supporting material (optional)
        type: text
      - name: bullets
        label: Bullet points below supporting material (optional)
        type: string
        list: true''','supporting fields')
faq=one(faq,'    - name: relatedGuides\n','''    - name: relatedVideosIntro
      label: Text above related videos (optional)
      type: text
    - name: relatedGuides
''','related video intro')
faq=one(faq,'    - name: supportLink\n','''    - name: relatedVideosOutro
      label: Text below related videos (optional)
      type: text
    - name: supportLink
''','related video outro')
faq=one(faq,'label: Show link to partner support numbers','label: Show link to contact support','support link label')
for name in ['category','slideDeck']:
    pat=rf'(^    - name: {name}\n(?:^      [^\n]*\n)*?^      readonly: true\n)'
    faq=subone(faq,pat,r'\1      hidden: true\n',name+' hidden')
y=a+faq+b
a,support,b=scope(y,'- name: support\n','- name: site\n')
support=one(support,'  fields:\n  - name: items\n','''  fields:
  # V22 support page and FAQ editor
  - name: supportPageTitle
    label: Support page title
    type: string
    description: Heading on the Contact support page. Leave blank to use Contact support.
  - name: sectionOrder
    label: Support page section order
    type: select
    description: Drag the three sections into the desired website order. Each section appears once; missing sections are appended automatically.
    list:
      max: 3
    options:
      values:
      - name: contacts
        label: Partner support contacts
      - name: email
        label: Rynly support email
      - name: reminder
        label: Operational reminder
  - name: items
''','support order')
out['.pages.yml']=a+support+b
app=old['assets/js/app.js']
a,s,b=scope(app,'  function renderSupport() {','  function renderGuides() {')
s=one(s,'append(app, back("", "Help Centre"), n("h1", "sr-only", "Contact support"));','append(app, back("", "Help Centre"), head(null, cleanText(supportSettings.supportPageTitle) || "Contact support"));','support title')
s=one(s,'    app.append(grid);','', 'support grid append'); s=one(s,'    app.append(email);','', 'support email append')
s=subone(s,r'^    append\(app, notice\((.*)\)\);$',r'    const reminder = notice(\1);','reminder')
s=one(s,'    app.append(append(n("div", "after-content"), homeLink()));','''    const sections = {contacts: grid, email, reminder};
    const requested = Array.isArray(supportSettings.sectionOrder) ? supportSettings.sectionOrder : [];
    const order = [...new Set([...requested, "contacts", "email", "reminder"])];
    const stack = n("div", "support-section-stack");
    for (const key of order) {
      if (typeof key === "string" && Object.prototype.hasOwnProperty.call(sections, key)) stack.append(sections[key]);
    }
    app.append(stack);
    app.append(append(n("div", "after-content"), homeLink()));''','support section order')
app=a+s+b
helpers='''  // V22 enhancements: optional editorial text, image states and footer exit.
  const cleanText = value => typeof value === "string" ? value.trim() : "";
  function mediaText(parent, value) {
    const text = cleanText(value);
    if (text) parent.append(n("p", "media-explanation", text));
  }
  function mediaBullets(parent, values) {
    const points = Array.isArray(values) ? values.map(cleanText).filter(Boolean) : [];
    if (!points.length) return;
    const list = n("ul", "media-bullets");
    points.forEach(point => list.append(n("li", "", point)));
    parent.append(list);
  }
  function imageLoadingState(container, img) {
    const indicator = n("span", "image-load-status");
    indicator.setAttribute("role", "status");
    const spinner = n("span", "image-load-spinner");
    spinner.setAttribute("aria-hidden", "true");
    indicator.append(spinner, n("span", "", "Loading image…"));
    container.append(indicator);
    const done = () => {container.classList.remove("image-is-loading", "image-load-failed"); container.removeAttribute("aria-busy"); indicator.hidden = true;};
    const pending = () => {container.classList.remove("image-load-failed"); container.classList.add("image-is-loading"); container.setAttribute("aria-busy", "true"); indicator.hidden = false;};
    pending();
    img.addEventListener("load", done);
    img.addEventListener("error", () => {
      // Earlier handlers may have selected another source. Let that request finish.
      if (!img.complete) return;
      done();
      if (container.isConnected) { indicator.replaceChildren(n("span", "", "Image unavailable")); indicator.hidden = false; container.classList.add("image-load-failed"); }
    });
    if (img.complete && img.naturalWidth > 0) done();
  }
  function installFooterExit() {
    const footer = document.querySelector(".site-footer");
    const brand = footer?.querySelector(".footer-brand");
    if (!brand) return;
    const button = n("button", "footer-brand footer-exit");
    button.type = "button";
    button.setAttribute("aria-label", "Return to Rynly Picking App");
    button.append(...brand.childNodes);
    brand.replaceWith(button);
    const status = n("p", "footer-exit-status");
    status.setAttribute("role", "status");
    status.hidden = true;
    footer.insertAdjacentElement("afterend", status);
    button.addEventListener("click", () => {
      // Native Custom Tab/WebView closure is controlled by the host app.
      // Do not blindly navigate history (hash routes are internal pages).
      try { window.close(); } catch (_) { /* browser may disallow closure */ }
      status.textContent = "Use the browser’s close (×) button to return to the Rynly Picking App.";
      status.hidden = false;
    });
  }
'''
app=one(app,'  function renderSupport() {',helpers+'  function renderSupport() {','helper insertion')
# Insert state into the shared image wrapper; initial lazy image geometry remains visible.
app=one(app,'    append(button, picture, n("span", "zoom-indicator", "Tap to enlarge"));','    append(button, picture, n("span", "zoom-indicator", "Tap to enlarge"));\n    imageLoadingState(button, img);','zoom spinner')
# Fix missing optimized preview: try original same path before legacy fallbacks (capture listener).
app=one(app,'    picture.append(source, img);','''    picture.append(source, img);
    img.addEventListener("error", event => {
      if (source.hasAttribute("srcset") && img.dataset.originalPath &&
          img.currentSrc && img.currentSrc.endsWith(source.getAttribute("srcset"))) {
        event.stopImmediatePropagation();
        source.removeAttribute("srcset");
        img.src = img.dataset.originalPath;
      }
    }, true);''','WebP fallback')
# Viewer status too; register before assigning src, with status scoped to stage.
app=one(app,'    img.src = source;\n    img.alt = alt || "Enlarged instructional image";','    img.alt = alt || "Enlarged instructional image";','viewer src')
app=one(app,'    stage.append(img, hint);','    stage.append(img, hint);\n    imageLoadingState(stage, img);\n    img.src = source;','viewer spinner')
# FAQ image captions must survive failed images: wrap only the image in figure, captions outside.
a,s,b=scope(app,'      case "image": {','      default: return null;')
s=one(s,'        const figure = n("figure", "figure");','''        const group = n("div", "faq-image-block");
        const figure = n("figure", "figure");
        mediaText(group, block.textAbove);''','article image wrapper')
s=one(s,'        return figure;','''        group.append(figure);
        mediaText(group, block.textBelow);
        mediaBullets(group, block.bullets);
        return group;''','article image captions')
app=a+s+b
# Optional supporting slide; allow FAQ screenshot reuse and captions (without duplicating the article block).
a,s,b=scope(app,'  function slideMedia(item, isFaq = false) {','  function resourcePlaceholder() {')
s=one(s,'const faqId = !isFaq && !slideSource','const faqId = !slideSource','FAQ reuse')
s=one(s,'    if (!isFaq && !pdf && !isImage) return null;','    if (!pdf && !isImage) return null;\n    if (isFaq) mediaText(card, media?.textAbove);','empty supporting material')
# Retain error card for requested images, not placeholder on an unconfigured field.
# regex spans lines; use strict scoped exact range rather than broad replacements
start=s.find('        } else if (!isFaq) {')
if start!=-1:
    end=s.find('        } else {', start+1)
    if end==-1: raise SystemExit('Unexpected image failure branch')
    s=s[:start]+s[end:]
s=one(s,'      card.append(figure);\n    } else {\n      card.append(resourcePlaceholder());\n    }\n    return card;','''      card.append(figure);
    }
    if (isFaq) {
      mediaText(card, media?.textBelow);
      mediaBullets(card, media?.bullets);
    }
    return card;''','supporting captions')
app=a+s+b
# Keep existing links/legacy fallback, but never append null as literal text.
a,s,b=scope(app,'  function renderFaqArticle(','  function renderNotFound() {')
s=one(s,'    const hasArticleImages = (faq.blocks || []).some(block => block.type === "image");','    const hasArticleImages = (faq.blocks || []).some(block => block.type === "image");','article media')
s=one(s,'(!hasArticleImages || faq.slide?.src)','(!hasArticleImages || faq.slide?.src || faq.slide?.faqId)','explicit supporting selection')
s=one(s,'      app.append(slideMedia(faq, true));','      append(app, slideMedia(faq, true));','optional slide')
s=one(s,'    append(app, relatedSection("Related videos", relatedGuides));','''    if (relatedGuides.length) {
      const related = n("div", "faq-related-video-block");
      mediaText(related, faq.relatedVideosIntro);
      append(related, relatedSection("Related videos", relatedGuides));
      mediaText(related, faq.relatedVideosOutro);
      app.append(related);
    }''','related video descriptions')
app=a+s+b
app=one(app,'  window.addEventListener("hashchange",route);','  installFooterExit();\n  window.addEventListener("hashchange",route);','footer setup')
out['assets/js/app.js']=app
search=old['assets/js/search.js']
search=one(search,"'label','alt','name','phone','intro','subtitle'","'label','alt','name','phone','intro','subtitle','textAbove','textBelow','bullets'",'index image captions')
search=one(search,"add('support', 'Contact support',","add('support', data.supportSettings?.supportPageTitle?.trim() || 'Contact support',",'search support title')
search=one(search,"    'Technical service desk, marketplace contact details'","    data.supportSettings?.operationalReminderTitle || '',\n    data.supportSettings?.operationalReminderText || '',\n    'Technical service desk, marketplace contact details'",'search support reminder')
search=one(search,"    flatten(faq.blocks).join(' '),","    flatten(faq.blocks).join(' '),\n    flatten([faq.slide?.textAbove, faq.slide?.textBelow, faq.slide?.bullets, ...(site.home?.showGuides !== false ? [faq.relatedVideosIntro, faq.relatedVideosOutro] : [])]).join(' '),",'search FAQ descriptions')
out['assets/js/search.js']=search
loader=old['assets/js/content-loader.js']
for name in ['app','search']:
    loader=subone(loader,rf'assets/js/{name}\.js\?v=\d+',f'assets/js/{name}.js?v=22',name+' cache')
out['assets/js/content-loader.js']=loader
html=subone(old['index.html'],r'assets/js/content-loader\.js\?v=\d+','assets/js/content-loader.js?v=22','loader cache')
html=one(html,'</head>','  <link rel="stylesheet" href="assets/css/v22-enhancements.css?v=22">\n</head>','stylesheet')
out['index.html']=html
supportdata=json.loads(old['content/support.json'])
if not isinstance(supportdata,dict) or not isinstance(supportdata.get('items'),list): raise SystemExit('Expected V17 support.json with items array; no files changed.')
# Add defaults only; preserve existing choices and content. Render defensively if fields are absent after a restore.
new=False
for k,v in [('supportPageTitle','Contact support'),('sectionOrder',['contacts','email','reminder'])]:
    if k not in supportdata: supportdata[k]=v; new=True
if new: out['content/support.json']=json.dumps(supportdata,ensure_ascii=False,indent=2)+'\n'
css=(Path(__file__).resolve().parent/'v22-enhancements.css').read_text(encoding='utf-8')
# Do not overwrite an unrelated CSS file.
if (root/csspath).exists() and (root/csspath).read_text(encoding='utf-8')!=css: raise SystemExit('V22 CSS path already exists with different contents; no files changed.')
out[csspath]=css
# Validate all JS before writing anything.
with tempfile.TemporaryDirectory() as td:
    for f in ['assets/js/app.js','assets/js/content-loader.js','assets/js/search.js']:
        temp=Path(td)/Path(f).name; temp.write_text(out[f],encoding='utf-8'); subprocess.run(['node','--check',str(temp)],check=True)
changed=[f for f in out if old.get(f)!=out[f] and (not (root/f).exists() or (root/f).read_text(encoding='utf-8')!=out[f])]
print('V22 files to change: '+', '.join(changed)); print('Existing FAQ/guide JSON, IDs, workflows and media are untouched.')
if args.apply:
    for f in changed:
        target=root/f; target.parent.mkdir(parents=True,exist_ok=True); temp=target.with_name(target.name+'.v22tmp'); temp.write_text(out[f],encoding='utf-8'); temp.replace(target)
    print('V22 applied. Run content checks and test UAT before committing.')
else: print('Dry run only. Use --apply to install.')
