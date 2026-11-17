/* Rynly Help Centre — Pages CMS JSON loader.
 * All editable content lives in /content/*.json. No external API or build step.
 * Stable paths work on localhost and project-scoped GitHub Pages URLs.
 */
(async function () {
  'use strict';
  const routes = ['site', 'support', 'guides', 'faqs', 'sections'];
  const prefix = 'content/';
  const loading = document.getElementById('app');
  const safeId = value => typeof value === 'string' && /^[a-z0-9-]+$/.test(value);

  // Pages CMS writes public media paths with a leading / and the repo base.
  // The app needs repository-relative paths, both locally and on Pages.
  function assetPath(raw) {
    if (typeof raw !== 'string') return raw;
    const value = raw.trim();
    if (!value || /^https?:\/\//i.test(value)) return value;
    const unprefixed = value.replace(/^\/+/, '').replace(/^Rynly-Picking-App-HelpCentre-Sandbox\//i,'');
    if (/^(?:assets\/(?:images|pdf|videos|uploads)\/|images\/(?:FAQ|Picking)\/)/.test(unprefixed)
        && !unprefixed.split('/').includes('..') && !/[?#]/.test(unprefixed)) {
      return unprefixed;
    }
    return value;
  }
  function normaliseFaq(faq) {
    faq.blocks = Array.isArray(faq.blocks) ? faq.blocks : [];
    faq.blocks.forEach(block => {
      if (block?.type === 'image') block.src = assetPath(block.src);
    });
    if (faq.slide) faq.slide.src = assetPath(faq.slide.src);
    return faq;
  }
  // Editors can paste a full video URL instead of extracting an ID by hand.
  // Only trusted YouTube/Vimeo hosts are accepted; arbitrary URLs never embed.
  function videoIdFromUrl(video) {
    if (!video || typeof video.id !== 'string' || !/^https:\/\//i.test(video.id.trim())) return;
    try {
      const u = new URL(video.id.trim());
      const host = u.hostname.toLowerCase();
      if (video.type === 'youtube' && ['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be','www.youtu.be'].includes(host)) {
        const parts=u.pathname.split('/').filter(Boolean);
        const id=host.endsWith('youtu.be') ? parts[0] :
          (u.searchParams.get('v') || (['shorts','embed','live'].includes(parts[0]) ? parts[1] : ''));
        if (/^[A-Za-z0-9_-]{11}$/.test(id||'')) video.id=id;
      } else if(video.type === 'vimeo' && ['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(host)) {
        const parts=u.pathname.split('/').filter(Boolean);
        const id=parts.find(p=>/^\d{6,15}$/.test(p));
        const possibleHash=u.searchParams.get('h') || parts.find(p=>/^[0-9a-f]{8,40}$/i.test(p));
        if (id) {video.id=id;if(possibleHash) video.hash=possibleHash;}
      }
    } catch (_) { /* An invalid link simply does not create an embed. */ }
  }
  function normaliseVideo(guide) {
    if (guide.video) {
      videoIdFromUrl(guide.video);
      guide.video.src = assetPath(guide.video.src);
      guide.video.poster = assetPath(guide.video.poster);
    }
    if (guide.pdf) guide.pdf.src = assetPath(guide.pdf.src);
    if (guide.slide) guide.slide.src = assetPath(guide.slide.src);
    return guide;
  }
  const fail = message => {
    console.error('Rynly Help Centre: content failed to load', message);
    if (!loading) return;
    const box = document.createElement('div');
    box.className='content-load-error';
    const heading=document.createElement('h1');
    heading.textContent='Help Centre unavailable';
    const description=document.createElement('p');
    description.textContent='The site could not load its content. Check your connection or refresh the page. If you are opening this site locally, use the local web server rather than opening index.html as a file.';
    const button=document.createElement('button');
    button.type='button';button.textContent='Try again';button.addEventListener('click',()=>location.reload());
    box.append(heading,description,button);loading.replaceChildren(box);
  };
  function loadScript(source) {
    return new Promise((resolve,reject) => {
      const script=document.createElement('script');
      script.src=source;
      script.onload=resolve;
      script.onerror=()=>reject(new Error('Unable to load '+source));
      document.head.append(script);
    });
  }
  try {
    const entries = await Promise.all(routes.map(async name => {
      const response = await fetch(prefix + name + '.json', {cache:'no-cache',credentials:'same-origin'});
      if (!response.ok) throw new Error(name+'.json returned '+response.status);
      return [name, await response.json()];
    }));
    const content=Object.fromEntries(entries);
    // The CMS editor stores repeatable records in {items:[...]}, allowing
    // descriptive collapsed headings. Old array files remain readable during rollout.
    function records(value, name) {
      if (Array.isArray(value)) return value;
      if (value && typeof value === 'object' && Array.isArray(value.items)) return value.items;
      throw new Error('Invalid CMS list: ' + name);
    }
    for (const name of ['faqs','guides','support','sections']) content[name] = records(content[name],name);
    if (typeof content.site !== 'object' || content.site === null || Array.isArray(content.site)) {
      throw new Error('Invalid CMS site settings');
    }
    const unique=new Set();
    function verify(items,name) {
      for (const entry of items) {
        if (!safeId(entry?.id) || unique.has(name+'/'+entry.id))
          throw new Error('Invalid or duplicate '+name+' ID: '+entry?.id);
        unique.add(name+'/'+entry.id);
      }
    }
    verify(content.faqs,'faq');verify(content.guides,'guide');
    // Hiding an FAQ section hides its questions unless another visible
    // section also contains them. Standalone/ungrouped FAQs remain listed.
    const sections=content.sections.filter(s=>s.published!==false);
    const visibleSectionIds=new Set(sections.flatMap(s=>Array.isArray(s.ids)?s.ids:[]));
    const hiddenSectionIds=new Set(content.sections.filter(s=>s.published===false)
      .flatMap(s=>Array.isArray(s.ids)?s.ids:[])
      .filter(id=>!visibleSectionIds.has(id)));
    const faqs=content.faqs.filter(f=>f.published!==false&&!hiddenSectionIds.has(f.id)).map(normaliseFaq);
    const guides=content.guides.filter(g=>g.published!==false).map(g=> {
      if (Array.isArray(g.videos)) {
        g.videos=g.videos.filter(v=>v.published!==false);
        verify(g.videos,'video');
      }
      return normaliseVideo(g);
    }).filter(g=>!Array.isArray(g.videos)||g.videos.length>0);
    guides.forEach(g=>g.videos?.forEach(normaliseVideo));
    window.RYNLY_CONTENT = {site:content.site,faqs,guides,
      support:content.support.filter(s=>s.published!==false)};
    window.RYNLY_CONFIG = Object.freeze({
      siteName:content.site.siteName || 'Rynly Picking App Help Centre',
      supportEmail:content.site.supportEmail || 'support@rynly.com',
      searchEnabled:true
    });
    window.RYNLY_FAQ_SECTIONS = sections;
    // Source files use a predictable version; the individual content JSON files
    // revalidate on each load, so an editor doesn't have to change version numbers.
    await loadScript('assets/js/app.js?v=15');
    await loadScript('assets/js/search.js?v=12');
  } catch(error) {
    fail(error);
  }
})();
