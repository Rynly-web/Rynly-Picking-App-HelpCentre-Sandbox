/* Rynly Help Centre search — zero dependencies and no external requests.
 * Indexes authored page text from content.js (including FAQs, nested videos,
 * topic descriptions, support contacts and notices). It does not OCR images or
 * extract text from externally hosted videos or embedded PDF files.
 * Search remains available on every route; at most three unique pages display.
 */
(function () {
  'use strict';
  const data = window.RYNLY_CONTENT;
  const searchForm = document.getElementById('help-search');
  const input = document.getElementById('site-search');
  const clearButton = document.getElementById('search-clear');
  const resultsEl = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const container = document.querySelector('.search-region');
  if (!data || !searchForm || !input || !resultsEl || !status || !container) return;

  // Searchable, static data only. No network request, cookies or external index.
  // Page titles are authoritative; descriptions and article text are supporting evidence.
  const normalise = value => String(value ?? '').toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

  // Instructions like "how do I" describe a question, not the topic being searched.
  // Ignoring them fixes searches such as "How to pick an order" -> "Pick an order".
  const stopWords = new Set([
    'a','an','and','are','as','at','be','by','can','could','do','does','for',
    'from','how','i','in','into','is','it','me','my','of','on','or','our','please',
    'should','the','this','to','us','was','what','when','where','which','who',
    'why','will','with','would','you','your','not','dont','wont','show','see','find'
  ]);
  const variants = {
    substitutes:'substitution', substitution:'substitution', substitutions:'substitution',
    substituted:'substitution', substitute:'substitution', subs:'substitution', subbed:'substitution',
    picking:'pick', picked:'pick', picker:'pick', pickers:'pick', picks:'pick',
    packing:'pack', packed:'pack', packages:'pack', packaging:'pack',
    scans:'scan', scanned:'scan', scanner:'scan', scanners:'scan', scanning:'scan',
    bags:'bag', bagging:'bag',
    orders:'order', ordering:'order',
    cancellations:'cancel', cancellation:'cancel', cancelled:'cancel',
    canceled:'cancel', cancelling:'cancel', canceling:'cancel',
    completes:'complete', completed:'complete', completing:'complete', completion:'complete',
    finishing:'complete', finished:'complete', finish:'complete',
    couriers:'courier', drivers:'driver',
    payments:'payment', paid:'payment',
    notifications:'alert', notification:'alert', alerts:'alert',
    alarm:'alert', alarms:'alert',
    issues:'issue', problems:'issue', problem:'issue',
    troubleshooting:'troubleshoot', troubleshoots:'troubleshoot',
    devices:'device', phone:'device', phones:'device',
    ringing:'ring', rings:'ring',
    stores:'store', accounts:'account',
    logging:'login', logged:'login', login:'login', logins:'login', log:'login', signed:'login', sign:'login', signin:'login',
    videos:'video', tutorials:'guide',
  };
  const canonical = word => {
    if (variants[word]) return variants[word];
    if (word.length > 5 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.length > 5 && word.endsWith('ing')) {
      const base = word.slice(0, -3);
      return variants[base] || base;
    }
    if (word.length > 5 && word.endsWith('ed')) {
      const base = word.slice(0, -2);
      return variants[base] || base;
    }
    if (word.length > 4 && word.endsWith('s')) return word.slice(0, -1);
    return word;
  };
  const tokens = value => normalise(value).split(' ')
      .filter(word => word && !stopWords.has(word))
      .map(canonical);
  const unique = value => [...new Set(value)];
  const flatten = value => {
    if (value == null) return [];
    if (typeof value === 'string' || typeof value === 'number') return [String(value)];
    if (Array.isArray(value)) return value.flatMap(flatten);
    // Extract visible authored words, not IDs, image filenames or URLs.
    if (typeof value === 'object') return [
      'title','description','videoText','topics','blocks','text','items',
      'label','alt','name','phone','intro','subtitle'
    ].flatMap(key => flatten(value[key]));
    return [];
  };

  const docs = [];
  const add = (route, title, description, body, weight = 1) => {
    const titleTokens = tokens(title);
    const descriptionTokens = tokens(description);
    const bodyTokens = tokens(body);
    docs.push({
      route, title, weight,
      titlePhrase: titleTokens.join(' '),
      descriptionPhrase: descriptionTokens.join(' '),
      bodyPhrase: bodyTokens.join(' '),
      titleTerms: unique(titleTokens),
      descriptionTerms: unique(descriptionTokens),
      bodyTerms: unique(bodyTokens),
    });
  };
  add('', 'Help Centre', 'Help and training for the Rynly picking app', '', .2);
  add('support', 'Contact support', 'Partner telephone numbers and Rynly support email', [
    ...(data.support || []).flatMap(item => [item.name, item.description || '', item.phone || '']),
    'Rynly support email support@rynly.com please CC ondemand@sainsburys.co.uk',
    'Order problems extra drivers store availability technical service desk'
  ].join(' '));
  add('guides', 'How-to guides', 'Picking app training guides videos and demonstrations', '', .4);
  add('faq', 'Help & FAQs', 'Answers to picking app questions and troubleshooting', '', .4);
  (data.guides || []).forEach(guide => {
    const route = 'guides/' + guide.id;
    const guideBody = [guide.videoText, guide.topics, guide.videos ? 'Choose a video topic' : '']
        .flatMap(flatten).join(' ');
    if (Array.isArray(guide.videos)) {
      add(route, guide.title, guide.description, guideBody, .85);
      guide.videos.forEach(video => add(route + '/' + video.id,
          video.title, video.description, [video.videoText, video.topics].flatMap(flatten).join(' '), 1.05));
    } else {
      add(route, guide.title, guide.description, guideBody, 1.05);
    }
  });
  (data.faqs || []).forEach(faq => add('faq/' + faq.id, faq.title, '',
      [flatten(faq.blocks).join(' '), faq.slideDeck ? 'Full 41 slide picking app guide training reference' : ''].join(' '), 1.07));

  // One-character typo tolerance for substantial words, without large dependencies.
  function editDistanceAtMostOne(a, b) {
    if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, changes = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++changes > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    return changes + Number(i < a.length || j < b.length) <= 1;
  }
  function matchStrength(term, available) {
    if (available.includes(term)) return 3;
    if (term.length >= 3 && available.some(word => word.startsWith(term))) return 2;
    if (available.some(word => editDistanceAtMostOne(term, word))) return 1;
    return 0;
  }
  function search(query) {
    if (normalise(query).length < 2) return [];
    const requested = tokens(query);
    const terms = unique(requested);
    if (!terms.length) return []; // e.g. "how do I" is not a useful search.
    const phrase = requested.join(' ');
    const minimumMatches = terms.length <= 2 ? terms.length : Math.ceil(terms.length * .7);

    return docs.map(doc => {
      let score = 0;
      let matches = 0;
      let titleMatches = 0;
      for (const term of terms) {
        const title = matchStrength(term, doc.titleTerms);
        const description = matchStrength(term, doc.descriptionTerms);
        const body = matchStrength(term, doc.bodyTerms);
        const strength = Math.max(title, description, body);
        if (!strength) continue;
        matches++;
        if (title) {
          titleMatches++;
          score += 19 * title;
        } else if (description) score += 7 * description;
        else score += 3 * body;
      }
      if (matches < minimumMatches) return null;

      // Strong preference for a title that is the topic the user has asked for.
      // Compare after removing question filler ("how to") and normalising words.
      if (doc.titlePhrase === phrase) score += 260;
      else if (phrase.length >= 4 && (' ' + doc.titlePhrase + ' ').includes(' ' + phrase + ' ')) score += 115;
      else if (phrase.length >= 4 && doc.bodyPhrase.includes(phrase)) score += 22;
      else if (phrase.length >= 4 && doc.descriptionPhrase.includes(phrase)) score += 12;
      score += 28 * (titleMatches / terms.length);
      score += 22 * (titleMatches / Math.max(1, doc.titleTerms.length));
      if (matches < terms.length) score *= Math.pow(matches / terms.length, 2);
      return { doc, score: score * doc.weight };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
        .slice(0, 3).map(result => result.doc);
  }

  let visible = [];
  let active = -1;
  let composing = false;
  let dismissed = false;
  const close = () => {
    visible = []; active=-1;
    resultsEl.replaceChildren();
    resultsEl.hidden = true;
    input.setAttribute('aria-expanded','false');
    input.removeAttribute('aria-activedescendant');
  };
  function selectActive(index) {
    active = Math.min(Math.max(index,0), visible.length-1);
    [...resultsEl.querySelectorAll('[role="option"]')].forEach((option,i) => {
      option.setAttribute('aria-selected', String(i===active));
    });
    if (active>=0) input.setAttribute('aria-activedescendant','help-search-option-'+active);
  }
  function go(route) {
    close();
    input.value = '';
    clearButton.hidden = true;
    dismissed = false;
    input.blur();
    const target = '#/' + route;
    if (location.hash === target || (!location.hash && !route)) {
      window.scrollTo(0,0);
      document.getElementById('app')?.focus({preventScroll:true});
    } else location.hash = target;
  }
  function render() {
    const query = input.value.trim();
    clearButton.hidden = query.length===0;
    if (query.length<2 || dismissed) { close(); status.textContent = ''; return; }
    visible = search(query);
    active=-1;
    resultsEl.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement('li');
      empty.className='search-empty';
      empty.textContent='No matching pages';
      empty.setAttribute('role','presentation');
      resultsEl.append(empty);
    } else visible.forEach((doc,i) => {
      const item = document.createElement('li');
      item.className='search-result';
      item.id='help-search-option-'+i;
      item.setAttribute('role','option');
      item.setAttribute('aria-selected','false');
      const link = document.createElement('a');
      link.href='#/'+doc.route;
      link.textContent=doc.title; // Only the page title appears in results.
      link.addEventListener('click', event => { event.preventDefault(); go(doc.route); });
      item.append(link); resultsEl.append(item);
    });
    resultsEl.hidden=false;
    input.setAttribute('aria-expanded','true');
    input.removeAttribute('aria-activedescendant');
    status.textContent=visible.length ? visible.length + ' matching page' + (visible.length===1?'':'s') : 'No matching pages';
  }
  input.addEventListener('compositionstart', () => { composing=true; });
  input.addEventListener('compositionend', () => { composing=false; dismissed=false; render(); });
  input.addEventListener('input', () => { if (!composing) { dismissed=false; render(); } });
  input.addEventListener('focus', () => { dismissed=false; render(); });
  input.addEventListener('keydown', event => {
    if (composing || event.isComposing) return;
    if (event.key==='Escape') {
      if (!resultsEl.hidden) { event.preventDefault(); dismissed=true; close(); }
      else { input.blur(); }
    } else if ((event.key==='ArrowDown' || event.key==='ArrowUp') && visible.length && !resultsEl.hidden) {
      event.preventDefault();
      selectActive(event.key==='ArrowDown' ? (active+1)%visible.length : (active<0?visible.length-1:(active-1+visible.length)%visible.length));
    } else if (event.key==='Enter') {
      event.preventDefault();
      if (visible.length && !resultsEl.hidden) go(visible[active>=0?active:0].route);
    }
  });
  clearButton.addEventListener('click', () => {
    input.value=''; dismissed=false; close(); clearButton.hidden=true; status.textContent=''; input.focus();
  });
  searchForm.addEventListener('submit',event => event.preventDefault());
  document.addEventListener('pointerdown',event => {
    if (!container.contains(event.target)) { dismissed=true; close(); }
  });
  const reset = () => {
    close();
    input.value=''; clearButton.hidden=true; dismissed=false; status.textContent='';
    if (document.activeElement===input) input.blur();
  };
  window.addEventListener('hashchange',reset);
  window.addEventListener('pageshow',event => { if (event.persisted) reset(); });
  // UI instrumentation for local tests; no public API or external telemetry.
  window.RYNLY_SEARCH_TEST = {search};
})();
