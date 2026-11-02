/* Rynly Help Centre – dependency-free, hash-routed, data-driven application.
 * All route/heading/body content is rendered using DOM APIs and textContent.
 * No server rewrite rules required: bookmarked routes work with GitHub Pages.
 */
(function () {
  "use strict";
  const data = window.RYNLY_CONTENT;
  const config = window.RYNLY_CONFIG;
  const app = document.getElementById("app");

  const byId = (items, id) => items.find(item => item.id === id);
  const href = route => "#/" + (route || "");

  function n(tag, cls, txt) {
    const element = document.createElement(tag);
    if (cls) element.className = cls;
    if (txt !== undefined && txt !== null) element.textContent = String(txt);
    return element;
  }
  function append(parent, ...children) {
    for (const child of children.flat()) {
      if (child !== undefined && child !== null) parent.append(child);
    }
    return parent;
  }
  function svg(name, cls = "") {
    const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    element.setAttribute("class", "icon" + (cls ? " " + cls : ""));
    element.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + name);
    element.append(use);
    return element;
  }
  function a(route, className, label) {
    const link = n("a", className, label);
    link.href = href(route);
    return link;
  }
  function back(route, label) {
    const link = a(route, "back-link");
    append(link, svg("arrow-left"), n("span", "", label));
    return link;
  }
  function head(kicker, title, intro) {
    const box = n("header", "page-head");
    if (kicker) box.append(n("p", "page-kicker", kicker));
    box.append(n("h1", "page-title", title));
    if (intro) box.append(n("p", "page-intro", intro));
    return box;
  }
  function crumbs(items) {
    const nav = n("nav", "breadcrumbs");
    nav.setAttribute("aria-label", "Breadcrumb");
    items.forEach((item, index) => {
      if (index > 0) nav.append(svg("chevron-right"));
      nav.append(item.route === null ? n("span", "", item.label) : a(item.route, "", item.label));
    });
    return nav;
  }
  function notice(title, message, neutral = false) {
    const box = n("aside", "notice" + (neutral ? " neutral" : ""));
    append(box, svg(neutral ? "help" : "alert"), append(n("div"), n("h3", "", title), n("p", "", message)));
    return box;
  }
  function rowList() { return n("div", "row-list"); }
  function row(route, title, desc, icon, meta) {
    const link = a(route, "row-link");
    const copy = append(n("span", "row-copy"), n("span", "row-title", title));
    if (desc) copy.append(n("span", "row-description", desc));
    if (meta) copy.append(n("span", "row-meta", meta));
    if (icon) append(link, append(n("span", "row-icon"), svg(icon)));
    append(link, copy, svg("chevron-right", "row-chevron"));
    return link;
  }
  function homeLink() {
    const link = a("", "home-link");
    append(link, svg("home", "small"), "Back to Help Centre");
    return link;
  }
  function relatedSection(title, items) {
    if (!items.length) return null;
    const section = n("section", "after-content");
    section.append(n("h2", "section-title", title));
    const list = rowList();
    items.forEach(item => list.append(row(item.route, item.title, null, null, null)));
    append(section, list);
    return section;
  }
  function renderHome() {
    // The visual page title is the clickable site header. Keep an accessible H1.
    app.append(n("h1", "sr-only", "Help Centre"));
    const cards = n("div", "feature-list");
    const features = [
      {route:"support",style:"feature-contact",icon:"headset",title:"Contact support",desc:"Partner support numbers"},
      {route:"guides",style:"feature-guides",icon:"book",title:"How-to guides",desc:"Build confidence using the picking app"},
      {route:"faq",style:"feature-faq",icon:"help",title:"Help & FAQs",desc:"Answers and managing issues"}
    ];
    features.forEach(item => {
      const card = a(item.route, "feature-card " + item.style);
      append(card,
        append(n("span", "feature-icon"), svg(item.icon, "large")),
        append(n("span"), n("span", "feature-title", item.title), n("span", "feature-subtitle", item.desc))
      );
      cards.append(card);
    });
    app.append(cards);
  }
  function renderSupport() {
    append(app, back("", "Help Centre"), n("h1", "sr-only", "Contact support"));
    const grid = n("div", "support-grid");
    data.support.forEach(item => {
      const card = n("section", "support-card");
      append(card,
        n("h2", "support-name", item.name),
        n("p", "support-description", item.description),
        append(n("div", "support-actions"), n("span", "support-phone", item.phone)));
      grid.append(card);
    });
    app.append(grid);
    const email = n("section", "media-card after-content");
    email.append(n("h2", "media-title", "Rynly support email"));
    const link = n("a", "resource-link");
    link.href = "mailto:" + config.supportEmail;
    append(link, svg("mail"), n("span", "", config.supportEmail), svg("arrow-right", "small"));
    append(email, link);
    app.append(email);
    append(app, notice("Operational reminder", "For extra drivers or taking a store offline, use the dedicated marketplace support contacts and approved procedures; Rynly support cannot take the store offline."));
    app.append(append(n("div", "after-content"), homeLink()));
  }
  function renderGuides() {
    append(app, back("", "Help Centre"), head(null, "How-to guides"));
    const list = rowList();
    data.guides.forEach(guide => {
      list.append(row("guides/" + guide.id, guide.title, guide.description, guide.icon));
    });
    append(app, list, append(n("div", "after-content"), homeLink()));
  }
  function mediaUrl(path, kind) {
    if (typeof path !== "string") return "";
    const allowed = kind === "pdf"
      ? /^assets\/pdf\/[a-zA-Z0-9_./-]+\.pdf(?:#page=\d+)?$/i
      : kind === "slide-image"
      ? /^assets\/images\/slides\/[a-zA-Z0-9_./-]+\.(?:png|jpg|jpeg|webp)$/i
      : /^assets\/(?:videos|images\/posters)\/[a-zA-Z0-9_./-]+\.(?:mp4|webm|jpg|jpeg|png|webp)$/i;
    return path.indexOf("..") === -1 && allowed.test(path) ? path : "";
  }
  function videoMedia(guide) {
    const card = n("section", "media-card");
    const media = guide.video || {type:"none"};
    let player = null;
    let openUrl = "";
    if (media.type === "local") {
      const src = mediaUrl(media.src, "video");
      if (src && /\.(mp4|webm)$/i.test(src)) {
        const video = document.createElement("video");
        video.setAttribute("controls", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("preload", "metadata");
        video.setAttribute("controlsList", "nodownload"); // UI hint only, not content protection.
        video.src = src;
        const poster = mediaUrl(media.poster, "video");
        if (poster) video.poster = poster;
        player = video;
        openUrl = src;
      }
    } else if (media.type === "youtube" && /^[a-zA-Z0-9_-]{11}$/.test(media.id || "")) {
      openUrl = "https://www.youtube-nocookie.com/embed/" + media.id + "?rel=0";
      player = makeFrame(openUrl, guide.title + " video (YouTube)");
    } else if (media.type === "vimeo" && /^\d{6,15}$/.test(media.id || "")) {
      const hash = /^[0-9a-f]{8,40}$/i.test(media.hash || "") ? "?h=" + media.hash : "";
      openUrl = "https://player.vimeo.com/video/" + media.id + hash;
      player = makeFrame(openUrl, guide.title + " video (Vimeo)");
    }
    if (player) {
      card.append(append(n("div", "video-frame"), player));
      const fallback = n("p", "video-fallback", "If playback is blocked on your device, ");
      const link = n("a", "", "open the video directly");
      link.href = openUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      append(fallback, link, ".");
      card.append(fallback);
    } else {
      const placeholder = n("div", "video-placeholder");
      append(placeholder,
        append(n("div", "play-mark"), svg("play", "large")),
        n("strong", "", "Training video coming soon"),
        n("span", "", "An approved video will appear here once it has been uploaded."));
      card.append(placeholder);
    }
    // This optional guide text is deliberately editable in content.js.
    // Keep it even when an embedded video becomes available.
    if (guide.videoText) card.append(n("p", "video-description", guide.videoText));
    return card;
  }
  function makeFrame(src, title) {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = title;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    return iframe;
  }
  // One supporting-resource layout for guides and FAQ articles.
  // Guides use guide.pdf.src; FAQ articles use faq.slide.src.
  // A FAQ slide may be a PDF (assets/pdf/) or an image (assets/images/slides/).
  function slideMedia(item, isFaq = false) {
    const card = n("section", "media-card supporting-resource");
    card.setAttribute("aria-label", isFaq ? "Supporting slide" : "PDF slides");
    const media = isFaq ? item.slide : item.pdf;
    const raw = media && media.src;
    const pdf = mediaUrl(raw, "pdf");
    const slideImage = isFaq && mediaUrl(raw, "slide-image");
    if (pdf) {
      const link = n("a", "resource-link");
      link.href = pdf;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      append(link, svg("file"), n("span", "", isFaq ? "View supporting slide (PDF)" : "View PDF slides"), svg("external", "small"));
      card.append(link);
      card.append(n("p", "video-fallback", "Opens in a separate tab so you can return to this article."));
    } else if (slideImage) {
      const figure = n("figure", "slide-figure");
      const img = n("img", "slide-image");
      img.src = slideImage;
      img.alt = media.alt || "Supporting slide";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        figure.replaceChildren(resourcePlaceholder(isFaq));
      }, {once:true});
      figure.append(img);
      card.append(figure);
    } else {
      card.append(resourcePlaceholder(isFaq));
    }
    return card;
  }
  function resourcePlaceholder(isFaq) {
    const placeholder = n("div", "pdf-placeholder");
    append(placeholder,
      append(n("div", "pdf-symbol"), svg("file", "large")),
      append(n("div"), n("strong", "", isFaq ? "Supporting slide coming soon" : "PDF slides coming soon"),
        n("span", "", isFaq ? "An approved slide will appear here once it has been added." : "The accompanying training slides will appear here.")));
    return placeholder;
  }
  function renderGuide(id) {
    const guide = byId(data.guides, id);
    if (!guide) return renderNotFound();
    append(app, back("guides", "All how-to guides"),
      crumbs([{route:"",label:"Home"},{route:"guides",label:"How-to guides"},{route:null,label:guide.title}]),
      head("Training guide", guide.title));
    const media = append(n("div", "media-grid"), videoMedia(guide), slideMedia(guide));
    app.append(media);
    const related = (guide.relatedFaq || []).map(key => byId(data.faqs,key)).filter(Boolean).map(faq => ({
      route:"faq/"+faq.category+"/"+faq.id,title:faq.title
    }));
    app.append(relatedSection("Related questions", related));
    app.append(append(n("div", "after-content"), homeLink()));
  }
  function renderFaqCategories() {
    append(app, back("", "Help Centre"), head(null, "Help & FAQs"));
    const list = rowList();
    data.faqCategories.forEach(cat => {
      list.append(row("faq/" + cat.id, cat.title, cat.description, cat.icon));
    });
    append(app, list, append(n("div", "after-content"), homeLink()));
  }
  function renderFaqCategory(categoryId) {
    const category = byId(data.faqCategories, categoryId);
    if (!category) return renderNotFound();
    const questions = data.faqs.filter(faq => faq.category === categoryId);
    append(app, back("faq", "All FAQ categories"),
      crumbs([{route:"",label:"Home"},{route:"faq",label:"FAQs"},{route:null,label:category.title}]),
      head("Help & FAQs", category.title));
    const list = rowList();
    questions.forEach(item => list.append(row("faq/"+categoryId+"/"+item.id,item.title,null,null,null)));
    app.append(questions.length ? list : n("p", "empty-state", "No questions have been added yet."));
    append(app, append(n("div", "after-content"), homeLink()));
  }
  function blockElement(block) {
    switch (block.type) {
      case "paragraph": return n("p", "", block.text);
      case "heading": return n("h2", "", block.text);
      case "notice": return notice(block.title,block.text);
      case "list": {
        const list = n("ul");
        (block.items || []).forEach(item => list.append(n("li", "", item)));
        return list;
      }
      case "link": {
        // Only allow HTTPS external links; arbitrary JavaScript URLs are not accepted.
        if (typeof block.url !== "string" || !block.url.startsWith("https://")) return null;
        const wrapper = n("p");
        const link = n("a", "", block.label);
        link.href = block.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        append(wrapper, link, " ", svg("external", "small"));
        return wrapper;
      }
      case "image": {
        const figure = n("figure", "figure");
        const image = n("img", "article-image");
        image.src = block.src;
        image.alt = block.alt || "Instruction screenshot";
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          // Source ZIP intentionally excluded many images. Show a useful fallback.
          const fallback = n("div", "figure-placeholder");
          append(fallback,svg("file"),n("strong", "", "Instruction screenshot coming soon"),
            n("span", "", "Image placeholder: " + block.src));
          figure.replaceChildren(fallback);
        }, {once:true});
        figure.append(image);
        return figure;
      }
      default: return null;
    }
  }
  function renderFaqArticle(categoryId, id) {
    const category = byId(data.faqCategories, categoryId);
    const faq = byId(data.faqs, id);
    if (!category || !faq || faq.category !== categoryId) return renderNotFound();
    append(app, back("faq/"+categoryId, "Back to " + category.title),
      crumbs([{route:"",label:"Home"},{route:"faq",label:"FAQs"},{route:"faq/"+categoryId,label:category.title}]),
      head("Help article", faq.title));
    const body = n("article", "prose-card");
    (faq.blocks || []).forEach(block => {
      const element = blockElement(block);
      if (element) body.append(element);
    });
    if (faq.supportLink) {
      const link = a("support", "resource-link");
      append(link, svg("headset"), n("span", "", "See all support numbers"), svg("chevron-right"));
      body.append(link);
    }
    app.append(body);
    // Every FAQ article gets a supporting-slide area, regardless of media status.
    app.append(slideMedia(faq, true));
    // Related FAQ articles are manually curated using FAQ IDs in content.js.
    const relatedQuestions = (faq.relatedFaq || []).filter(key => key !== faq.id)
      .map(key => byId(data.faqs, key)).filter(Boolean)
      .map(question => ({route:"faq/" + question.category + "/" + question.id,title:question.title}));
    app.append(relatedSection("Related questions", relatedQuestions));
    const relatedGuides = (faq.relatedGuides || []).map(key => byId(data.guides, key)).filter(Boolean)
      .map(guide => ({route:"guides/"+guide.id,title:guide.title}));
    app.append(relatedSection("Related how-to guides", relatedGuides));
    app.append(append(n("div", "after-content"), homeLink()));
  }
  function renderNotFound() {
    append(app,back("", "Help Centre"),head("Not found", "We couldn't find that page",
      "The page may have moved or its link may be incorrect."), homeLink());
  }
  function route() {
    // All navigation is anchored within index.html; GitHub Pages needs no rewrites.
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const safe = parts.length <= 3 && parts.every(part => /^[a-z0-9-]+$/.test(part));
    app.replaceChildren();
    if (!safe) renderNotFound();
    else if (parts.length === 0) renderHome();
    else if (parts.length === 1 && parts[0] === "support") renderSupport();
    else if (parts.length === 1 && parts[0] === "guides") renderGuides();
    else if (parts.length === 2 && parts[0] === "guides") renderGuide(parts[1]);
    else if (parts.length === 1 && parts[0] === "faq") renderFaqCategories();
    else if (parts.length === 2 && parts[0] === "faq") renderFaqCategory(parts[1]);
    else if (parts.length === 3 && parts[0] === "faq") renderFaqArticle(parts[1],parts[2]);
    else renderNotFound();
    const title = app.querySelector("h1");
    document.title = (title ? title.textContent + " | " : "") + "Rynly Help Centre";
    window.scrollTo(0,0);
  }
  window.addEventListener("hashchange",route);
  route();
})();
