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

  // Search stays entirely on-device. No external index or API calls.
  // Titles > editorial keywords > descriptions > long article body.
  const extra = window.RYNLY_SEARCH_KEYWORDS || {};
  const normalise = value => String(value ?? '').toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  const stopWords = new Set([
    'a','an','and','are','as','at','be','by','can','could','do','does',
    'for','from','how','i','in','into','is','it','me','my','of','on','or',
    'our','please','should','the','this','to','us','was','what','when',
    'where','which','who','why','will','with','would','you','your',
    'show','see','find','tell','about'
  ]);
  const variants = {
    picks:'pick', picked:'pick', picking:'pick', picker:'pick', pickers:'pick',
    packing:'pack', packed:'pack', packaging:'pack', packages:'pack',
    scans:'scan', scanned:'scan', scanners:'scan', scanning:'scan',
    substitutes:'substitution', substitute:'substitution', substituted:'substitution',
    substitutions:'substitution', subs:'substitution', subbed:'substitution',
    bags:'bag', bagging:'bag', orders:'order', ordering:'order',
    cancelling:'cancel', canceling:'cancel', cancelled:'cancel', canceled:'cancel',
    cancellation:'cancel', cancellations:'cancel',
    completing:'complete', completed:'complete', completion:'complete',
    finishing:'complete', finish:'complete', finished:'complete',
    couriers:'courier', drivers:'driver', riders:'rider',
    payments:'payment', paid:'payment',
    notifications:'alert', notification:'alert', alarms:'alert', alarm:'alert', alerts:'alert',
    issues:'issue', problems:'issue', problem:'issue',
    troubleshooting:'troubleshoot', troubleshoots:'troubleshoot',
    devices:'device', phones:'device', phone:'device',
    rings:'ring', ringing:'ring',
    stores:'store', accounts:'account',
    login:'login', logins:'login', logging:'login', logged:'login',
    signin:'login', signed:'login', sign:'login',
    closes:'closure', close:'closure', closed:'closure', closing:'closure',
    closure:'closure', closures:'closure', clousure:'closure',
    clousre:'closure', clossure:'closure',
    pausing:'pause', paused:'pause', suspending:'suspend', suspended:'suspend',
    deliveries:'delivery', videos:'video', tutorials:'guide'
  };
  function canonical(word) {
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
  }
  const tokens = value => normalise(value).split(' ')
      .filter(word => word && !stopWords.has(word)).map(canonical);
  const unique = values => [...new Set(values)];
  function flatten(value) {
    if (value == null) return [];
    if (typeof value === 'string' || typeof value === 'number') return [String(value)];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (typeof value === 'object') return [
      'title','description','videoText','topics','blocks','text','items',
      'label','alt','name','phone','intro','subtitle'
    ].flatMap(key => flatten(value[key]));
    return [];
  }
  const phraseOf = value => tokens(value).join(' ');
  function field(value) {
    const parts = tokens(value);
    return {terms:unique(parts), phrase:parts.join(' ')};
  }
  const docs = [];
  function add(route, title, description='', body='', weight=1) {
    const keywords = Array.isArray(extra[route]) ? extra[route].filter(x=>typeof x==='string') : [];
    const aliases = keywords.map(phraseOf).filter(Boolean);
    const keywordField = field(keywords.join(' '));
    docs.push({
      route, title, weight, aliases,
      titleField:field(title), keywordField,
      descriptionField:field(description), bodyField:field(body)
    });
  }
  add('', 'Help Centre', 'Help and training for the Rynly picking app', '', .25);
  add('support', 'Contact support', 'Partner telephone numbers and Rynly support email', [
    ...(data.support || []).flatMap(item => [item.name, item.description || '', item.phone || '']),
    'Rynly support email support@rynly.com CC ondemand@sainsburys.co.uk',
    'Technical service desk, marketplace contact details'
  ].join(' '), 1.25);
  add('guides', 'How-to guides', 'Rynly picking app training videos and demonstrations', '', .5);
  add('faq', 'Help & FAQs', 'Answers to picking app questions and troubleshooting', '', .5);
  (data.guides || []).forEach(guide => {
    const route='guides/'+guide.id;
    const body=[guide.videoText,guide.topics].flatMap(flatten).join(' ');
    if (Array.isArray(guide.videos)) {
      // A group is a real page; index it, but let its specific videos rank higher.
      add(route,guide.title,guide.description,body,.88);
      guide.videos.forEach(video => add(route+'/'+video.id, video.title,
          video.description,[video.videoText,video.topics].flatMap(flatten).join(' '),1.08));
    } else add(route,guide.title,guide.description,body,1.08);
  });
  (data.faqs || []).forEach(faq => add('faq/'+faq.id,faq.title,'',[
    flatten(faq.blocks).join(' '),
    faq.slideDeck ? 'Full 41 slide picking app guide training reference' : ''
  ].join(' '),1.12));

  // Bounded Levenshtein for one- or two-letter errors, NOT entire large bodies.
  // At most 2 changes for 7+ character terms; short words remain strict.
  function near(a,b,max) {
    if (Math.abs(a.length-b.length)>max) return false;
    let previous=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++) {
      const next=[i];
      let rowMin=next[0];
      for(let j=1;j<=b.length;j++) {
        const cost=a[i-1]===b[j-1]?0:1;
        next[j]=Math.min(previous[j]+1,next[j-1]+1,previous[j-1]+cost);
        rowMin=Math.min(rowMin,next[j]);
      }
      if(rowMin>max) return false;
      previous=next;
    }
    return previous[b.length]<=max;
  }
  function strength(term, terms, fuzzy) {
    if (terms.includes(term)) return 3;
    if (term.length>=3 && terms.some(t=>t.startsWith(term))) return 2;
    if (fuzzy && term.length>=5) {
      const distance=term.length>=7 ? 2 : 1;
      if (terms.some(t=>t.length>=5 && near(term,t,distance))) return 1;
    }
    return 0;
  }
  function search(query) {
    if (normalise(query).length<2) return [];
    const requested=tokens(query);
    const terms=unique(requested);
    if (!terms.length) return [];
    const phrase=requested.join(' ');
    // Require both words of a two-term query; allow one missing word in longer sentences.
    const minimum=terms.length<=2?terms.length:Math.ceil(terms.length*.75);
    const results=[];
    for(const doc of docs) {
      let matches=0, titleMatches=0, keywordMatches=0, score=0;
      for(const term of terms) {
        const t=strength(term,doc.titleField.terms,true);
        const k=strength(term,doc.keywordField.terms,true);
        const d=strength(term,doc.descriptionField.terms,false);
        const b=strength(term,doc.bodyField.terms,false);
        if(!Math.max(t,k,d,b)) continue;
        matches++;
        if(t) { titleMatches++; score+=65*t; }
        else if(k) { keywordMatches++; score+=32*k; }
        else if(d) score+=12*d;
        else score+=5*b;
      }
      if(matches<minimum) continue;
      if(doc.titleField.phrase===phrase) score+=520;
      else if (doc.aliases.includes(phrase)) score+=380;
      else if (phrase.length>=4 && (' '+doc.titleField.phrase+' ').includes(' '+phrase+' ')) score+=160;
      else if (phrase.length>=4 && doc.aliases.some(alias=>(' '+alias+' ').includes(' '+phrase+' '))) score+=85;
      else if (phrase.length>=4 && doc.descriptionField.phrase.includes(phrase)) score+=20;
      else if (phrase.length>=4 && doc.bodyField.phrase.includes(phrase)) score+=10;
      score+=40*(titleMatches/terms.length);
      score+=20*(keywordMatches/terms.length);
      if(matches<terms.length) score*=Math.pow(matches/terms.length,2);
      results.push({doc,score:score*doc.weight});
    }
    return results.sort((a,b)=>b.score-a.score||a.doc.title.localeCompare(b.doc.title))
        .slice(0,3).map(result=>({route:result.doc.route,title:result.doc.title}));
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
