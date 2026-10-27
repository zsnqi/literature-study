/* app-core.js — core of the literature study app («الأدب الإنجليزي»).
   Load order: data.js, data-questions.js, data-poems.js, app-core.js, app-practice.js, app-more.js.
   Owns: state, theme, navigation (tabs, pushed pages, history), the Today tab («طريق الدرجات»),
   the Lessons tab, the lesson page and its text blocks, banners, sheets and toasts,
   and the registry the other modules plug into.
   Data: window.PH (the data files, read-only).  API: window.App.  Contract: docs/app-api.md. */
(function () {
'use strict';

var D = window.PH || {};
var App = {};
window.App = App;
var doc = document;
var hasOwn = Object.prototype.hasOwnProperty;

/* =====================================================================
   1. Small utilities
   ===================================================================== */
var SVGNS = 'http://www.w3.org/2000/svg';

function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
function arr(x) { return Array.isArray(x) ? x : []; }
function clamp01(x) { x = +x || 0; return x < 0 ? 0 : (x > 1 ? 1 : x); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }

function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function setAttrs(node, attrs) {
  Object.keys(attrs).forEach(function (k) {
    var v = attrs[k];
    if (v == null || v === false) return;
    if (k === 'class' || k === 'className') node.setAttribute('class', v);
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'rich') node.innerHTML = rich(v);
    else if (k === 'richText') node.innerHTML = richText(v);
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && isObj(v)) {
      Object.keys(v).forEach(function (p) {
        if (p.indexOf('-') > -1) node.style.setProperty(p, v[p]); else node.style[p] = v[p];
      });
    }
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value' && 'value' in node) node.value = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
}
function addKid(node, c) {
  if (c == null || c === false || c === true) return;
  if (Array.isArray(c)) { for (var i = 0; i < c.length; i++) addKid(node, c[i]); return; }
  if (typeof c === 'object' && c.nodeType) node.appendChild(c);
  else node.appendChild(doc.createTextNode(String(c)));
}
function fill(node, args) {
  var i = 1, a = args[1];
  if (a === null || a === undefined) i = 2;
  else if (isObj(a) && !a.nodeType) { setAttrs(node, a); i = 2; }
  for (; i < args.length; i++) addKid(node, args[i]);
  return node;
}
/* h('div', {class:'card', onclick: fn}, child, 'text', [more]) */
function h(tag) { return fill(doc.createElement(tag), arguments); }
/* svg('circle', {cx: 4, cy: 4, r: 2}) — same as h() but in the SVG namespace */
function svg(tag) { return fill(doc.createElementNS(SVGNS, tag), arguments); }

/* ----- mixed-direction text -----
   rich(html): every run of Latin characters inside Arabic text (with its internal spaces and
   punctuation) is wrapped in <bdi dir="ltr" class="en">, and source labels
   (.t-pg "L2 · شريحة 3", "L3 · ص 6") are rebuilt with each part isolated. */
var RICH_RE = /[\/\[(]*[A-Za-zÀ-ɏɐ-˿̀-ͯͰ-Ͽᴀ-ᶿḀ-ỿ](?:[A-Za-zÀ-ɏɐ-˿̀-ͯͰ-Ͽᴀ-ᶿḀ-ỿ0-9  .,'’\-–\/()\[\]+&=≠→·…:;!?]*[A-Za-zÀ-ɏɐ-˿̀-ͯͰ-Ͽᴀ-ᶿḀ-ỿ0-9\/)\]])?/g;
var RICH_HINT = /[A-Za-zÀ-Ͽᴀ-ỿ]/;
var RICH_SKIP_TAG = /^(BDI|CODE|PRE|SCRIPT|STYLE|TEXTAREA|SVG)$/i;
var RICH_SKIP_CLASS = /(^|\s)(t-en|t-ipa|en|en-pill|ltr|ltrx|word)(\s|$)/;
var PG_RE = /^\s*(L\d|P)\s*(?:·\s*(ص|شريحة)\s*(.+?))?\s*$/;
/* L1 and L2 are slide decks («شريحة»); L3 (a PDF) and the poem document (P) have pages («ص»). */
function pgWord(lec) { return lec === 'L1' || lec === 'L2' ? 'شريحة' : 'ص'; }
/* pages may list several places: '14، ص15' or '3, 5' → «ص 14، ص 15»; each part keeps its own word if it has one */
function pgParts(lec, pages, word) {
  var out = [h('bdi', { dir: 'ltr' }, lec)];
  if (pages != null && String(pages) !== '') {
    out.push(' · ');
    var w0 = word || pgWord(lec), box = h('bdi', { dir: 'rtl' });
    String(pages).split(/\s*[،,]\s*/).forEach(function (part, i) {
      var m = /^(ص|شريحة)?\s*(.+)$/.exec(part.trim());
      if (!m) return;
      if (i) box.appendChild(doc.createTextNode('، '));
      box.appendChild(doc.createTextNode((m[1] || w0) + ' '));
      box.appendChild(h('bdi', { dir: 'ltr' }, m[2]));
    });
    out.push(box);
  }
  return out;
}
function pgEl(lec, page, word) { return h('span', { class: 't-pg' }, pgParts(lec, page, word)); }
function srcEl(str) {
  var m = PG_RE.exec(String(str == null ? '' : str));
  return m ? pgEl(m[1], m[3], m[2]) : h('span', { class: 't-pg' }, h('bdi', null, String(str == null ? '' : str)));
}
function richSkip(el, root) {
  for (var n = el; n && n !== root && n.nodeType === 1; n = n.parentNode) {
    if (RICH_SKIP_TAG.test(n.nodeName) || n.hasAttribute('dir')) return true;
    if (RICH_SKIP_CLASS.test(n.getAttribute('class') || '')) return true;
  }
  return false;
}
function richify(root) {
  if (!root || !root.querySelectorAll) return root;
  var pgs = root.querySelectorAll('.t-pg');
  for (var i = 0; i < pgs.length; i++) {
    var p = pgs[i], m = PG_RE.exec(p.textContent);
    if (m && !p.querySelector('bdi')) { p.textContent = ''; addKid(p, pgParts(m[1], m[3], m[2])); }
  }
  var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach(function (t) {
    var str = t.nodeValue;
    if (!str || !RICH_HINT.test(str) || richSkip(t.parentNode, root)) return;
    var frag = null, last = 0, m2;
    RICH_RE.lastIndex = 0;
    while ((m2 = RICH_RE.exec(str))) {
      if (!frag) frag = doc.createDocumentFragment();
      if (m2.index > last) frag.appendChild(doc.createTextNode(str.slice(last, m2.index)));
      frag.appendChild(h('bdi', { dir: 'ltr', class: 'en' }, m2[0]));
      last = m2.index + m2[0].length;
    }
    if (!frag) return;
    if (last < str.length) frag.appendChild(doc.createTextNode(str.slice(last)));
    t.parentNode.replaceChild(frag, t);
  });
  return root;
}
function rich(html) {
  var t = doc.createElement('template');
  t.innerHTML = html == null ? '' : String(html);
  richify(t.content);
  return t.innerHTML;
}
function richText(text) { return rich(esc(text)); }

var ICONS = {
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.1M4 12h.1M4 18h.1"/></svg>',
  back: '<svg viewBox="0 0 13 21" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5l8 8-8 8"/></svg>',
  chev: '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg>',
  down: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 5l4.5 4.5L11.5 5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" opacity=".16"/><path d="M7.4 12.4l3.1 3.1 6.1-6.6"/></svg>',
  checkFill: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.4 12.4l3.1 3.1 6.1-6.6" fill="none" style="stroke:var(--acc-card,var(--bg))" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5" fill="currentColor" fill-opacity=".25"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor" stroke="none"/></svg>',
  close: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M7.5 10H6a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18 10h-1.5"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r="1" fill="currentColor" stroke="none"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4.5h4.5"/></svg>',
  mock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M10 2.5h4M12 2.5V6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="M9 14l2 2 4-4.5"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
  dot: '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="3" fill="currentColor"/></svg>',
  tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3l2.3 2.3 4.7-5"/></svg>',
  cross: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"/></svg>',
  star: '<svg viewBox="0 0 12 12"><path d="M6 1.2l1.45 3 3.3.45-2.4 2.3.6 3.25L6 8.65 3.05 10.2l.6-3.25-2.4-2.3 3.3-.45z" fill="currentColor"/></svg>'
};
function icon(name, cls) {
  var str = ICONS[name];
  if (!str) return null;
  var t = doc.createElement('template');
  t.innerHTML = str;
  var n = t.content.firstElementChild;
  if (cls) n.setAttribute('class', cls);
  n.setAttribute('aria-hidden', 'true');
  n.setAttribute('focusable', 'false');
  return n;
}

function shuffle(a0) {
  var a = (a0 || []).slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function sample(a0, n) { return shuffle(a0).slice(0, n); }

var motionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function reducedMotion() { return !!(motionMQ && motionMQ.matches); }

/* plural(n, ['سؤال', 'سؤالين', 'أسئلة', 'سؤال']) -> 'سؤال' | 'سؤالين' | '5 أسئلة' | '12 سؤال' */
function plural(n, f) {
  n = +n || 0;
  if (n === 1) return f[0];
  if (n === 2) return f[1];
  if (n >= 3 && n <= 10) return n + ' ' + f[2];
  return n + ' ' + (f[3] || f[0]);
}

/* ----- dates (local calendar days as 'YYYY-MM-DD'; never compare formatted strings) ----- */
var DAY_MS = 864e5;
function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function isYmd(x) { return typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x); }
function utcOf(x) { var p = x.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
function daysBetween(a, b) { return Math.round((utcOf(b) - utcOf(a)) / DAY_MS); }
function dateOf(x) { var p = x.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
var todayOverride = (function () {
  try { var q = new URLSearchParams(location.search).get('today'); return isYmd(q) ? q : null; } catch (e) { return null; }
})();
function today() { return todayOverride || ymd(new Date()); }
var AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
var AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function fmtDate(x, opts) {
  var d = dateOf(isYmd(x) ? x : today());
  opts = opts || { weekday: 'long', day: 'numeric', month: 'long' };
  try { return new Intl.DateTimeFormat('ar-u-ca-gregory-nu-latn', opts).format(d); }
  catch (e) {
    if (opts.weekday && !opts.day) return AR_DAYS[d.getDay()];
    return (opts.weekday ? AR_DAYS[d.getDay()] + '، ' : '') + d.getDate() + ' ' + AR_MONTHS[d.getMonth()];
  }
}

/* =====================================================================
   2. Data helpers (read-only views over window.PH)
   ===================================================================== */
/* L1 General · L2 Poetry I · L3 Poetry II · P the paragraph (The Eagle, A Dream Deferred) */
var LECS = ['L1', 'L2', 'L3', 'P'];
var LEC_SHORT = { L1: 'مدخل', L2: 'الشعر 1', L3: 'الشعر 2', P: 'الفقرة' };

var LIDX = {};
(D.lessons || []).forEach(function (L) { LIDX[L.id] = L; });
var PIDX = {};
(D.plan || []).forEach(function (u) { PIDX[u.id] = u; });

var HELP = D.helpers || {};
function enHTML(t) { return HELP.en ? HELP.en(t) : '<bdi class="t-en" dir="ltr">' + t + '</bdi>'; }
function pgHTML(l, p) { return HELP.pg ? HELP.pg(l, p) : '<span class="t-pg">' + l + ' · ' + pgWord(l) + ' ' + p + '</span>'; }
function enEl(t) { return h('bdi', { class: 't-en', dir: 'ltr' }, t); }

/* =====================================================================
   3. Events and registry
   ===================================================================== */
var handlers = {};
function on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return function () { off(ev, fn); }; }
function off(ev, fn) { var l = handlers[ev]; if (l) { var i = l.indexOf(fn); if (i > -1) l.splice(i, 1); } }
function emit(ev, data) {
  (handlers[ev] || []).slice().forEach(function (fn) {
    try { fn(data); } catch (e) { console.error('[App] "' + ev + '" handler failed', e); }
  });
}

var reg = { blocks: {}, widgets: {}, tabs: {}, pages: {} };
var CORE_BLOCKS = {};        /* filled in section 11 */
var CORE_TABS = { today: 1, lessons: 1 };
var CORE_PAGES = { lesson: 1, 'lec-lessons': 1 };

function registerBlock(type, fn) {
  if (CORE_BLOCKS[type]) { console.warn('[App] block "' + type + '" belongs to app-core; ignored'); return false; }
  if (reg.blocks[type]) console.warn('[App] block "' + type + '" registered twice; the last one wins');
  reg.blocks[type] = fn;
  markDirty();
  return true;
}
function registerWidget(name, fn) {
  if (reg.widgets[name]) console.warn('[App] widget "' + name + '" registered twice; the last one wins');
  reg.widgets[name] = fn;
  return true;
}
function registerTab(name, fn) {
  if (CORE_TABS[name] || TABS.indexOf(name) < 0) { console.warn('[App] tab "' + name + '" cannot be registered'); return false; }
  reg.tabs[name] = fn;
  dirty[name] = true;
  if (booted && curTab === name && !stack.length) renderTab(name);
  return true;
}
function registerPage(name, fn) {
  if (CORE_PAGES[name]) { console.warn('[App] page "' + name + '" belongs to app-core; ignored'); return false; }
  if (reg.pages[name]) console.warn('[App] page "' + name + '" registered twice; the last one wins');
  reg.pages[name] = fn;
  return true;
}
function placeholder(text) {
  return h('div', { class: 'card', style: 'padding:16px' },
    h('p', { class: 'dim', style: 'font-size:15px;line-height:1.55', richText: text || 'هذا الجزء قيد التجهيز.' }));
}
function widget(name, opts) {
  var fn = reg.widgets[name];
  if (fn) {
    try { var n = fn(opts || {}); if (n) return n; }
    catch (e) { console.error('[App] widget "' + name + '" failed', e); }
  }
  return placeholder('هذا الجزء قيد التجهيز.');
}
function hasWidget(name) { return !!reg.widgets[name]; }

/* =====================================================================
   4. State (localStorage 'lit-v1' with an in-memory fallback)
   ===================================================================== */
var KEY = 'lit-v1', THEME_KEY = 'lit-theme';
var PRAC_GOAL = 15, CARD_GOAL = 20;
var storageOK = (function () {
  try { var k = '__lit_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; }
})();
var mem = {};
var lastSaveOK = storageOK;
function lsGet(k) {
  if (storageOK) { try { return localStorage.getItem(k); } catch (e) { /* fall through */ } }
  return hasOwn.call(mem, k) ? mem[k] : null;
}
function lsSet(k, v) {
  mem[k] = v;
  if (!storageOK) return false;
  try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
}

function blank() { return { v: 1, q: {}, cards: {}, lessons: {}, units: {}, para: {}, prefs: {} }; }
function int(x) { x = Math.floor(+x || 0); return x > 0 ? x : 0; }
function flags(o) { Object.keys(o).forEach(function (id) { if (o[id]) o[id] = 1; else delete o[id]; }); }
function clean(raw) {
  var st = blank();
  if (!isObj(raw)) return st;
  ['q', 'cards', 'lessons', 'units', 'para', 'prefs'].forEach(function (k) { if (isObj(raw[k])) st[k] = raw[k]; });
  Object.keys(st.q).forEach(function (id) {
    var r = st.q[id];
    if (!isObj(r)) { delete st.q[id]; return; }
    st.q[id] = { s: r.s ? 1 : 0, n: int(r.n), c: int(r.c), last: +r.last || 0 };
  });
  Object.keys(st.cards).forEach(function (id) {
    var r = st.cards[id];
    if (!isObj(r)) { delete st.cards[id]; return; }
    var box = int(r.box); if (box > 3) box = 3;
    st.cards[id] = { box: box, n: int(r.n), last: +r.last || 0 };
  });
  flags(st.lessons);
  flags(st.units);
  /* para: the paragraph trainer (app-paragraph.js), {[paragraphId]: {poem, model, rebuild: 0|1, best: right slots}} */
  Object.keys(st.para).forEach(function (id) {
    var r = st.para[id];
    if (!isObj(r)) { delete st.para[id]; return; }
    st.para[id] = { poem: r.poem ? 1 : 0, model: r.model ? 1 : 0, rebuild: r.rebuild ? 1 : 0, best: int(r.best) };
  });
  return st;
}
function load() {
  var raw = lsGet(KEY);
  if (!raw) return blank();
  try { return clean(JSON.parse(raw)); } catch (e) { return blank(); }
}
var state = load();

function save() {
  state.prefs.savedAt = Date.now();
  var str;
  try { str = JSON.stringify(state); } catch (e) { console.error('[App] state is not serialisable', e); return false; }
  lastSaveOK = lsSet(KEY, str);
  markDirty();
  emit('state', state);
  return lastSaveOK;
}
function hasProgress() {
  return Object.keys(state.q).length + Object.keys(state.cards).length + Object.keys(state.lessons).length + Object.keys(state.units).length + Object.keys(state.para || {}).length > 0;
}
function exportState() {
  return JSON.stringify({ app: 'literature', v: 1, at: new Date().toISOString(), state: state });
}
function importState(text) {
  var obj;
  try { obj = JSON.parse(String(text || '').trim()); }
  catch (e) { return { ok: false, error: 'هذا النص ليس نسخة تقدّم صحيحة.' }; }
  var raw = isObj(obj) && isObj(obj.state) ? obj.state : obj;
  if (!isObj(raw) || !(isObj(raw.q) || isObj(raw.cards) || isObj(raw.lessons) || isObj(raw.units))) {
    return { ok: false, error: 'هذا النص ليس نسخة تقدّم صحيحة.' };
  }
  var keepBanners = state.prefs.banners;
  state = clean(raw);
  if (keepBanners && !state.prefs.banners) state.prefs.banners = keepBanners;
  save();
  emit('import', state);
  refresh();
  return { ok: true };
}
function resetState() {
  var keep = { banners: state.prefs.banners };
  state = blank();
  if (keep.banners) state.prefs.banners = keep.banners;
  animMem = {};
  save();
  emit('reset', state);
  refresh();
  return true;
}

/* question status: new / right / wrong / mastered (= right twice in a row) */
function qStatus(id) {
  var r = state.q[id];
  if (!r || !r.n) return 'new';
  if (r.c >= 2) return 'mastered';
  return r.s ? 'right' : 'wrong';
}
function countStatus(ids) {
  var out = { new: 0, right: 0, wrong: 0, mastered: 0 };
  (ids || []).forEach(function (id) { out[qStatus(id)]++; });
  return out;
}
function wrongIds() { return Object.keys(state.q).filter(function (id) { return qStatus(id) === 'wrong'; }); }

function recordAnswer(id, ok, info) {
  if (!id) return 'new';
  var r = state.q[id] || (state.q[id] = { s: 0, n: 0, c: 0, last: 0 });
  r.n++;
  r.s = ok ? 1 : 0;
  r.c = ok ? r.c + 1 : 0;
  r.last = Date.now();
  save();
  var st = qStatus(id);
  emit('answer', { id: id, ok: !!ok, info: info || {}, status: st });
  return st;
}
function cardBox(id) { var r = state.cards[id]; return r ? r.box : 0; }
function recordCard(id, known, info) {
  if (!id) return { box: 0, n: 0 };
  var r = state.cards[id] || (state.cards[id] = { box: 0, n: 0, last: 0 });
  r.n++;
  r.box = known ? Math.min(3, r.box + 1) : 0;
  r.last = Date.now();
  save();
  emit('card', { id: id, known: !!known, info: info || {}, box: r.box });
  return { box: r.box, n: r.n };
}

/* =====================================================================
   5. Theme ('lit-theme': system | light | dark)
   ===================================================================== */
var themeMem = null;
var META_THEME = { light: '#FFF9F4', dark: '#000000' };
function getTheme() {
  var v = null;
  try { v = localStorage.getItem(THEME_KEY); } catch (e) { v = themeMem; }
  return v === 'light' || v === 'dark' ? v : 'system';
}
function applyTheme(v) {
  var root = doc.documentElement;
  if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v); else root.removeAttribute('data-theme');
  var metas = doc.querySelectorAll('meta[name="theme-color"]');
  for (var i = 0; i < metas.length; i++) {
    var m = metas[i], media = m.getAttribute('media') || '';
    if (v === 'light' || v === 'dark') m.setAttribute('content', META_THEME[v]);
    else m.setAttribute('content', /dark/.test(media) ? META_THEME.dark : META_THEME.light);
  }
}
function setTheme(v) {
  if (v !== 'light' && v !== 'dark') v = 'system';
  themeMem = v;
  try { if (v === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, v); } catch (e) { /* memory only */ }
  applyTheme(v);
  emit('theme', v);
  return v;
}

/* =====================================================================
   6. Audio: this app has none. Harmless no-ops so older module code never crashes.
   ===================================================================== */
function no() { return false; }
function noP() { return Promise.resolve(false); }
var AUDIO_STUB = {
  ready: noP, prime: function () {}, stop: function () {},
  downloadAll: function () { return Promise.resolve({ ok: false, reason: 'unsupported', done: 0, total: 0, failed: [], quota: false }); },
  stats: function () { return Promise.resolve({ cached: 0, total: 0, bytes: 0, supported: false }); },
  persist: function () { return Promise.resolve(null); }, persisted: function () { return Promise.resolve(null); },
  urls: function () { return []; }, CACHE: null
};

/* =====================================================================
   7. Shared UI pieces
   ===================================================================== */
function accClass(lec) { return LECS.indexOf(lec) > -1 ? 'acc-' + lec : ''; }
function tag(lec) { return h('span', { class: 'tag ' + lec }, lec); }
var STATUS = {
  new: ['st-new', 'جديد', 'dot'], right: ['st-right', 'صح', 'tick'],
  wrong: ['st-wrong', 'غلط', 'cross'], mastered: ['st-mastered', 'متقَن', 'star']
};
function statusLabel(st) { return (STATUS[st] || STATUS.new)[1]; }
function stateChip(st) { var m = STATUS[st] || STATUS.new; return h('span', { class: 'state ' + m[0] }, icon(m[2]), m[1]); }
function secHead(text, end) {
  return h('h2', { class: 'sec-h' }, typeof text === 'string' ? h('span', { richText: text }) : h('span', null, text), end != null ? h('b', { class: 'num' }, end) : null);
}
function row(o) {
  o = o || {};
  var clickable = typeof o.onClick === 'function';
  var r = h(clickable ? 'button' : 'div', {
    class: 'row' + (o.icon ? ' has-ico' : '') + (o.className ? ' ' + o.className : ''),
    type: clickable ? 'button' : null
  });
  if (o.icon) r.appendChild(h('span', { class: 'ico', style: 'background:' + (o.iconBg || 'var(--tint)') }, typeof o.icon === 'string' ? icon(o.icon) : o.icon));
  var str = function (x) { return typeof x === 'string' || typeof x === 'number'; };
  r.appendChild(h('span', { class: 'txt' },
    str(o.title) ? h('b', { richText: String(o.title) }) : h('b', null, o.title),
    o.sub ? (str(o.sub) ? h('small', { richText: String(o.sub) }) : h('small', null, o.sub)) : null));
  if (o.meta != null && o.meta !== '') r.appendChild(h('span', { class: 'meta num' }, o.meta));
  if (o.end) r.appendChild(o.end);
  if (o.check) r.appendChild(icon('check', 'check'));
  else if (clickable && o.chev !== false) r.appendChild(icon('chev', 'chev'));
  if (clickable) r.addEventListener('click', o.onClick);
  return r;
}
/* refChip(text, onClick) — a tappable reference that opens a sheet. */
function refChip(text, onClick) {
  var b = h('button', { class: 'ref-chip', type: 'button', 'aria-haspopup': 'dialog' },
    icon('info'), h('span', { richText: text }));
  if (typeof onClick === 'function') b.addEventListener('click', onClick);
  return b;
}

var toastEl = null, toastTimer = 0;
function toast(msg, ms) {
  if (!toastEl) toastEl = doc.getElementById('toast');
  if (!toastEl) return;
  toastEl.innerHTML = richText(msg);
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, ms || 2400);
}

var sheetCur = null;
var BTN_KIND = { primary: 'btn-primary', soft: 'btn-soft', tint: 'btn-tint', danger: 'btn-danger' };
/* sheet({title, text, html, body, actions:[{label, kind, onClick(api)}], cancel, dismissible, acc, onClose}) */
function sheet(o) {
  o = o || {};
  closeSheet();
  var host = appEl || doc.getElementById('app') || doc.body;
  var bg = h('div', { class: 'sheet-bg' });
  var box = h('div', { class: 'sheet' + (o.acc && accClass(o.acc) ? ' ' + accClass(o.acc) : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || '', tabindex: '-1' });
  var api = { el: box, closed: false, close: null };
  api.close = function () {
    if (api.closed) return;
    api.closed = true;
    if (sheetCur === api) sheetCur = null;
    bg.classList.remove('on');
    box.classList.remove('on');
    setTimeout(function () { if (bg.parentNode) bg.parentNode.removeChild(bg); if (box.parentNode) box.parentNode.removeChild(box); }, 380);
    if (o.onClose) { try { o.onClose(api); } catch (e) { console.error(e); } }
  };
  var grab = h('div', { class: 'sheet-grab', 'aria-hidden': 'true' });
  box.appendChild(grab);
  if (o.dismissible !== false) {
    var xBtn = h('button', { type: 'button', class: 'sheet-x', 'aria-label': 'إغلاق' }, icon('close'));
    xBtn.addEventListener('click', function () { api.close(); });
    box.appendChild(xBtn);
  }
  /* Top drag zone: the visible handle plus a transparent 44px strip. */
  var grabZone = h('div', { class: 'sheet-grab-zone', 'aria-hidden': 'true' });
  box.appendChild(grabZone);
  var drag = { on: false, y0: 0, dy: 0, t0: 0 };
  function dragMove(e) {
    if (!drag.on) return;
    var d = e.clientY - drag.y0;
    drag.dy = d > 0 ? d : 0;
    box.style.transform = drag.dy ? 'translateY(' + drag.dy + 'px)' : '';
    if (drag.dy && e.cancelable) e.preventDefault();
  }
  function dragEnd() {
    if (!drag.on) return;
    drag.on = false;
    doc.removeEventListener('pointermove', dragMove);
    doc.removeEventListener('pointerup', dragEnd);
    doc.removeEventListener('pointercancel', dragEnd);
    var dy = drag.dy, dt = Math.max(1, Date.now() - drag.t0);
    if (dy > 90 || (dy > 12 && dy / dt > 0.6)) {
      box.style.transition = '';
      box.style.transform = '';
      api.close();
      return;
    }
    if (reducedMotion()) {
      box.style.transition = 'none';
      box.style.transform = '';
      setTimeout(function () { box.style.transition = ''; }, 0);
    } else {
      box.style.transition = 'transform .25s';
      box.style.transform = '';
      setTimeout(function () { box.style.transition = ''; }, 260);
    }
  }
  function dragStart(e) {
    if (e.button != null && e.button > 0) return;
    drag.on = true; drag.y0 = e.clientY; drag.dy = 0; drag.t0 = Date.now();
    box.style.transition = 'none';
    doc.addEventListener('pointermove', dragMove, { passive: false });
    doc.addEventListener('pointerup', dragEnd);
    doc.addEventListener('pointercancel', dragEnd);
  }
  grab.addEventListener('pointerdown', dragStart);
  grabZone.addEventListener('pointerdown', dragStart);
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.stopPropagation(); api.close(); }
  });
  if (o.title) box.appendChild(h('h2', { richText: o.title }));
  if (o.html) box.appendChild(h('p', { rich: o.html }));
  else if (o.text) box.appendChild(h('p', { richText: o.text }));
  if (o.body) {
    if (typeof o.body === 'function') { try { o.body(box, api); } catch (e) { console.error(e); } }
    else box.appendChild(o.body);
  }
  (o.actions || []).forEach(function (a) {
    var btn = h('button', { class: 'btn ' + (BTN_KIND[a.kind] || BTN_KIND.soft), type: 'button' }, a.label);
    btn.addEventListener('click', function () {
      var r;
      try { r = a.onClick ? a.onClick(api, btn) : undefined; } catch (e) { console.error(e); }
      if (r !== false) api.close();
    });
    box.appendChild(btn);
  });
  if (o.cancel) {
    box.appendChild(h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { api.close(); } }, o.cancel === true ? 'إلغاء' : o.cancel));
  }
  bg.addEventListener('click', function () { if (o.dismissible !== false) api.close(); });
  host.appendChild(bg);
  host.appendChild(box);
  void box.offsetWidth;
  bg.classList.add('on');
  box.classList.add('on');
  sheetCur = api;
  try { box.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  return api;
}
function closeSheet() { if (sheetCur) sheetCur.close(); }
/* ask({title, text, ok, cancel, danger}) -> Promise<boolean>; replaces confirm() */
function ask(o) {
  o = o || {};
  return new Promise(function (resolve) {
    var answered = false;
    sheet({
      title: o.title, text: o.text, html: o.html, acc: o.acc,
      actions: [{ label: o.ok || 'تمام', kind: o.danger ? 'danger' : 'primary', onClick: function () { answered = true; resolve(true); } }],
      cancel: o.cancel || true,
      onClose: function () { if (!answered) resolve(false); }
    });
  });
}

/* =====================================================================
   8. Navigation: tabs, pushed pages, history
   ===================================================================== */
var TABS = ['today', 'lessons', 'practice', 'cards'];
var TAB_TITLES = { today: 'اليوم', lessons: 'الدروس', practice: 'تدرّب', cards: 'بطاقات' };
var appEl = null, tabbarEl = null;
var curTab = 'today', stack = [], booted = false;
var dirty = { today: true, lessons: true, practice: true, cards: true };
var scrollMem = {};
var histOK = true;
var lastRenderDay = null;

function markDirty() { TABS.forEach(function (t) { dirty[t] = true; }); }
function tabEl(name) { return doc.getElementById('tab-' + name); }
function setInert(el, on) { if (!el) return; if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }

function topbar(o) {
  var start = h('div', { class: 'bar-start' }), end = h('div', { class: 'bar-end' });
  if (o.back != null) {
    start.appendChild(h('button', { class: 'back', type: 'button', 'aria-label': 'رجوع', onclick: function () { back(); } }, icon('back'), h('span', { richText: o.back })));
  }
  return h('header', { class: 'topbar' + (o.large ? ' large' : '') }, start, h('div', { class: 'bar-title', richText: o.title || '' }), end);
}
function updateBar(screen) {
  var bar = screen && screen.firstElementChild;
  if (!bar || !bar.classList.contains('topbar')) return;
  bar.classList.toggle('scrolled', screen.scrollTop > (bar.classList.contains('large') ? 44 : 2));
}
function watchScroll(screen) {
  if (screen.__litScroll) return;
  screen.__litScroll = true;
  screen.addEventListener('scroll', function () { updateBar(screen); }, { passive: true });
}

function tabFrame(el, name) {
  el.textContent = '';
  var title = TAB_TITLES[name];
  var bar = topbar({ title: title, large: true });
  var sub = h('p');
  var body = h('div', { class: 'body' }, h('div', { class: 'lt' }, h('h1', null, title), sub));
  el.appendChild(bar);
  el.appendChild(body);
  return {
    el: el, bar: bar, body: body, sub: sub, title: title,
    start: bar.querySelector('.bar-start'), end: bar.querySelector('.bar-end'),
    setSub: function (t) { sub.textContent = t || ''; },
    refresh: function () { dirty[name] = true; if (curTab === name && !stack.length) renderTab(name); }
  };
}
var TAB_RENDER = {
  today: function (el) { renderToday(el); },
  lessons: function (el) { renderLessons(el); },
  practice: function (el) { renderModuleTab(el, 'practice'); },
  cards: function (el) { renderModuleTab(el, 'cards'); }
};
function renderModuleTab(el, name) {
  var f = tabFrame(el, name);
  var fn = reg.tabs[name];
  if (fn) fn(f.body, f);
  else f.body.appendChild(placeholder('هذا القسم قيد التجهيز.'));
}
function renderTab(name) {
  var el = tabEl(name);
  if (!el) return;
  var top = el.scrollTop;
  dirty[name] = false;
  try { TAB_RENDER[name](el); }
  catch (e) {
    console.error('[App] tab "' + name + '" failed', e);
    el.textContent = '';
    var f = tabFrame(el, name);
    f.body.appendChild(placeholder('حدث خطأ في هذا القسم. أعيدي فتح الصفحة.'));
  }
  el.scrollTop = top;
  updateBar(el);
}
function showTab(name, force) {
  if (TABS.indexOf(name) < 0) return;
  if (stack.length) closeAllPages();
  var prevEl = tabEl(curTab);
  if (prevEl && curTab !== name) scrollMem[curTab] = prevEl.scrollTop;
  TABS.forEach(function (t) { var el = tabEl(t); if (el) el.classList.toggle('on', t === name); });
  if (tabbarEl) {
    var btns = tabbarEl.querySelectorAll('.tab');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-tab') === name) btns[i].setAttribute('aria-current', 'page');
      else btns[i].removeAttribute('aria-current');
    }
  }
  var changed = curTab !== name;
  curTab = name;
  var el = tabEl(name);
  if (force || dirty[name] || !el.firstChild) renderTab(name);
  if (changed && hasOwn.call(scrollMem, name)) { el.scrollTop = scrollMem[name]; updateBar(el); }
  if (changed) emit('tab', name);
}
function refresh(name) {
  markDirty();
  if (!booted) return;
  if (name && name !== curTab) return;
  if (!stack.length) renderTab(curTab);
}

function topScreen() { return stack.length ? stack[stack.length - 1].el : tabEl(curTab); }
function runBuild(build, body, handle) {
  try { if (build) build(body, handle); }
  catch (e) {
    console.error('[App] page build failed', e);
    body.appendChild(placeholder('حدث خطأ في هذه الصفحة.'));
  }
}
function swapAcc(el, lec) {
  (el.getAttribute('class') || '').split(/\s+/).forEach(function (c) { if (/^acc-(L\d|P)$/.test(c)) el.classList.remove(c); });
  if (lec && accClass(lec)) el.classList.add(accClass(lec));
}
/* openPage(title, build(body, page), {acc, large, back, end, onClose, onShow, className}) -> page handle
   handle.replace(title, build, {acc, large}) swaps the content in place (no new page, no history entry). */
function openPage(title, build, opts) {
  opts = opts || {};
  /* A double tap must not stack the same page twice. */
  var topPage = stack[stack.length - 1];
  if (topPage && topPage.title === title && Date.now() - (topPage.openedAt || 0) < 800) return topPage;
  closeSheet();
  if (!appEl) appEl = doc.getElementById('app');
  if (!tabbarEl) tabbarEl = doc.getElementById('tabbar');
  var under = topScreen();
  var label = opts.back || (under && under.getAttribute('aria-label')) || 'رجوع';
  if (label.length > 18) label = 'رجوع';
  var page = h('section', {
    class: 'screen page' + (opts.acc && accClass(opts.acc) ? ' ' + accClass(opts.acc) : '') + (opts.className ? ' ' + opts.className : ''),
    'aria-label': title || '', tabindex: '-1'
  });
  var bar = topbar({ title: title, large: !!opts.large, back: label });
  var body = h('div', { class: 'body' });
  page.appendChild(bar);
  page.appendChild(body);
  var handle = {
    el: page, body: body, bar: bar, end: bar.querySelector('.bar-end'), title: title,
    onClose: opts.onClose || null, onShow: opts.onShow || null,
    close: function () { if (stack[stack.length - 1] === handle) back(); },
    setTitle: function (t) { handle.title = t; bar.querySelector('.bar-title').innerHTML = richText(t || ''); page.setAttribute('aria-label', t || ''); },
    replace: function (t, b, o) {
      o = o || {};
      handle.setTitle(t);
      if (o.acc) swapAcc(page, o.acc);
      if (o.large != null) bar.classList.toggle('large', !!o.large);
      body.textContent = '';
      handle.end.textContent = '';
      page.scrollTop = 0;
      runBuild(b, body, handle);
      updateBar(page);
    }
  };
  if (opts.end) handle.end.appendChild(opts.end);
  runBuild(build, body, handle);
  watchScroll(page);
  appEl.appendChild(page);
  void page.offsetWidth;
  if (under) { under.classList.add('under'); under.classList.add('shift'); setInert(under, true); }
  if (!stack.length && tabbarEl) { tabbarEl.classList.add('shift'); setInert(tabbarEl, true); }
  page.classList.add('in');
  handle.openedAt = Date.now();
  stack.push(handle);
  if (histOK) { try { history.pushState({ litDepth: stack.length }, ''); } catch (e) { histOK = false; } }
  try { page.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  emit('page-open', handle);
  return handle;
}
function closeTop() {
  var p = stack.pop();
  if (!p) return;
  var under = topScreen();
  p.el.classList.remove('in');
  setInert(p.el, true);
  if (under) { under.classList.remove('shift'); setInert(under, false); }
  if (!stack.length && tabbarEl) { tabbarEl.classList.remove('shift'); setInert(tabbarEl, false); }
  setTimeout(function () { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); }, 480);
  closeSheet();
  if (p.onClose) { try { p.onClose(p); } catch (e) { console.error(e); } }
  emit('page-close', p);
  if (!stack.length) { if (dirty[curTab]) renderTab(curTab); }
  else {
    var t = stack[stack.length - 1];
    if (t.onShow) { try { t.onShow(t); } catch (e) { console.error(e); } }
  }
}
function back() {
  if (sheetCur) { closeSheet(); return; }
  if (!stack.length) return;
  var depth = stack.length, closing = stack[depth - 1];
  if (histOK && history.state && history.state.litDepth === depth) {
    try { history.back(); } catch (e) { closeTop(); return; }
    setTimeout(function () { if (stack.length === depth && stack[depth - 1] === closing) closeTop(); }, 600);
  } else closeTop();
}
function closeAllPages() {
  var n = stack.length;
  if (!n) return;
  var st = history.state;
  while (stack.length) closeTop();
  if (histOK && st && st.litDepth === n) { try { history.go(-n); } catch (e) { /* ignore */ } }
}

/* pages by name; modules register their own (see docs/app-api.md) */
var PAGE_TITLES = { mock: 'اختبار تجريبي', mistakes: 'مراجعة الأخطاء', summary: 'ملخص ليلة الاختبار', settings: 'الإعدادات', paragraph: 'الفقرة' };
var PAGE_FALLBACK = {
  'practice-task': function () { showTab('practice'); return null; },
  'cards-task': function () { showTab('cards'); return null; }
};
/* go(name, opts): opts is an object; a bare string is read as {id: string} (e.g. go('paragraph', 'eagle-style')). */
function go(name, opts) {
  if (typeof opts === 'string') opts = { id: opts };
  opts = opts || {};
  if (name === 'lesson') return openLesson(opts.id, opts);
  if (name === 'lec-lessons') return openLecLessons(opts);
  if (TABS.indexOf(name) > -1) { showTab(name); return null; }
  if (name === 'summary') markUnitsOfType('summary');
  var fn = reg.pages[name];
  if (fn) {
    try { return fn(opts) || null; }
    catch (e) { console.error('[App] page "' + name + '" failed', e); toast('حدث خطأ. جرّبي مرة ثانية.'); return null; }
  }
  if (PAGE_FALLBACK[name]) return PAGE_FALLBACK[name]();
  return openPage(PAGE_TITLES[name] || '', function (body) { body.appendChild(placeholder('هذه الصفحة قيد التجهيز.')); });
}
function hasPage(name) { return !!reg.pages[name] || !!CORE_PAGES[name]; }

/* =====================================================================
   9. «طريق الدرجات»: the ordered plan units (D.plan) and their done flags (state.units)
   ===================================================================== */
var PARTS = [
  { id: 'p2', ar: 'الجزء الثاني: الفقرة · 15 درجة' },
  { id: 'p1', ar: 'الجزء الأول: الاختيار من متعدد · 15 درجة' }
];
/* display order: part p2 first, then p1 (each in data order), then any other part */
function orderedUnits() {
  var plan = D.plan || [], out = [];
  PARTS.forEach(function (p) { plan.forEach(function (u) { if (u.part === p.id) out.push(u); }); });
  plan.forEach(function (u) { if (out.indexOf(u) < 0) out.push(u); });
  return out;
}
function isUnitDone(id) { return !!state.units[id]; }
/* unitDone(id) marks a unit done; unitDone(id, false) clears it. Returns true when it changed. */
function unitDone(id, done) {
  if (!PIDX[id]) return false;
  var want = done !== false;
  if (!!state.units[id] === want) return false;
  if (want) state.units[id] = 1; else delete state.units[id];
  save();
  emit('unit', { id: id, done: want });
  return true;
}
function nextUnit() { return orderedUnits().filter(function (u) { return !isUnitDone(u.id); })[0] || null; }
/* mark every unit whose open.type is `type` (and, when given, open.id is `id`) */
function markUnitsOfType(type, id) {
  var changed = false;
  (D.plan || []).forEach(function (u) {
    var o = u.open || {};
    if (o.type !== type || (id != null && o.id !== id) || state.units[u.id]) return;
    state.units[u.id] = 1;
    changed = true;
    emit('unit', { id: u.id, done: true });
  });
  if (changed) save();
  return changed;
}
/* Open a unit. Argument shapes passed to the pages:
   paragraph → go('paragraph', {id, unit})      lesson  → openLesson(id, {unit})
   lessons   → go('lec-lessons', {lec, unit})
   practice  → go('practice-task', {topics, unit, title})
   cards     → go('cards-task', {topics, unit, title})
   mock      → go('mock', {unit})               summary → go('summary', {unit}) */
function openUnit(u) {
  if (typeof u === 'string') u = PIDX[u];
  if (!u) return null;
  var o = u.open || {};
  switch (o.type) {
    case 'paragraph': return go('paragraph', { id: o.id, unit: u.id });
    case 'lesson':
      if (!LIDX[o.id]) { toast('هذا الدرس قيد التجهيز.'); return null; }
      return openLesson(o.id, { unit: u.id });
    case 'lessons': return go('lec-lessons', { lec: o.lec, unit: u.id });
    case 'practice': return go('practice-task', { topics: arr(o.topics).slice(), unit: u.id, title: u.ar });
    case 'cards': return go('cards-task', { topics: arr(o.topics).slice(), unit: u.id, title: u.ar });
    case 'mock': return go('mock', { unit: u.id });
    case 'summary': return go('summary', { unit: u.id });
  }
  toast('هذه الخطوة قيد التجهيز.');
  return null;
}
function planInfo() {
  var units = orderedUnits();
  var done = units.filter(function (u) { return isUnitDone(u.id); }).length;
  return {
    today: today(), units: units, total: units.length, done: done, next: nextUnit(),
    complete: units.length > 0 && done === units.length,
    examIn: D.examDate ? daysBetween(today(), D.examDate) : null
  };
}

/* =====================================================================
   10. Today tab
   ===================================================================== */
var animMem = {};
function animScale(el, f, key) {
  f = clamp01(f);
  var from = key && hasOwn.call(animMem, key) ? animMem[key] : 0;
  if (key) animMem[key] = f;
  if (reducedMotion()) from = f;
  el.style.transform = 'scaleX(' + from + ')';
  if (from === f) return;
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.transform = 'scaleX(' + f + ')'; }); });
}
/* «باقي يومان على الاختبار» — Arabic number agreement for 1, 2, 3–10 and 11+ */
function countdownText(n) {
  if (n == null) return '';
  if (n < 0) return 'انتهى الاختبار';
  if (n === 0) return 'الاختبار اليوم. بالتوفيق!';
  if (n === 1) return 'الاختبار غدًا';
  if (n === 2) return 'باقي يومان على الاختبار';
  if (n <= 10) return 'باقي ' + n + ' أيام على الاختبار';
  return 'باقي ' + n + ' يومًا على الاختبار';
}
function roadHead(pi) {
  var bar = h('i');
  animScale(bar, pi.total ? pi.done / pi.total : 0, 'road');
  var note = pi.complete
    ? 'خلصتِ الطريق كله. راجعي أخطاءكِ، أو جرّبي الاختبار التجريبي مرة ثانية.'
    : 'ابدئي من الأعلى. رتّبنا الخطوات حسب درجات الاختبار.';
  return h('section', { class: 'card road-head', 'aria-label': 'طريق الدرجات' },
    h('h2', { class: 'road-cd' }, countdownText(pi.examIn)),
    D.examDate && pi.examIn > 0 ? h('p', { class: 'road-date' }, 'الاختبار ' + fmtDate(D.examDate)) : null,
    h('p', { class: 'road-note' }, note),
    pi.total ? h('div', { class: 'road-prog' },
      h('div', { class: 'road-bar', 'aria-hidden': 'true' }, bar),
      h('span', { class: 'num' }, 'خلصتِ ' + pi.done + ' من ' + pi.total)) : null);
}
function unitRow(u, isNext) {
  var done = isUnitDone(u.id);
  var tick = h('button', {
    class: 'unit-tick', type: 'button', 'aria-pressed': done ? 'true' : 'false',
    'aria-label': (done ? 'ألغي علامة «' : 'علّمي «') + (u.ar || '') + (done ? '»' : '» كخطوة منتهية')
  }, icon(done ? 'checkFill' : 'ring'));
  tick.addEventListener('click', function () {
    unitDone(u.id, !done);
    refresh('today');
  });
  var main = h('button', { class: 'unit-main', type: 'button', onclick: function () { openUnit(u); } },
    h('span', { class: 'txt' },
      h('b', { richText: u.ar || '' }),
      u.why ? h('small', { richText: u.why }) : null),
    h('span', { class: 'unit-end' },
      isNext ? h('span', { class: 'unit-next' }, 'التالي') : null,
      u.min ? h('span', { class: 'unit-min num' }, u.min + ' د') : null),
    icon('chev', 'chev'));
  return h('div', { class: 'unit' + (done ? ' done' : '') + (isNext ? ' next' : '') }, tick, main);
}
function renderToday(el) {
  var f = tabFrame(el, 'today');
  lastRenderDay = today();
  f.setSub(fmtDate(lastRenderDay));
  bannerNodes().forEach(function (b) { f.body.appendChild(b); });
  var pi = planInfo();
  f.body.appendChild(roadHead(pi));
  var nextId = pi.next ? pi.next.id : null;
  var groups = PARTS.concat([{ id: null, ar: 'خطوات أخرى' }]);
  groups.forEach(function (p) {
    var list = pi.units.filter(function (u) {
      return p.id ? u.part === p.id : !PARTS.some(function (q) { return q.id === u.part; });
    });
    if (!list.length) return;
    f.body.appendChild(secHead(p.ar));
    f.body.appendChild(h('div', { class: 'list units' }, list.map(function (u) { return unitRow(u, u.id === nextId); })));
  });
  if (!pi.total) f.body.appendChild(placeholder('الخطة قيد التجهيز.'));
  var wrong = wrongIds().length;
  f.body.appendChild(secHead('أكثر'));
  f.body.appendChild(h('div', { class: 'list' },
    row({ title: 'مراجعة الأخطاء', icon: 'redo', iconBg: 'var(--l3-btn)', meta: wrong ? String(wrong) : null, onClick: function () { go('mistakes'); } }),
    row({ title: 'الإعدادات', icon: 'sliders', iconBg: '#8E8E93', onClick: function () { go('settings'); } })));
}

/* =====================================================================
   11. Lessons tab, lesson page and text blocks
   ===================================================================== */
function lessonDone(id) { return !!state.lessons[id]; }
function markLesson(id) {
  if (!LIDX[id]) return false;
  var first = !state.lessons[id];
  state.lessons[id] = 1;
  markUnitsOfType('lesson', id);
  syncLessonsUnits();
  save();
  emit('lesson', { id: id, first: first });
  return first;
}
/* ----- «افهمي وتأكدي»: a lecture's lessons as one plan unit ({type: 'lessons', lec}) ----- */
/* the lecture's lessons in data order, without the ones that are their own `lesson` plan unit */
function lessonsFor(lec) {
  var own = {};
  (D.plan || []).forEach(function (u) { var o = u.open || {}; if (o.type === 'lesson' && o.id) own[o.id] = 1; });
  return (D.lessons || []).filter(function (L) { return L.lec === lec && !own[L.id]; });
}
function lessonsUnitDone(u) {
  var ls = lessonsFor((u.open || {}).lec);
  return ls.length > 0 && ls.every(function (L) { return lessonDone(L.id); });
}
/* mark every `lessons` unit whose lessons are all done (no save; the caller saves) */
function syncLessonsUnits() {
  var changed = false;
  (D.plan || []).forEach(function (u) {
    if ((u.open || {}).type !== 'lessons' || state.units[u.id] || !lessonsUnitDone(u)) return;
    state.units[u.id] = 1;
    changed = true;
    emit('unit', { id: u.id, done: true });
  });
  return changed;
}
/* the lesson after `id`: inside a `lessons` unit → its list; a single `lesson` unit → none;
   no unit → the next lesson of the same lecture (data order) */
function nextLesson(id, unitId) {
  var L = LIDX[id];
  if (!L) return null;
  var u = unitId ? PIDX[unitId] : null, o = u ? (u.open || {}) : null, list;
  if (o && o.type === 'lessons') list = lessonsFor(o.lec);
  else if (o) return null;
  else list = (D.lessons || []).filter(function (x) { return x.lec === L.lec; });
  var i = list.indexOf(L);
  return i > -1 && list[i + 1] ? list[i + 1] : null;
}
/* page 'lec-lessons' {lec, unit}: the lessons in order, ticks and minutes, «التالي» on the first not done */
function openLecLessons(opts) {
  opts = opts || {};
  var u = opts.unit ? PIDX[opts.unit] : null;
  var lec = opts.lec || (u && u.open && u.open.lec);
  var ls = lessonsFor(lec);
  if (!ls.length) { toast('هذه الدروس قيد التجهيز.'); return null; }
  if (u && syncLessonsUnits()) save();
  function build(body) {
    var dn = ls.filter(function (L) { return lessonDone(L.id); }).length;
    var next = ls.filter(function (L) { return !lessonDone(L.id); })[0] || null;
    body.appendChild(h('div', { class: 'intro' },
      h('div', { class: 'intro-tags' }, tag(lec), h('span', { class: 'dim num', style: 'font-size:13px' }, 'خلصتِ ' + dn + ' من ' + ls.length)),
      h('h1', { richText: lecName(lec) }),
      h('p', { class: 'dim', style: 'margin-top:6px;font-size:15px;line-height:1.55' },
        next ? 'كل درس قصير، وبعده 3 أسئلة لتتأكدي من فهمك.' : 'خلصتِ دروس هذه المحاضرة. الخطوة التالية في «اليوم».')));
    body.appendChild(h('div', { class: 'list ' + accClass(lec) }, ls.map(function (L) {
      var isNext = L === next;
      return row({
        title: L.ar, sub: [L.min ? L.min + ' د · ' : '', h('bdi', { dir: 'ltr', class: 'en' }, L.en || '')],
        end: isNext ? h('span', { class: 'unit-next' }, 'التالي') : null,
        check: lessonDone(L.id),
        onClick: function () { openLesson(L.id, { unit: opts.unit || null, back: lecName(lec) }); }
      });
    })));
  }
  return openPage('افهمي وتأكدي', build, {
    large: true, acc: lec,
    onShow: function (page) { var top = page.el.scrollTop; page.body.textContent = ''; build(page.body); page.el.scrollTop = top; }
  });
}

function renderLessons(el) {
  var f = tabFrame(el, 'lessons');
  var all = D.lessons || [];
  var dnAll = all.filter(function (L) { return lessonDone(L.id); }).length;
  f.setSub(all.length ? 'خلصتِ ' + dnAll + ' من ' + all.length : '');
  if (!all.length) { f.body.appendChild(placeholder('الدروس قيد التجهيز.')); return; }
  LECS.forEach(function (k) {
    var ls = all.filter(function (L) { return L.lec === k; });
    /* group P also holds one row for the paragraph trainer (page 'paragraph', app-paragraph.js) */
    var paraRow = k === 'P' && reg.pages.paragraph;
    if (!ls.length && !paraRow) return;
    var dn = ls.filter(function (L) { return lessonDone(L.id); }).length;
    f.body.appendChild(h('h2', { class: 'sec-h', id: 'lessons-' + k },
      h('span', { style: 'display:inline-flex;align-items:center;gap:6px' }, tag(k), h('span', { richText: lecName(k) })),
      ls.length ? h('b', { class: 'num' }, dn + ' من ' + ls.length) : null));
    var rows = ls.map(function (L) {
      return row({
        title: L.ar, sub: [L.min ? L.min + ' د · ' : '', h('bdi', { dir: 'ltr', class: 'en' }, L.en || '')], check: lessonDone(L.id),
        onClick: function () { openLesson(L.id); }
      });
    });
    if (paraRow) {
      var pu = (D.plan || []).filter(function (u) { return (u.open || {}).type === 'paragraph'; });
      rows.push(row({
        title: 'فقرة الاختبار', sub: h('bdi', { dir: 'ltr', class: 'en' }, ((D.lectures || {}).P || {}).en || ''),
        check: pu.length > 0 && pu.every(function (u) { return isUnitDone(u.id); }),
        onClick: function () { go('paragraph'); }
      }));
    }
    f.body.appendChild(h('div', { class: 'list ' + accClass(k) }, rows));
  });
}
function lecName(lec) { return ((D.lectures || {})[lec] || {}).ar || lec; }

function blockPlaceholder() { return placeholder('هذا الجزء قيد التجهيز.'); }
var META_KEYS = { src: 1, en: 1, blocks: 1 };
function blockType(b) {
  var keys = Object.keys(b), i;
  for (i = 0; i < keys.length; i++) { var k = keys[i]; if (CORE_BLOCKS[k] || reg.blocks[k]) return k; }
  for (i = 0; i < keys.length; i++) if (!META_KEYS[keys[i]]) return keys[i];
  return null;
}
function renderBlock(b, ctx) {
  if (!isObj(b)) return null;
  var type = blockType(b);
  var fn = type ? (CORE_BLOCKS[type] || reg.blocks[type]) : null;
  var node;
  try { node = fn ? fn(b, ctx) : blockPlaceholder(type); }
  catch (e) { console.error('[App] block "' + type + '" failed', e); node = blockPlaceholder(type); }
  if (!node) return null;
  if (b.src) return h('div', { class: 'blk' }, node, h('span', { class: 'src', rich: b.src }));
  if (node.nodeType === 1) { node.classList.add('blk'); return node; }
  return h('div', { class: 'blk' }, node);
}
function renderBlocks(blocks, container, ctx) {
  (blocks || []).forEach(function (b) { var n = renderBlock(b, ctx); if (n) container.appendChild(n); });
  return container;
}
CORE_BLOCKS = {
  p: function (b) { return h('p', { class: 'blk-p', rich: b.p }); },
  /* Arabic title at the start (right), English subtitle pushed to the end (left) */
  h: function (b) {
    return h('div', { class: 'blk-h' }, h('h2', { rich: b.h }), b.en ? h('bdi', { class: 't-en', dir: 'ltr', html: b.en }) : null);
  },
  /* one line: Arabic term (right) … English term (left); then the English definition, then the Arabic explanation */
  def: function (b) {
    var d = b.def || [];
    return h('div', { class: 'card def' },
      h('div', { class: 'd-top' }, d[1] ? h('span', { class: 'd-ar', rich: d[1] }) : null, h('bdi', { class: 'd-en', dir: 'ltr', html: d[0] || '' })),
      d[2] ? h('p', { class: 'd-txt', dir: 'ltr', html: d[2] }) : null,
      d[3] ? h('p', { class: 'd-x', rich: d[3] }) : null);
  },
  list: function (b) {
    return h('div', { class: 'card blk-list' }, h('ul', null, (b.list || []).map(function (x) { return h('li', { rich: x }); })));
  },
  table: function (b) {
    var t = b.table || {};
    return h('div', { class: 'card tbl' }, h('table', null,
      t.head ? h('thead', null, h('tr', null, t.head.map(function (c) { return h('th', { rich: c }); }))) : null,
      h('tbody', null, (t.rows || []).map(function (r) { return h('tr', null, r.map(function (c) { return h('td', { rich: c }); })); }))));
  },
  /* stacked cells: English title above the Arabic one (same pattern as tree children) */
  compare: function (b) {
    return h('div', { class: 'compare' }, (b.compare || []).map(function (c) {
      return h('div', { class: 'card cmp' },
        h('b', { html: c.t || '' }),
        c.ar || c.en ? h('em', null, c.ar ? h('span', { rich: c.ar }) : null, c.en ? [' · ', h('bdi', { dir: 'ltr', class: 'en' }, c.en)] : null) : null,
        h('ul', null, (c.items || []).map(function (x) { return h('li', { rich: x }); })));
    }));
  },
  tree: function (b) {
    var t = b.tree || {}, root = t.root || [];
    return h('div', { class: 'card tree' },
      h('div', { class: 't-root' }, root[1] ? h('span', { rich: root[1] }) : null, h('b', { dir: 'ltr', html: root[0] || '' })),
      h('div', { class: 't-kids' }, (t.kids || []).map(function (k) {
        return h('div', { class: 't-kid' },
          h('b', { html: k[0] || '' }), k[1] ? h('em', { rich: k[1] }) : null,
          k[2] ? h('small', { rich: k[2] }) : null, k[3] ? h('code', { html: k[3] }) : null);
      })));
  },
  note: function (b) { return h('div', { class: 'note' }, icon('info'), h('div', { rich: b.note })); },
  /* {more: 'title', blocks: [...]} — a row that opens its blocks in a sheet over the same page */
  more: function (b, ctx) {
    var btn = h('button', { class: 'more-open', type: 'button', 'aria-haspopup': 'dialog' }, h('span', { rich: b.more }), icon('chev', 'chev'));
    btn.addEventListener('click', function () {
      sheet({
        acc: ctx && ctx.lec,
        onClose: function () { if (btn.isConnected) { try { btn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } } },
        body: function (box) {
          box.setAttribute('aria-label', btn.textContent.trim());
          box.appendChild(h('h2', { rich: b.more }));
          box.appendChild(renderBlocks(b.blocks || [], h('div', { class: 'more-sheet' }), ctx));
        }
      });
    });
    return btn;
  }
};

function openLesson(id, opts) {
  var L = LIDX[id];
  if (!L) return null;
  opts = opts || {};
  /* opts.page: a page handle to reuse (the quick check's «الدرس التالي»), so the stack does not grow */
  if (opts.page && opts.page.replace && stack.indexOf(opts.page) > -1) {
    var pg = opts.page;
    pg.replace(L.ar, function (body) { buildLesson(body, pg, L, opts); }, { acc: L.lec, large: true });
    return pg;
  }
  return openPage(L.ar, function (body, page) { buildLesson(body, page, L, opts); }, { large: true, acc: L.lec, back: opts.back });
}
function buildLesson(body, page, L, opts) {
  body.appendChild(h('div', { class: 'intro' },
    h('div', { class: 'intro-tags' },
      tag(L.lec),
      L.min ? h('span', { class: 'dim num', style: 'font-size:13px' }, L.min + ' د') : null,
      L.en ? h('bdi', { class: 'en-pill', dir: 'ltr', style: 'margin-right:auto' }, L.en) : null),
    h('h1', { richText: L.ar })));
  var ctx = { lesson: L, lec: L.lec, page: page, unit: opts.unit || null };
  ctx.render = function (blocks, container) { return renderBlocks(blocks, container, ctx); };
  renderBlocks(L.blocks || [], body, ctx);
  /* final action: mark the lesson done, then «تأكدي» (3 questions on this lesson) in the same page */
  var check = !!reg.pages['quick-check'];
  var btn = h('button', { class: 'btn btn-primary', type: 'button' }, check ? 'تأكدي من فهمك · 3 أسئلة' : 'كمّلي');
  btn.addEventListener('click', function () {
    var first = markLesson(L.id);
    if (check) { go('quick-check', { lesson: L.id, unit: opts.unit || null, page: page }); return; }
    if (first) toast('أحسنتِ! خلصتِ الدرس.');
    back();
  });
  body.appendChild(h('div', { class: 'blk', style: 'margin-top:28px' }, btn));
}

/* =====================================================================
   12. Environment, banners, service worker
   ===================================================================== */
var ua = navigator.userAgent || '';
var env = (function () {
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = false;
  try { standalone = !!(navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)); } catch (e) { /* ignore */ }
  var inAppToken = /FBAN|FBAV|FB_IAB|Instagram|Snapchat|WhatsApp|Telegram|Line\/|TikTok|musical_ly|Messenger|MicroMessenger|GSA\//.test(ua);
  var inApp = !standalone && ((ios && (inAppToken || !/Safari\//.test(ua))) || (/Android/.test(ua) && (inAppToken || /; wv\)/.test(ua))));
  var file = location.protocol === 'file:';
  var http = /^https?:$/.test(location.protocol);
  var safari = ios && !inApp && !standalone && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo/.test(ua);
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  return { ios: ios, standalone: standalone, inApp: inApp, file: file, http: http, safari: safari, local: local };
})();

var sessionHidden = {};
var swWaiting = null, updateReady = false, reloadOnUpdate = false;
function bannerHidden(id) { return sessionHidden[id] || !!(state.prefs.banners && state.prefs.banners[id]); }
function hideBanner(id, forever) {
  sessionHidden[id] = true;
  if (forever) { state.prefs.banners = state.prefs.banners || {}; state.prefs.banners[id] = 1; save(); }
}
function bannerEl(o) {
  var node = h('div', { class: 'banner', role: 'note' }, icon(o.icon));
  var txt = h('div', { class: 'b-txt' }, h('div', { rich: o.html }));
  if (o.actions && o.actions.length) {
    txt.appendChild(h('div', { class: 'b-act' }, o.actions.map(function (a) {
      return h('button', { type: 'button', onclick: function () { a.onClick(node); } }, a.label);
    })));
  }
  node.appendChild(txt);
  if (o.dismiss) {
    node.appendChild(h('button', {
      class: 'b-x', type: 'button', 'aria-label': 'إخفاء',
      onclick: function () { hideBanner(o.id, o.dismiss === 'forever'); if (node.parentNode) node.parentNode.removeChild(node); }
    }, icon('close')));
  }
  return node;
}
function cleanUrl() { try { var u = new URL(location.href); u.search = ''; u.hash = ''; return u.href; } catch (e) { return location.href; } }
function copyText(text) {
  function fallback() {
    var ta = h('textarea', { readonly: true, style: 'position:fixed;top:-100px;opacity:0' });
    ta.value = text;
    doc.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
    doc.body.removeChild(ta);
    return ok;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
  }
  return Promise.resolve(fallback());
}
function copyLink() {
  var url = cleanUrl();
  copyText(url).then(function (ok) {
    if (ok) { toast('نسختُ الرابط.'); return; }
    sheet({
      title: 'انسخي الرابط', text: 'اضغطي على الرابط مطوّلًا وانسخيه، ثم الصقيه في Safari.',
      body: function (box) { var ta = h('textarea', { readonly: true }); ta.value = url; box.appendChild(ta); },
      cancel: 'تم'
    });
  });
}
function bannerNodes() {
  var out = [];
  if (updateReady && !bannerHidden('update')) {
    out.push(bannerEl({ id: 'update', icon: 'refresh', html: 'يوجد تحديث جديد للتطبيق.', dismiss: 'session', actions: [{ label: 'حدّثي', onClick: applyUpdate }] }));
  }
  if (env.inApp && !bannerHidden('inapp')) {
    out.push(bannerEl({
      id: 'inapp', icon: 'compass', dismiss: 'session',
      html: 'افتحي الرابط في <bdi>Safari</bdi> لحفظ تقدّمكِ واستخدام التطبيق بدون إنترنت. من القائمة ⋯ أو زر المشاركة اختاري «فتح في <bdi>Safari</bdi>».',
      actions: [{ label: 'انسخي الرابط', onClick: copyLink }]
    }));
  }
  if (env.file && !bannerHidden('file')) {
    out.push(bannerEl({
      id: 'file', icon: 'warn', dismiss: 'session',
      html: 'هذه نسخة محفوظة على جهازكِ، وقد لا تحفظ تقدّمكِ. افتحي الرابط الأصلي في <bdi>Safari</bdi>.'
    }));
  }
  if (!storageOK && !env.inApp && !env.file && !bannerHidden('storage')) {
    out.push(bannerEl({
      id: 'storage', icon: 'warn', dismiss: 'session',
      html: 'هذا المتصفح لا يحفظ التقدّم. سيضيع تقدّمكِ عند إغلاق الصفحة.'
    }));
  }
  if (env.safari && env.http && !bannerHidden('a2hs')) {
    var hp = hasProgress();
    out.push(bannerEl({
      id: 'a2hs', icon: 'share', dismiss: 'forever',
      html: 'أضيفي التطبيق للشاشة الرئيسية: زر المشاركة ثم «إضافة إلى الشاشة الرئيسية». ' +
        (hp ? 'لا ينتقل تقدّمكِ تلقائيًا. صدّريه من الإعدادات، ثم استورديه في تطبيق الشاشة الرئيسية.' : 'أضيفيه قبل البدء، فالتقدّم لا ينتقل تلقائيًا بينهما.'),
      actions: hp ? [{ label: 'الإعدادات', onClick: function () { go('settings'); } }] : []
    }));
  }
  return out;
}
function setUpdate(worker) {
  if (worker) swWaiting = worker;
  if (updateReady) return;
  updateReady = true;
  if (booted) refresh('today');
}
function applyUpdate() {
  if (swWaiting) {
    reloadOnUpdate = true;
    try { swWaiting.postMessage({ type: 'skip-waiting' }); } catch (e) { location.reload(); return; }
    setTimeout(function () { location.reload(); }, 3000);
  } else location.reload();
}
function registerSW() {
  if (!('serviceWorker' in navigator) || !env.http) return;
  var forced = /[?&]sw=1\b/.test(location.search);
  if (env.local && !forced) return;
  var sw = navigator.serviceWorker;
  sw.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'sw-updated') { if (reloadOnUpdate) location.reload(); else setUpdate(null); }
  });
  sw.addEventListener('controllerchange', function () { if (reloadOnUpdate) location.reload(); });
  sw.register('./sw.js', { scope: './' }).then(function (r) {
    if (r.waiting && sw.controller) setUpdate(r.waiting);
    r.addEventListener('updatefound', function () {
      var w = r.installing;
      if (!w) return;
      w.addEventListener('statechange', function () { if (w.state === 'installed' && sw.controller) setUpdate(w); });
    });
  }).catch(function (e) { console.warn('[App] service worker not registered', e); });
}

/* =====================================================================
   13. Boot
   ===================================================================== */
var readyFns = [];
function onReady(fn) { if (booted) { try { fn(); } catch (e) { console.error(e); } } else readyFns.push(fn); }
function boot() {
  if (booted) return;
  appEl = doc.getElementById('app');
  tabbarEl = doc.getElementById('tabbar');
  toastEl = doc.getElementById('toast');
  if (!appEl) return;
  booted = true;
  applyTheme(getTheme());
  TABS.forEach(function (t) { var el = tabEl(t); if (el) watchScroll(el); });
  if (tabbarEl) {
    tabbarEl.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.tab') : null;
      if (!b) return;
      var name = b.getAttribute('data-tab');
      if (name === curTab && !stack.length) {
        var el = tabEl(name);
        try { el.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (err) { el.scrollTop = 0; }
        return;
      }
      showTab(name);
    });
  }
  try { history.replaceState({ litDepth: 0 }, ''); } catch (e) { histOK = false; }
  window.addEventListener('popstate', function (e) {
    if (sheetCur && stack.length && (!e.state || e.state.litDepth === stack.length - 1)) { closeSheet(); try { history.pushState({ litDepth: stack.length }, ''); } catch (err) { /* ignore */ } return; }
    var d = e.state && typeof e.state.litDepth === 'number' ? e.state.litDepth : 0;
    closeSheet();
    while (stack.length > d) closeTop();
    if (d > stack.length) { try { history.replaceState({ litDepth: stack.length }, ''); } catch (err) { /* ignore */ } }
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sheetCur) closeSheet(); else if (stack.length) back();
  });
  doc.addEventListener('visibilitychange', function () {
    if (!doc.hidden && lastRenderDay && lastRenderDay !== today()) refresh();
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) refresh(); });
  if (motionMQ && motionMQ.addEventListener) motionMQ.addEventListener('change', function () { animMem = {}; });
  if (window.matchMedia) {
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { emit('theme', getTheme()); }); } catch (e) { /* old Safari */ }
  }
  registerSW();
  showTab('today', true);
  readyFns.splice(0).forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
  emit('boot');
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
else setTimeout(boot, 0);

/* =====================================================================
   14. Public API (documented in docs/app-api.md)
   ===================================================================== */
App.version = 'v4';            /* keep equal to VERSION in sw.js; bump both on every release */
App.D = D;
Object.defineProperty(App, 'state', { enumerable: true, get: function () { return state; } });
Object.defineProperty(App, 'env', { enumerable: true, get: function () { return env; } });

/* DOM + text */
App.h = h; App.el = h; App.svg = svg; App.icon = icon; App.icons = Object.keys(ICONS);
App.esc = esc; App.plural = plural;
App.shuffle = shuffle; App.sample = sample; App.reducedMotion = reducedMotion;
App.en = enHTML; App.pg = pgHTML; App.enEl = enEl;
App.rich = rich; App.richText = richText; App.richify = richify; App.srcEl = srcEl; App.pgEl = pgEl;

/* dates */
App.today = today; App.daysBetween = daysBetween; App.fmtDate = fmtDate;

/* data views */
App.LECS = LECS.slice();
App.lesson = function (id) { return LIDX[id] || null; };
App.lecName = lecName;
App.lecShort = function (lec) { return LEC_SHORT[lec] || lec; };
App.acc = accClass; App.tag = tag;

/* state */
App.getState = function () { return state; };
App.save = save; App.hasProgress = hasProgress;
App.storageOK = function () { return storageOK && lastSaveOK; };
App.exportState = exportState; App.importState = importState; App.resetState = resetState;
App.qStatus = qStatus; App.countStatus = countStatus; App.wrongIds = wrongIds; App.statusLabel = statusLabel;
App.recordAnswer = recordAnswer; App.recordCard = recordCard; App.cardBox = cardBox;
App.markLesson = markLesson; App.lessonDone = lessonDone;
App.lessonsFor = function (lec) { return lessonsFor(lec).slice(); };
App.nextLesson = nextLesson;

/* «طريق الدرجات» */
App.unitDone = unitDone; App.isUnitDone = isUnitDone; App.openUnit = openUnit;
App.plan = {
  info: planInfo, units: orderedUnits, next: nextUnit, open: openUnit,
  unit: function (id) { return PIDX[id] || null; },
  progress: function () { return null; },        /* the old per-day plan is gone */
  PRAC_GOAL: PRAC_GOAL, CARD_GOAL: CARD_GOAL
};

/* theme */
App.getTheme = getTheme; App.setTheme = setTheme;

/* registry + navigation */
App.registerBlock = registerBlock; App.registerWidget = registerWidget;
App.registerTab = registerTab; App.registerPage = registerPage;
App.widget = widget; App.hasWidget = hasWidget; App.hasPage = hasPage;
App.renderBlocks = function (blocks, container, ctx) { return renderBlocks(blocks, container, ctx || {}); };
App.openPage = openPage; App.back = back; App.closeAllPages = closeAllPages;
App.topPage = function () { return stack[stack.length - 1] || null; };
App.go = go; App.openLesson = openLesson;
App.showTab = showTab; App.currentTab = function () { return curTab; }; App.refresh = refresh;
App.on = on; App.off = off; App.onReady = onReady;

/* UI */
App.sheet = sheet; App.closeSheet = closeSheet; App.ask = ask; App.toast = toast;
App.refChip = refChip;
App.placeholder = placeholder; App.row = row; App.secHead = secHead; App.stateChip = stateChip;
App.copyText = copyText;

/* audio: none in this app (no-ops kept so older module code cannot crash) */
App.playWord = noP; App.playVowel = noP; App.hasAudio = no; App.hasVowelAudio = no; App.canPlayVowel = no;
App.audio = AUDIO_STUB;
})();
