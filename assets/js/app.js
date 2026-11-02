/* Rynly Help Centre – dependency-free, hash-routed, data-driven application.
 * All route/heading/body content is rendered using DOM APIs and textContent.
 * No server rewrite rules required: bookmarked routes work with GitHub Pages.
 */
(function () {
  "use strict";
  const data = window.RYNLY_CONTENT;
  const config = window.RYNLY_CONFIG;
  const mediaSettings = window.RYNLY_MEDIA_SETTINGS || {};
  const app = document.getElementById("app");
  // A top-level guide can be a single video or a selector containing videos.
  // Child videos use stable URLs: #/guides/<section-id>/<video-id>.
  const videosById = new Map();
  data.guides.forEach(guide => {
    if (Array.isArray(guide.videos)) {
      guide.videos.forEach(video => videosById.set(video.id, {
        video, parent: guide, route: "guides/" + guide.id + "/" + video.id
      }));
    } else {
      videosById.set(guide.id, {video: guide, parent: null, route: "guides/" + guide.id});
    }
  });

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
    // Display the support email as plain text: no mailto link or arrow.
    const emailRow = n("div", "support-email-row");
    append(emailRow, svg("mail"), n("span", "support-email-address", config.supportEmail));
    append(email,
        emailRow,
        n("p", "support-email-note", "Please CC ondemand@sainsburys.co.uk when contacting support."));
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
    const settings = mediaSettings[guide.id] || {};
    // Explicit video orientation takes precedence over the optional settings file.
    const portrait = (media.orientation || settings.orientation) === "portrait";
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
      openUrl = "https://www.youtube.com/watch?v=" + media.id;
      player = makeFrame("https://www.youtube-nocookie.com/embed/" + media.id + "?rel=0", guide.title + " video (YouTube)");
    } else if (media.type === "vimeo" && /^\d{6,15}$/.test(media.id || "")) {
      const hash = /^[0-9a-f]{8,40}$/i.test(media.hash || "") ? "?h=" + media.hash : "";
      openUrl = "https://player.vimeo.com/video/" + media.id + hash;
      player = makeFrame(openUrl, guide.title + " video (Vimeo)");
    }
    if (player) {
      // The remote iframe cannot reliably report its dimensions, so portrait
      // orientation is configured per video (or detected from local MP4 metadata).
      const frame = n("div", "video-frame" + (portrait ? " video-frame--portrait" : ""));
      if (media.type === "local" && !media.orientation && !settings.orientation) {
        player.addEventListener("loadedmetadata", () => {
          frame.classList.toggle("video-frame--portrait", player.videoHeight > player.videoWidth);
        });
      }
      card.append(append(frame, player));
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
  // Zoomable full-screen image viewer. Local DOM only; no CDN dependencies.
  // Close via a persistent 48px button, Escape / Android back, or the backdrop.
  // Supports touch pinch-to-zoom, drag to pan, double-tap, and +/- controls.
  let activeLightbox = null;
  function openImageViewer(source, alt, opener) {
    if (activeLightbox) activeLightbox.close();
    const dialog = n("dialog", "image-lightbox");
    dialog.setAttribute("aria-label", "Enlarged instructional image");
    const header = n("div", "lightbox-toolbar");
    const title = n("span", "lightbox-title", alt || "Image");
    const zoomOut = n("button", "lightbox-control", "−");
    const zoomIn = n("button", "lightbox-control", "+");
    const close = n("button", "lightbox-control lightbox-close", "×");
    zoomOut.type = zoomIn.type = close.type = "button";
    zoomOut.setAttribute("aria-label", "Zoom out");
    zoomIn.setAttribute("aria-label", "Zoom in");
    close.setAttribute("aria-label", "Close image");
    append(header, title, zoomOut, zoomIn, close);
    const stage = n("div", "lightbox-stage");
    const img = n("img", "lightbox-image");
    img.src = source;
    img.alt = alt || "Enlarged instructional image";
    img.draggable = false;
    const hint = n("span", "lightbox-hint", "Pinch or use + / − to zoom");
    stage.append(img, hint);
    dialog.append(header, stage);
    document.body.append(dialog);
    activeLightbox = dialog;

    let scale = 1, x = 0, y = 0;
    const pointers = new Map();
    let gesture = null;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function clampPan() {
      const overflowX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2);
      const overflowY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2);
      x = Math.max(-overflowX, Math.min(overflowX, x));
      y = Math.max(-overflowY, Math.min(overflowY, y));
    }
    function paint() {
      clampPan();
      img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      hint.hidden = scale > 1.05;
      zoomOut.disabled = scale <= 1;
      zoomIn.disabled = scale >= 5;
    }
    function setZoom(nextScale) {
      scale = Math.min(5, Math.max(1, nextScale));
      if (scale === 1) x = y = 0;
      paint();
    }
    zoomOut.addEventListener("click", () => setZoom(scale / 1.6));
    zoomIn.addEventListener("click", () => setZoom(scale * 1.6));
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
    stage.addEventListener("click", e => {
      if (scale !== 1) return;
      const bounds = img.getBoundingClientRect();
      // Only taps on the empty dark surround close the viewer, not the image.
      if (e.clientX < bounds.left || e.clientX > bounds.right ||
          e.clientY < bounds.top || e.clientY > bounds.bottom) dialog.close();
    });
    let lastTap = 0;
    stage.addEventListener("pointerdown", e => {
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
      pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
      stage.setPointerCapture(e.pointerId);
      if (pointers.size === 2) {
        const [a,b] = [...pointers.values()];
        gesture = {type:"pinch", distance:distance(a,b), scale};
      } else if (pointers.size === 1) {
        gesture = {type:"pan", startX:e.clientX, startY:e.clientY, x, y};
      }
    });
    stage.addEventListener("pointermove", e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
      if (pointers.size === 2) {
        const [a,b] = [...pointers.values()];
        if (!gesture || gesture.type !== "pinch") gesture = {type:"pinch", distance:distance(a,b), scale};
        setZoom(gesture.scale * (distance(a,b) / Math.max(1, gesture.distance)));
      } else if (pointers.size === 1 && scale > 1 && gesture?.type === "pan") {
        x = gesture.x + e.clientX - gesture.startX;
        y = gesture.y + e.clientY - gesture.startY;
        paint();
      }
    });
    function endPointer(e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      gesture = null;
      if (pointers.size === 1) {
        const one = [...pointers.values()][0];
        gesture = {type:"pan", startX:one.x, startY:one.y, x, y};
      } else if (e.type === "pointerup" && e.pointerType === "touch") {
        const time = Date.now();
        if (time - lastTap < 310) { setZoom(scale > 1 ? 1 : 2.5); lastTap = 0; }
        else lastTap = time;
      }
    }
    stage.addEventListener("pointerup", endPointer);
    stage.addEventListener("pointercancel", endPointer);
    dialog.addEventListener("close", () => {
      dialog.remove();
      if (activeLightbox === dialog) activeLightbox = null;
      if (opener?.isConnected) opener.focus({preventScroll:true});
    }, {once:true});
    dialog.showModal();
    close.focus();
    paint();
  }
  function zoomableImage(img, label) {
    const button = n("button", "zoomable-image");
    button.type = "button";
    button.setAttribute("aria-label", "Enlarge image: " + (label || "Instruction screenshot"));
    append(button, img, n("span", "zoom-indicator", "Tap to enlarge"));
    button.addEventListener("click", () => {
      if (img.complete && img.naturalWidth > 0) openImageViewer(img.currentSrc || img.src, img.alt, button);
    });
    return button;
  }
  // Supporting resources can be a PDF, a configured slide image, or the same
  // PNG already shown inside an FAQ. Reusing the FAQ ID means a single image
  // file is shared between the article and its related training video.
  function slideMedia(item, isFaq = false) {
    const settings = isFaq ? {} : (mediaSettings[item.id] || {});
    const faqId = !isFaq && (item.slide?.faqId || settings.supportingFaqImage);
    const relatedFaq = faqId ? byId(data.faqs, faqId) : null;
    const imageBlocks = relatedFaq?.blocks?.filter(block => block.type === "image") || [];
    const imageIndex = Number.isInteger(settings.supportingFaqImageIndex)
        ? settings.supportingFaqImageIndex : 0;
    const referencedImage = imageBlocks[imageIndex];
    const card = n("section", "media-card supporting-resource");
    const media = isFaq ? item.slide : (item.slide?.src ? item.slide : item.pdf);
    const raw = media && media.src;
    const pdf = mediaUrl(raw, "pdf");
    const slideImage = mediaUrl(raw, "slide-image");
    const imageCandidates = referencedImage
        ? faqImageCandidates(referencedImage.src)
        : (slideImage ? [slideImage] : faqImageCandidates(raw));
    const isImage = imageCandidates.length > 0;
    card.setAttribute("aria-label", isFaq || isImage ? "Supporting slide" : "PDF slides");
    if (pdf) {
      const link = n("a", "resource-link");
      link.href = pdf;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      append(link, svg("file"), n("span", "", isFaq ? "View supporting slide (PDF)" : "View PDF slides"), svg("external", "small"));
      card.append(link);
      card.append(n("p", "video-fallback", "Opens in a separate tab so you can return to this article."));
    } else if (isImage) {
      const figure = n("figure", "slide-figure");
      const img = n("img", "slide-image");
      img.alt = referencedImage?.alt || media?.alt || "Supporting slide";
      img.loading = "lazy";
      img.decoding = "async";
      let attempt = 0;
      img.addEventListener("error", () => {
        attempt++;
        if (attempt < imageCandidates.length) {
          img.src = imageCandidates[attempt];
        } else {
          const fallback = n("div", "figure-placeholder");
          append(fallback, svg("file"), n("strong", "", "Supporting slide unavailable"),
              n("span", "", "Restore " + imageCandidates[0] + " or use the FAQ image folder."));
          figure.replaceChildren(fallback);
        }
      });
      figure.append(zoomableImage(img, img.alt));
      img.src = imageCandidates[0];
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
  function renderGuide(id, videoId = null) {
    const guide = byId(data.guides, id);
    if (!guide) return renderNotFound();
    const isGroup = Array.isArray(guide.videos);
    if (isGroup && !videoId) {
      // Video selector: the parent row has no player, only the chosen child does.
      append(app, back("guides", "All how-to guides"),
          crumbs([{route:"",label:"Home"},{route:"guides",label:"How-to guides"}]),
          head(null, guide.title));
      const list = rowList();
      guide.videos.forEach(video => list.append(row(
          "guides/" + guide.id + "/" + video.id, video.title, video.description,
          video.icon || guide.icon
      )));
      append(app, list, append(n("div", "after-content"), homeLink()));
      return;
    }
    const video = isGroup ? byId(guide.videos, videoId) : (!videoId ? guide : null);
    if (!video) return renderNotFound();
    const backRoute = isGroup ? "guides/" + guide.id : "guides";
    const breadcrumbItems = [
      {route:"", label:"Home"}, {route:"guides", label:"How-to guides"}
    ];
    if (isGroup) breadcrumbItems.push({route:backRoute,label:guide.title});
    append(app, back(backRoute, isGroup ? "All " + guide.title.toLowerCase() + " videos" : "All how-to guides"),
        crumbs(breadcrumbItems), head("Training guide", video.title));
    app.append(append(n("div", "media-grid"), videoMedia(video), slideMedia(video)));
    if (Array.isArray(video.topics) && video.topics.length) {
      const outline = n("section", "media-card guide-outline");
      outline.append(n("h2", "media-title", "What this video covers"));
      const topics = n("ul", "guide-topics");
      video.topics.forEach(topic => topics.append(n("li", "", topic)));
      outline.append(topics);
      app.append(outline);
    }
    const related = (video.relatedFaq || []).map(key => byId(data.faqs,key)).filter(Boolean)
        .map(faq => ({route:"faq/"+faq.id,title:faq.title}));
    app.append(relatedSection("Related questions", related));
    app.append(append(n("div", "after-content"), homeLink()));
  }
  // Single-level FAQ index: one icon and one question per row. The old
  // category route is preserved as a compatibility alias, but no categories are displayed.
  function renderFaqList() {
    append(app, back("", "Help Centre"), head(null, "Help & FAQs"));
    const list = rowList();
    data.faqs.forEach(faq => list.append(row("faq/" + faq.id, faq.title, null, faq.icon || "help", null)));
    append(app, list, append(n("div", "after-content"), homeLink()));
  }
  /**
   * Backwards-compatible paths for screenshots from the original Help Centre.
   * The original GitHub Pages site used images/FAQ/FAQ1.png etc.
   * The redesign uses assets/images/faq/FAQ1.png. Both are supported so that
   * existing images do not need to be moved or renamed.
   *
   * GitHub Pages is case-sensitive: FAQ and faq are different directories.
   */
  function faqImageCandidates(src) {
    if (typeof src !== "string") return [];
    const match = src.match(/^(?:assets\/images\/faq|images\/FAQ|images\/faq)\/([a-zA-Z0-9_-]+\.(?:png|jpe?g|webp))$/i);
    if (!match) return [];
    const filename = match[1];
    // Prefer the exact path specified by content.js, then try the legacy folder.
    return [...new Set([
      src,
      "images/FAQ/" + filename,
      "assets/images/faq/" + filename,
      "images/faq/" + filename
    ])];
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
        image.alt = block.alt || "Instruction screenshot";
        image.loading = "lazy";
        image.decoding = "async";
        const sources = faqImageCandidates(block.src);
        let candidateIndex = 0;
        image.addEventListener("error", () => {
          candidateIndex++;
          if (candidateIndex < sources.length) {
            image.src = sources[candidateIndex];
            return;
          }
          // If neither directory contains the screenshot, make the missing
          // file explicit rather than displaying a broken-image icon.
          const fallback = n("div", "figure-placeholder");
          append(fallback, svg("file"),
              n("strong", "", "Screenshot unavailable"),
              n("span", "", "Restore " + (sources[0] || String(block.src)) + " to the repository."));
          figure.replaceChildren(fallback);
        });
        if (sources.length) {
          image.src = sources[0];
          figure.append(zoomableImage(image, image.alt));
        } else {
          const fallback = n("div", "figure-placeholder");
          append(fallback, svg("file"), n("strong", "", "Screenshot unavailable"));
          figure.append(fallback);
        }
        return figure;
      }
      default: return null;
    }
  }
  // Full 41-slide reference guide from the original picking.html.
  // This deliberately uses the original images/Picking/SlideN.png file names:
  // no renaming or image duplication is required. Slide 2 was skipped in the
  // source guide. When a file is absent, show a small useful message instead
  // of a broken-image icon; restoring that image automatically fixes the slide.
  function renderFullSlideDeck(deck) {
    const first = Number(deck.first);
    const last = Number(deck.last);
    const skip = new Set(Array.isArray(deck.skip) ? deck.skip : []);
    const page = n("section", "full-slide-guide");
    page.setAttribute("aria-label", "Full picking app slide guide");
    const numbers = [];
    for (let slide = first; slide <= last; slide++) {
      if (!skip.has(slide)) numbers.push(slide);
    }
    page.append(n("p", "full-slide-guide-intro", numbers.length +
        " slides. Tap an image to enlarge it, then pinch to zoom."));
    const list = n("div", "full-slide-list");
    numbers.forEach(slide => {
      const figure = n("figure", "full-slide-item");
      figure.id = "picking-slide-" + slide;
      const img = n("img", "slide-image");
      img.alt = "Picking app guide — slide " + slide;
      img.loading = slide === first ? "eager" : "lazy";
      img.decoding = "async";
      // Use relative paths so this works on GitHub Pages project sites.
      img.src = "images/Picking/Slide" + slide + ".png";
      const caption = n("figcaption", "full-slide-caption", "Slide " + slide);
      img.addEventListener("error", () => {
        const unavailable = n("div", "full-slide-unavailable",
            "Slide " + slide + " image not available — add Slide" + slide +
            ".png to images/Picking/.");
        figure.replaceChildren(unavailable);
      }, {once:true});
      append(figure, zoomableImage(img, img.alt), caption);
      list.append(figure);
    });
    page.append(list);
    const returnLink = a("faq", "home-link");
    append(returnLink, svg("arrow-left", "small"), "Back to all FAQs");
    page.append(append(n("div", "after-content"), returnLink));
    return page;
  }
  function renderFaqArticle(id, legacyCategoryId = null) {
    const faq = byId(data.faqs, id);
    if (!faq || (legacyCategoryId && faq.category !== legacyCategoryId)) return renderNotFound();
    append(app, back("faq", "All FAQs"),
        crumbs([{route:"",label:"Home"},{route:"faq",label:"FAQs"}]),
        head("Help article", faq.title));
    if (faq.slideDeck) {
      app.append(renderFullSlideDeck(faq.slideDeck));
      app.append(append(n("div", "after-content"), homeLink()));
      return;
    }
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
    const hasArticleImages = (faq.blocks || []).some(block => block.type === "image");
    // Do not show a second 'Supporting slide coming soon' when the article
    // already contains a screenshot/slide. A configured PDF/image still shows.
    if (faq.id !== "contact-support-faq" && (!hasArticleImages || faq.slide?.src)) {
      app.append(slideMedia(faq, true));
    }
    const relatedGuides = (faq.relatedGuides || [])
        .map(key => videosById.get(key)).filter(Boolean)
        .map(item => ({route:item.route,title:item.video.title}));
    app.append(relatedSection("Related how-to guides", relatedGuides));
    app.append(append(n("div", "after-content"), homeLink()));
  }
  function renderNotFound() {
    append(app,back("", "Help Centre"),head("Not found", "We couldn't find that page",
        "The page may have moved or its link may be incorrect."), homeLink());
  }
  function route() {
    if (activeLightbox?.open) activeLightbox.close();
    // All navigation is anchored within index.html; GitHub Pages needs no rewrites.
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const safe = parts.length <= 3 && parts.every(part => /^[a-z0-9-]+$/.test(part));
    app.replaceChildren();
    if (!safe) renderNotFound();
    else if (parts.length === 0) renderHome();
    else if (parts.length === 1 && parts[0] === "support") renderSupport();
    else if (parts.length === 1 && parts[0] === "guides") renderGuides();
    else if (parts.length === 2 && parts[0] === "guides") renderGuide(parts[1]);
    else if (parts.length === 3 && parts[0] === "guides") renderGuide(parts[1], parts[2]);
    else if (parts.length === 1 && parts[0] === "faq") renderFaqList();
    else if (parts.length === 2 && parts[0] === "faq") {
      // Support old FAQ category bookmarks while keeping a flat UI.
      if (byId(data.faqs, parts[1])) renderFaqArticle(parts[1]);
      else if (data.faqs.some(faq => faq.category === parts[1])) location.replace(href("faq"));
      else renderNotFound();
    }
    else if (parts.length === 3 && parts[0] === "faq") renderFaqArticle(parts[2],parts[1]);
    else renderNotFound();
    const title = app.querySelector("h1");
    document.title = (title ? title.textContent + " | " : "") + "Rynly Help Centre";
    window.scrollTo(0,0);
  }
  window.addEventListener("hashchange",route);
  route();
})();
