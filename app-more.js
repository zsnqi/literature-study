/* app-more.js — Cards tab and the pages cards-task / summary / settings (literature app).
   Contract: docs/app-api.md (API = window.App, data = App.D). Copy: docs/copy-guide.md.
   Card reviews go only through App.recordCard (Leitner boxes 0–3). Module prefs live in
   App.state.prefs.cards (deck filter) and App.state.prefs.more (summary tab, last export).
   Data read: D.cards, D.lectures, D.topics, D.lessons (def + compare blocks), D.plan,
   D.paragraphs, D.poems, D.devices. A missing key hides its part quietly. */
(function () {
'use strict';
var App = window.App;
if (!App) return;

var D = App.D || {};
var h = App.h;
var HOUR = 36e5;
var GOAL = 20;                       /* cards per session on the Cards tab */

/* =====================================================================
   0. Styles (only what index.html does not have; tokens only, light + dark)
   ===================================================================== */
var CSS = [
  /* touch targets: 36px chips keep their look, the hit area grows to 44px */
  '.mo-chips{row-gap:8px}',
  '.mo-chips .chip-t{position:relative}',
  '.mo-chips .chip-t::after{content:"";position:absolute;left:0;right:0;top:-4px;bottom:-4px}',
  '.mo-pad{padding:12px}',
  /* deck card on the Cards tab */
  '.mo-deck{margin-top:14px;padding:16px}',
  '.mo-due{display:flex;align-items:baseline;gap:8px}',
  '.mo-due b{font-size:44px;font-weight:700;line-height:1;letter-spacing:-.02em}',
  '.mo-due span{font-size:17px;font-weight:600}',
  '.mo-deck-sub{margin-top:6px;font-size:14px;color:var(--label2)}',
  '.mo-deck .note{margin-top:12px}',
  '.mo-deck .btn{margin-top:16px}',
  '.mo-leg{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:var(--label2)}',
  '.mo-leg b{font-weight:600;color:var(--label)}',
  /* flip card */
  '.mo-in{animation:mo-in .34s cubic-bezier(.16,1,.3,1)}',
  '@keyframes mo-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
  '.mo-fc:not(.flip) .fc-back,.mo-fc.flip .fc-front{pointer-events:none}',
  '.mo-fc .fc-face{overflow:hidden}',
  '.mo-fc .fc-meta{z-index:1}',
  '.mo-mt{display:inline-flex;align-items:center;gap:6px;min-width:0}',
  '.mo-kind{font-size:12px;color:var(--label2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.mo-q{margin-top:14px;font-size:15px;color:var(--label3)}',
  '.fc-main.mo-sm{font-size:24px}',
  '.mo-fc .fc-sub{max-width:100%}',
  '.mo-fc .fc-sub.mo-long{font-size:14px;line-height:1.45}',
  '.mo-res{position:relative;overflow:hidden}',
  '.result .mo-res-h{margin:0 0 14px;font-size:17px;font-weight:700;color:var(--ok)}',
  /* exam-night summary: airy, one segmented row, no chip rows */
  '.mo-lead{margin-top:8px;font-size:16px;line-height:1.55;color:var(--label2)}',
  '.mo-seg button{min-height:44px;font-size:15px}',
  '.mo-sum-seg{margin:2px 0 6px}',
  '.mo-sec-note{margin:22px 4px 0;font-size:15px;line-height:1.6;color:var(--label2)}',
  '.mo-grp{margin-top:40px}',
  '.mo-grp:first-child{margin-top:26px}',
  '.mo-gh{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:0 4px;margin-bottom:12px}',
  '.mo-gh h3{font-size:19px;font-weight:700;letter-spacing:-.01em;line-height:1.3}',
  '.mo-gh .t-en{margin-right:auto;font-size:13px;font-weight:500;color:var(--label2)}',
  '.mo-sub{margin:22px 4px 8px;font-size:13px;font-weight:600;color:var(--label2)}',
  '.mo-skel{padding:16px 18px}',
  '.mo-skel ol{margin:0;padding-inline-start:22px}',
  '.mo-skel li{font-size:16px;line-height:1.6}',
  '.mo-skel li + li{margin-top:12px}',
  '.mo-skel li::marker{color:var(--acc-ink);font-weight:700}',
  '.mo-pl{padding:0}',
  '.mo-pl-row{padding:14px 16px}',
  '.mo-pl-row + .mo-pl-row{border-top:0.5px solid var(--sep)}',
  '.mo-pl-t{direction:ltr;text-align:left;font-size:16px;font-weight:500;line-height:1.45}',
  '.mo-pl-d{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:6px;font-size:13px;color:var(--label2)}',
  '.mo-pl-d .t-en{margin-right:auto;color:var(--acc-ink);font-weight:600}',
  '.mo-tl{padding:0}',
  '.mo-trow{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:10px 16px;text-align:start;color:var(--label);transition:background .15s}',
  '.mo-trow + .mo-trow{border-top:0.5px solid var(--sep)}',
  '.mo-trow:active{background:var(--fill)}',
  '.mo-trow-ar{font-size:15px;font-weight:600;color:var(--acc-ink);line-height:1.4}',
  '.mo-trow-en{margin-right:auto;font-size:16px;font-weight:600;line-height:1.35;text-align:left}',
  '.mo-trow.mo-w{flex-direction:column;align-items:stretch;gap:0}',
  '.mo-w-top{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}',
  '.mo-w-d{margin-top:8px;font-size:14px;line-height:1.5;color:var(--label2)}',
  '.mo-w-d + .mo-w-d{margin-top:4px}',
  '.mo-w-d.ltr{direction:ltr;text-align:left}',
  '.mo-w-d b{font-weight:600;color:var(--label)}',
  /* sheets opened from the summary */
  '.mo-sh-ar{margin-top:4px;font-size:17px;font-weight:600;color:var(--acc-ink)}',
  '.mo-sh-en{margin-top:14px;direction:ltr;text-align:left;font-size:16px;line-height:1.55}',
  '.mo-sh-x{margin-top:12px;font-size:15px;line-height:1.6;color:var(--label2)}',
  '.mo-sh-src{margin-top:12px;font-size:13px;color:var(--label3)}',
  '.mo-sh-blk{margin-top:12px}',
  /* settings */
  '.mo-danger .txt b{color:var(--bad)}',
  '.mo-foot{margin:8px 16px 0;font-size:13px;line-height:1.5;color:var(--label2)}',
  '.mo-banner{margin:12px 0 0}',
  '.mo-err{margin-top:8px;font-size:14px;color:var(--bad)}',
  '.mo-err:empty{display:none}',
  '.mo-paste{margin-top:8px}',
  '.mo-ver{direction:ltr;font-size:15px;color:var(--label2)}'
].join('\n');

function ensureCSS() {
  if (document.getElementById('css-more')) return;
  var s = document.createElement('style');
  s.id = 'css-more';
  s.textContent = CSS;
  (document.head || document.documentElement).appendChild(s);
}
App.onReady(ensureCSS);

/* =====================================================================
   1. Small helpers
   ===================================================================== */
function keys(o) { return o && typeof o === 'object' ? Object.keys(o) : []; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function ymdOf(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function fmtWhen(ms) {
  if (!ms) return '';
  var d = new Date(ms);
  var day = ymdOf(d) === ymdOf(new Date()) ? 'اليوم' : App.fmtDate(ymdOf(d), { day: 'numeric', month: 'long' });
  var t;
  try { t = new Intl.DateTimeFormat('ar-u-ca-gregory-nu-latn', { hour: 'numeric', minute: '2-digit' }).format(d); }
  catch (e) { t = d.getHours() + ':' + pad2(d.getMinutes()); }
  return day + '، ' + t;
}
function prefs(ns) {
  var p = App.state.prefs;
  if (!p[ns] || typeof p[ns] !== 'object') p[ns] = {};
  return p[ns];
}
function bdiEn(t, cls) { return h('bdi', { class: cls || 't-en', dir: 'ltr' }, t); }
/* data strings are HTML (en() isolates); this strips tags for matching only */
function plain(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim(); }
function norm(s) { return plain(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function unitDone(id) { if (id && typeof App.unitDone === 'function') { try { App.unitDone(id); } catch (e) { console.error(e); } } }
/* a unit id from the opts Today passes: {unit:'id'|{id}}, {unitId}, {id}, {task:{id}} */
function unitIdOf(o) {
  o = o || {};
  var u = o.unit;
  if (u && typeof u === 'object') u = u.id;
  return u || o.unitId || o.id || (o.task && o.task.id) || null;
}
function lecOrder() {
  var base = ['L1', 'L2', 'L3', 'P'];
  keys(D.lectures).forEach(function (L) { if (base.indexOf(L) < 0) base.push(L); });
  return base;
}
function lecTitle(L) { var l = (D.lectures || {})[L] || {}; return { ar: l.ar || App.lecName(L), en: l.en || '' }; }
function topicOf(id) { return (D.topics || {})[id] || null; }

/* =====================================================================
   2. Card deck (D.cards), Leitner scheduling
   ===================================================================== */
/* Leitner: box 0 is always due; boxes 1–3 come back after about 1, 2 and 4 days. */
var INTERVAL = [0, 18 * HOUR, 42 * HOUR, 90 * HOUR];

var deckCache = null;
function allCards() {
  if (deckCache) return deckCache;
  var order = lecOrder();
  deckCache = (D.cards || []).filter(function (c) { return c && c.id && c.f; }).map(function (c, i) {
    return { id: c.id, lec: c.lec, topic: c.topic, c: c, ord: i, rank: order.indexOf(c.lec) < 0 ? 99 : order.indexOf(c.lec) };
  });
  /* order L1, L2, L3 (then data order inside each lecture) */
  deckCache.sort(function (a, b) { return (a.rank - b.rank) || (a.ord - b.ord); });
  return deckCache;
}
function deckLecs() {
  var have = {};
  allCards().forEach(function (c) { have[c.lec] = 1; });
  return lecOrder().filter(function (L) { return have[L]; });
}

function rec(id) { var r = App.state.cards[id]; return r && r.n ? r : null; }
function isDue(r, now) { return !!r && now - (r.last || 0) >= INTERVAL[Math.min(3, r.box || 0)]; }
function cardStatus(id) {
  var r = rec(id);
  if (!r) return 'new';
  if (r.box >= 3) return 'mastered';
  return r.box > 0 ? 'right' : 'wrong';
}
function countDeck(cards) {
  var now = Date.now(), out = { due: 0, fresh: 0, total: cards.length, st: { new: 0, right: 0, wrong: 0, mastered: 0 } };
  cards.forEach(function (c) {
    var r = rec(c.id);
    if (!r) out.fresh++; else if (isDue(r, now)) out.due++;
    out.st[cardStatus(c.id)]++;
  });
  return out;
}
/* due first (lowest box, oldest first), then new cards in deck order, then (fill) the ones not due yet */
function buildQueue(cards, n, fill) {
  var now = Date.now(), due = [], fresh = [], ahead = [];
  cards.forEach(function (c) {
    var r = rec(c.id);
    if (!r) fresh.push(c); else if (isDue(r, now)) due.push(c); else ahead.push(c);
  });
  due.sort(function (a, b) { var ra = rec(a.id), rb = rec(b.id); return (ra.box - rb.box) || (ra.last - rb.last); });
  ahead.sort(function (a, b) {
    var ra = rec(a.id), rb = rec(b.id);
    return (ra.last + INTERVAL[ra.box]) - (rb.last + INTERVAL[rb.box]);
  });
  var q = due.concat(fresh);
  if (fill || !q.length) q = q.concat(ahead);
  return q.slice(0, n);
}

/* Cards tab filter: lectures (several) + one topic or all */
function getSel() {
  var p = prefs('cards'), lecs = deckLecs();
  var sel = Array.isArray(p.lecs) ? p.lecs.filter(function (l) { return lecs.indexOf(l) > -1; }) : [];
  if (!sel.length) sel = lecs.slice();
  return { lecs: sel, topic: typeof p.topic === 'string' ? p.topic : 'all' };
}
function setSel(sel) { var p = prefs('cards'); p.lecs = sel.lecs.slice(); p.topic = sel.topic; App.save(); }
function topicsIn(lecs) {
  var out = [];
  allCards().forEach(function (c) { if (lecs.indexOf(c.lec) > -1 && c.topic && out.indexOf(c.topic) < 0) out.push(c.topic); });
  return out;
}
function deckFor(sel) {
  return allCards().filter(function (c) { return sel.lecs.indexOf(c.lec) > -1 && (sel.topic === 'all' || c.topic === sel.topic); });
}
/* From Today: { type: 'cards', topics } → cards of those topics (a lecture id also works). Empty → all. */
function deckForTopics(topics) {
  topics = (topics || []).filter(Boolean);
  if (!topics.length) return allCards();
  return allCards().filter(function (c) { return topics.indexOf(c.topic) > -1 || topics.indexOf(c.lec) > -1; });
}

/* =====================================================================
   3. Card faces: front = the English term; back = the slide definition + the Arabic meaning
   ===================================================================== */
function cardMeaning(t) {
  var d = defFor(t.f);
  return d && d.d[3] ? h('p', { class: 'fc-ar2', rich: d.d[3] }) : null;
}
function cardView(c, onRate) {
  var t = c.c;
  var tp = topicOf(c.topic);
  function meta() {
    return h('div', { class: 'fc-meta' },
      h('span', { class: 'mo-mt' }, App.tag(c.lec), tp && tp.ar ? h('span', { class: 'mo-kind', rich: tp.ar }) : null),
      App.stateChip(cardStatus(c.id)));
  }
  var long = String(t.f).length > 18;
  var defLen = plain(t.b).length;
  var front = h('div', { class: 'fc-face fc-front' }, meta(),
    h('bdi', { class: 'fc-main' + (long ? ' mo-sm' : ''), dir: 'ltr' }, t.f),
    h('p', { class: 'mo-q' }, 'ما معناه؟'),
    h('p', { class: 'fc-hint' }, 'المسي البطاقة لتقلبيها'));
  var back = h('div', { class: 'fc-face fc-back', 'aria-hidden': 'true' }, meta(),
    h('bdi', { class: 'fc-main mo-sm', dir: 'ltr' }, t.f),
    t.b ? h('p', { class: 'fc-sub ltr' + (defLen > 150 ? ' mo-long' : ''), dir: 'ltr', html: t.b }) : null,
    t.ar ? h('p', { class: 'fc-ar', rich: t.ar }) : null,
    cardMeaning(t));
  var fc = h('div', { class: 'fc mo-fc', tabindex: '0', 'aria-label': 'البطاقة' }, front, back);
  var no = h('button', { class: 'btn no', type: 'button', disabled: true }, 'لسه');
  var yes = h('button', { class: 'btn yes', type: 'button', disabled: true }, 'عرفتها');
  var rate = h('div', { class: 'fc-rate hide' }, no, yes);
  var rated = false;
  function flip() {
    var on = !fc.classList.contains('flip');
    fc.classList.toggle('flip', on);
    front.setAttribute('aria-hidden', on ? 'true' : 'false');
    back.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) { rate.classList.remove('hide'); no.disabled = false; yes.disabled = false; }
  }
  fc.addEventListener('click', flip);
  fc.addEventListener('keydown', function (e) {
    if (e.target !== fc) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  function done(known, btn) {
    if (rated) return;
    rated = true;
    var kb = false;
    try { kb = btn.matches(':focus-visible'); } catch (e) { kb = false; }
    onRate(c, known, kb);
  }
  no.addEventListener('click', function () { done(false, no); });
  yes.addEventListener('click', function () { done(true, yes); });
  var root = h('div', { class: 'mo-card mo-in ' + App.acc(c.lec) }, h('div', { class: 'fc-wrap' }, fc), rate);
  root.focusCard = function () { try { fc.focus({ preventScroll: true }); } catch (e) { /* ignore */ } };
  return root;
}

function confetti() {
  var box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  var cols = ['var(--l1)', 'var(--l2)', 'var(--l3)', 'var(--acc)'];
  for (var i = 0; i < 16; i++) {
    box.appendChild(h('i', { style: 'left:' + (4 + i * 6) + '%;background:' + cols[i % 4] + ';animation-delay:' + ((i % 5) * 0.07).toFixed(2) + 's' }));
  }
  return box;
}

/* A review session inside a page: o = {cards, size, fill?, unit?}
   With a unit (from Today) the first full pass marks that unit done. */
function session(body, page, o) {
  var cards = o.cards || [];
  var size = o.size || GOAL, unit = o.unit || null;
  var queue = [], seen = 0, known = 0, again = {}, tried = {}, toldAgain = false, fill = !!o.fill, total = 0;
  var barI = h('i', { style: 'transform:scaleX(0)' });
  var cnt = h('span', { class: 'q-count num' });
  var top = h('div', { class: 'q-top' }, h('div', { class: 'q-prog', 'aria-hidden': 'true' }, barI), cnt);
  var stage = h('div', { class: 'mo-stage' });
  body.appendChild(top);
  body.appendChild(stage);
  if (!cards.length) { top.hidden = true; stage.appendChild(App.placeholder('لا توجد بطاقات هنا.')); return; }

  function paint() {
    var tot = total || (seen + queue.length);
    barI.style.transform = 'scaleX(' + (tot ? seen / tot : 1).toFixed(4) + ')';
    cnt.textContent = seen + ' من ' + tot;
  }
  function next(kb) {
    stage.textContent = '';
    if (!queue.length) { finish(); return; }
    var v = cardView(queue[0], rate);
    stage.appendChild(v);
    paint();
    if (kb) v.focusCard();   /* keyboard users keep their place; no focus ring after a tap */
  }
  function rate(c, ok, kb) {
    queue.shift();
    App.recordCard(c.id, ok, { topics: c.topic ? [c.topic] : [], lec: c.lec });
    if (!tried[c.id]) { tried[c.id] = true; seen++; if (ok) known++; }
    if (!ok) {
      again[c.id] = (again[c.id] || 0) + 1;
      if (again[c.id] <= 3) queue.splice(Math.min(3, queue.length), 0, c);
      if (!toldAgain) { toldAgain = true; App.toast('ترجع لكِ بعد بطاقات قليلة.'); }
    }
    next(kb);
  }
  function start(n) { queue = buildQueue(cards, n, fill); total = queue.length; seen = 0; known = 0; again = {}; tried = {}; next(); }
  function finish() {
    paint();
    var reached = !!unit;
    if (unit) { unitDone(unit); unit = null; }
    var more = h('button', { class: 'btn ' + (reached ? 'btn-soft' : 'btn-primary'), type: 'button' }, 'كمّلي');
    var back = h('button', { class: 'btn ' + (reached ? 'btn-primary' : 'btn-soft'), type: 'button' }, 'رجوع');
    more.addEventListener('click', function () { fill = true; start(size); });
    back.addEventListener('click', function () { App.back(); });
    var res = h('div', { class: 'card result mo-res mo-in' },
      reached ? h('p', { class: 'mo-res-h' }, 'أحسنتِ! خلصتِ بطاقات هذا الجزء.') : null,
      h('div', { class: 'r-big num' }, String(known), h('small', null, '/' + seen)),
      h('p', null, 'عرفتِ ' + known + ' من ' + seen + '.'),
      h('div', { style: 'display:grid;gap:10px;margin-top:18px' }, reached ? [back, more] : [more, back]));
    if (reached && !App.reducedMotion()) res.appendChild(confetti());
    stage.appendChild(res);
  }
  start(size);
}

/* =====================================================================
   4. Cards tab (lecture + topic filter, due count → session page)
   ===================================================================== */
function chip(label, pressed, onClick, cls) {
  return h('button', { class: 'chip-t' + (cls ? ' ' + cls : ''), type: 'button', 'aria-pressed': pressed ? 'true' : 'false', onclick: onClick }, label);
}
function stLegend(st) {
  return h('div', { class: 'stleg' }, ['new', 'right', 'wrong', 'mastered'].map(function (k) {
    return h('span', { class: 'mo-leg' }, App.stateChip(k), h('b', { class: 'num' }, String(st[k])));
  }));
}
function stBar(st, total) {
  var bar = h('div', { class: 'stbar', 'aria-hidden': 'true' });
  [['s-m', 'mastered'], ['s-r', 'right'], ['s-w', 'wrong']].forEach(function (p) {
    if (st[p[1]] && total) bar.appendChild(h('i', { class: p[0], style: 'width:' + (100 * st[p[1]] / total).toFixed(2) + '%' }));
  });
  return bar;
}
function openDeck(sel, cards, fill) {
  var tp = sel.topic !== 'all' ? topicOf(sel.topic) : null;
  return App.openPage(tp && tp.ar ? plain(tp.ar) : 'بطاقات', function (body, page) {
    ensureCSS();
    session(body, page, { cards: cards, fill: fill, size: GOAL });
  }, { acc: sel.lecs.length === 1 ? sel.lecs[0] : null });
}

App.registerTab('cards', function (body, ctx) {
  ensureCSS();
  var lecs = deckLecs();
  if (!lecs.length) { ctx.setSub(''); body.appendChild(App.placeholder('البطاقات غير متاحة الآن.')); return; }
  var sel = getSel();
  var tops = topicsIn(sel.lecs);
  if (sel.topic !== 'all' && tops.indexOf(sel.topic) < 0) sel.topic = 'all';
  var cards = deckFor(sel);
  var st = countDeck(cards);
  ctx.setSub(st.due ? 'مستحقة الآن: ' + st.due : (st.fresh ? 'جديدة: ' + st.fresh : 'راجعتِ كل البطاقات المستحقة'));

  var lecChips = h('div', { class: 'chips mo-chips' }, lecs.map(function (L) {
    var on = sel.lecs.indexOf(L) > -1;
    var b = chip([h('span', { richText: lecTitle(L).ar }), ' ', h('bdi', { dir: 'ltr' }, L)], on, function () {
      if (on && sel.lecs.length === 1) { App.toast('اختاري محاضرة واحدة على الأقل.'); return; }
      sel.lecs = on ? sel.lecs.filter(function (x) { return x !== L; }) : lecs.filter(function (x) { return x === L || sel.lecs.indexOf(x) > -1; });
      setSel(sel);
      ctx.refresh();
    }, 'lec ' + L);
    b.setAttribute('aria-label', L + ' ' + plain(lecTitle(L).ar));
    return b;
  }));
  var filter = h('div', { class: 'card filter' }, h('h3', null, 'المحاضرات'), lecChips);
  if (tops.length > 1) {
    var topicChips = h('div', { class: 'chips mo-chips' },
      chip('الكل', sel.topic === 'all', function () { sel.topic = 'all'; setSel(sel); ctx.refresh(); }),
      tops.map(function (id) {
        var tp = topicOf(id) || {};
        return chip(h('span', { richText: plain(tp.ar || id) }), sel.topic === id, function () { sel.topic = id; setSel(sel); ctx.refresh(); });
      }));
    filter.appendChild(h('h3', null, 'الموضوع'));
    filter.appendChild(topicChips);
  }
  body.appendChild(filter);

  var deck = h('div', { class: 'card mo-deck' });
  if (!cards.length) {
    deck.appendChild(h('p', { class: 'dim', style: 'font-size:15px;line-height:1.55' }, 'لا توجد بطاقات في هذا الاختيار.'));
    body.appendChild(deck);
    return;
  }
  var allDone = !st.due && !st.fresh;
  var bigFresh = !st.due && st.fresh > 0;
  deck.appendChild(h('div', { class: 'mo-due' }, h('b', { class: 'num' }, String(bigFresh ? st.fresh : st.due)), h('span', null, bigFresh ? 'جديدة' : 'مستحقة الآن')));
  deck.appendChild(h('p', { class: 'mo-deck-sub num' }, (bigFresh ? 'مستحقة الآن: 0' : 'جديدة: ' + st.fresh) + ' · كلها: ' + st.total));
  deck.appendChild(stBar(st.st, st.total));
  deck.appendChild(stLegend(st.st));
  if (allDone) deck.appendChild(h('div', { class: 'note' }, App.icon('check'), h('div', null, 'راجعتِ كل بطاقات هذه المجموعة. تقدرين أن تراجعيها مرة ثانية الآن.')));
  deck.appendChild(h('button', {
    class: 'btn btn-primary', type: 'button',
    onclick: function () { openDeck(sel, deckFor(sel), allDone); }
  }, allDone ? 'راجعيها مرة ثانية' : 'ابدئي'));
  body.appendChild(deck);
});

/* From Today: {topics:[…], unit:'<unit id>'|{id,…}} (also accepts {open:{topics}}, {unitId}, {task}).
   One full pass over the topic's cards marks the unit done. */
App.registerPage('cards-task', function (opts) {
  opts = opts || {};
  var unitObj = opts.unit && typeof opts.unit === 'object' ? opts.unit : null;
  var topics = opts.topics || (opts.open && opts.open.topics) || (unitObj && unitObj.open && unitObj.open.topics) || (opts.task && opts.task.topics) || [];
  var cards = deckForTopics(topics);
  var tp = topics.length === 1 ? topicOf(topics[0]) : null;
  var title = (unitObj && unitObj.ar) ? plain(unitObj.ar) : (tp && tp.ar ? plain(tp.ar) : 'بطاقات');
  var lec = tp && tp.lec ? tp.lec : (cards.length && cards.every(function (c) { return c.lec === cards[0].lec; }) ? cards[0].lec : null);
  return App.openPage(title, function (body, page) {
    ensureCSS();
    session(body, page, { cards: cards, fill: true, size: Math.max(cards.length, 1), unit: unitIdOf(opts) });
  }, { acc: lec });
});

/* =====================================================================
   5. Exam-night summary: three tabs in one segmented row
      «الفقرة» D.paragraphs + D.poems · «المصطلحات» D.cards · «انتبهي» confusable pairs
   ===================================================================== */
function groupHead(ar, en) {
  return h('div', { class: 'mo-gh' }, h('h3', { rich: ar || '' }), en ? h('bdi', { class: 't-en', dir: 'ltr', html: en }) : null);
}

/* -- «الفقرة»: skeleton + the poem lines the model paragraph quotes -- */
function quotesIn(p) {
  var out = [];
  (p.sentences || []).forEach(function (s) {
    var txt = plain(s.en), m, re = /[“"‘]([^”"’]{3,})[”"’]/g;
    while ((m = re.exec(txt))) out.push(norm(m[1]));
    if (s.gap) out.push(norm(s.gap));
  });
  return out.filter(function (q) { return q.length >= 4; });
}
function keyLines(p) {
  var poem = (D.poems || []).filter(function (x) { return x && x.id === p.poem; })[0];
  if (!poem || !(poem.lines || []).length) return [];
  var qs = quotesIn(p);
  var hit = poem.lines.filter(function (l) {
    var n = norm(l.t);
    return n && qs.some(function (q) { return n.indexOf(q) > -1; });
  });
  if (!hit.length) hit = poem.lines.filter(function (l) { return (l.marks || []).length; });
  return hit.slice(0, 4);
}
function lineRow(l) {
  var devs = [], seen = {};
  (l.marks || []).forEach(function (m) {
    if (!m || !m.dev || seen[m.dev]) return;
    seen[m.dev] = 1;
    var d = (D.devices || {})[m.dev] || {};
    devs.push({ en: d.en || m.dev, ar: d.ar || '' });
  });
  var ar = devs.map(function (d) { return d.ar; }).filter(Boolean);
  return h('div', { class: 'mo-pl-row' },
    h('p', { class: 'mo-pl-t', dir: 'ltr' }, plain(l.t)),
    devs.length ? h('div', { class: 'mo-pl-d' },
      ar.length ? h('span', { rich: ar.join('، ') }) : null,
      bdiEn(devs.map(function (d) { return d.en; }).join(' · '))) : null);
}
function buildParagraphs(box) {
  var list = (D.paragraphs || []).filter(function (p) { return p && (p.skeleton_ar || []).length; });
  if (!list.length) return false;
  box.appendChild(h('p', { class: 'mo-sec-note' }, 'في الاختبار موضوعان من هذه الثلاثة، وتكتبين فقرة عن واحد. هذا هيكل كل فقرة، وليس الفقرة كاملة.'));
  list.forEach(function (p) {
    var poem = (D.poems || []).filter(function (x) { return x && x.id === p.poem; })[0];
    var acc = App.acc('P');
    var g = h('section', { class: 'mo-grp' + (acc ? ' ' + acc : ''), 'aria-label': plain(p.ar) }, groupHead(p.ar, p.en));
    g.appendChild(h('div', { class: 'card mo-skel' }, h('ol', null, p.skeleton_ar.map(function (s) { return h('li', { rich: s }); }))));
    var lines = keyLines(p);
    if (lines.length) {
      g.appendChild(h('p', { class: 'mo-sub', richText: poem && poem.title ? 'أبيات للاستشهاد من ' + plain(poem.title) : 'أبيات للاستشهاد' }));
      g.appendChild(h('div', { class: 'card mo-pl' }, lines.map(lineRow)));
    }
    box.appendChild(g);
  });
  return true;
}

/* -- «المصطلحات»: one line per term; a tap opens the definition in a sheet -- */
var defIdx = null;
function defFor(term) {
  if (!defIdx) {
    defIdx = {};
    /* every def block, also inside `more`; the first one per term wins */
    var walk = function (blocks) {
      (blocks || []).forEach(function (b) {
        if (!b || typeof b !== 'object') return;
        if (Array.isArray(b.def) && b.def[0]) {
          var k = norm(b.def[0]);
          if (k && !defIdx[k]) defIdx[k] = { d: b.def, src: b.src || b.def[4] || null };
        }
        if (Array.isArray(b.blocks)) walk(b.blocks);
      });
    };
    (D.lessons || []).forEach(function (L) { if (L) walk(L.blocks); });
  }
  return defIdx[norm(term)] || null;
}
function srcNode(s) {
  if (!s) return null;
  if (/</.test(String(s))) return h('p', { class: 'mo-sh-src', rich: s });
  return h('p', { class: 'mo-sh-src' }, App.srcEl(String(s)));
}
function termSheet(c) {
  var d = defFor(c.f);
  App.sheet({
    title: c.f, acc: c.lec,
    body: function (box) {
      if (c.ar) box.appendChild(h('p', { class: 'mo-sh-ar', rich: c.ar }));
      if (c.b) box.appendChild(h('p', { class: 'mo-sh-en', dir: 'ltr', html: c.b }));
      if (d && d.d[3]) box.appendChild(h('p', { class: 'mo-sh-x', rich: d.d[3] }));
      if (d) { var s = srcNode(d.src); if (s) box.appendChild(s); }
    },
    cancel: 'إغلاق'
  });
}
function buildTerms(box, skipTopic) {
  var cards = allCards().filter(function (c) { return !skipTopic || c.topic !== skipTopic; });
  if (!cards.length) return false;
  lecOrder().forEach(function (L) {
    var list = cards.filter(function (c) { return c.lec === L; });
    if (!list.length) return;
    var t = lecTitle(L);
    var g = h('section', { class: 'mo-grp ' + App.acc(L), 'aria-label': plain(t.ar) },
      groupHead(App.esc(plain(t.ar)), App.esc(L + (t.en ? ' · ' + plain(t.en) : ''))));
    g.appendChild(h('div', { class: 'card mo-tl' }, list.map(function (x) {
      var c = x.c;
      return h('button', { class: 'mo-trow', type: 'button', onclick: function () { termSheet(c); } },
        c.ar ? h('span', { class: 'mo-trow-ar', rich: c.ar }) : null,
        h('bdi', { class: 'mo-trow-en', dir: 'ltr' }, c.f));
    })));
    box.appendChild(g);
  });
  return true;
}

/* -- «انتبهي»: confusable pairs, one short difference each.
   Source, in this order:
   1) the `compare` blocks of the confusables lesson (the lesson the plan opens right before
      the `confuse` practice unit; else a lesson id with "confus"; else the lesson with the most
      compare blocks). Each block = one pair; the line under it = the first point of each side.
   2) else the cards with topic `confuse` (front = the pair, back = the difference).
   Tapping a pair opens the full comparison in a sheet. -- */
function hasCompare(L) { return (L.blocks || []).some(function (b) { return b && Array.isArray(b.compare) && b.compare.length > 1; }); }
function confuseLesson() {
  var lessons = (D.lessons || []).filter(function (L) { return L && hasCompare(L); });
  if (!lessons.length) return null;
  var byId = {};
  lessons.forEach(function (L) { byId[L.id] = L; });
  var plan = D.plan || [];
  for (var i = 0; i < plan.length; i++) {
    var o = (plan[i] || {}).open || {};
    if (o.type !== 'lesson' || !byId[o.id]) continue;
    var nx = (plan[i + 1] || {}).open || {};
    if (/confus/i.test(plan[i].id || '') || (nx.topics || []).indexOf('confuse') > -1) return byId[o.id];
  }
  var named = lessons.filter(function (L) { return /confus/i.test(L.id || ''); })[0];
  if (named) return named;
  function n(L) { return L.blocks.filter(function (b) { return b && Array.isArray(b.compare) && b.compare.length > 1; }).length; }
  return lessons.slice().sort(function (a, b) { return n(b) - n(a); })[0];
}
function comparePairs() {
  var L = confuseLesson();
  if (!L) return [];
  var out = [];
  (L.blocks || []).forEach(function (b, i) {
    if (!b || !Array.isArray(b.compare) || b.compare.length < 2) return;
    var prev = L.blocks[i - 1];
    out.push({ block: b, head: prev && prev.h ? prev : null, lesson: L });
  });
  return out;
}
function pairSheet(p) {
  App.sheet({
    title: p.title, acc: p.lec,
    body: function (box) {
      var wrap = h('div', { class: 'mo-sh-blk' });
      App.renderBlocks([p.block], wrap, { lesson: p.lesson, lec: p.lec });
      box.appendChild(wrap);
    },
    cancel: 'إغلاق'
  });
}
function buildWatch(box) {
  var pairs = comparePairs(), rows = [];
  if (pairs.length) {
    pairs.forEach(function (p) {
      var cols = p.block.compare;
      var en = cols.map(function (c) { return plain(c.t); }).join(' · ');
      var ar = p.head && p.head.h ? plain(p.head.h) : cols.map(function (c) { return c.ar || ''; }).filter(Boolean).join(' · ');
      var lec = p.lesson.lec;
      var lines = cols.map(function (c) {
        var first = (c.items || [])[0];
        if (!first) return null;
        return h('p', { class: 'mo-w-d', rich: '<b>' + App.esc(plain(c.t)) + ':</b> ' + first });
      });
      rows.push(h('button', { class: 'mo-trow mo-w', type: 'button', onclick: function () { pairSheet({ block: p.block, lesson: p.lesson, lec: lec, title: en }); } },
        h('div', { class: 'mo-w-top' }, ar ? h('span', { class: 'mo-trow-ar', rich: ar }) : null, h('bdi', { class: 'mo-trow-en', dir: 'ltr' }, en)),
        lines));
    });
  } else {
    allCards().filter(function (c) { return c.topic === 'confuse'; }).forEach(function (x) {
      var c = x.c;
      rows.push(h('button', { class: 'mo-trow mo-w', type: 'button', onclick: function () { termSheet(c); } },
        h('div', { class: 'mo-w-top' }, c.ar ? h('span', { class: 'mo-trow-ar', rich: c.ar }) : null, h('bdi', { class: 'mo-trow-en', dir: 'ltr' }, c.f)),
        c.b ? h('p', { class: 'mo-w-d ltr', dir: 'ltr', html: c.b }) : null));
    });
  }
  if (!rows.length) return false;
  box.appendChild(h('p', { class: 'mo-sec-note' }, 'مصطلحات تتشابه في الاختيار من متعدد. المسي أي زوج لتري المقارنة كاملة.'));
  box.appendChild(h('section', { class: 'mo-grp' }, h('div', { class: 'card mo-tl' }, rows)));
  return pairs.length ? 'compare' : 'cards';
}

function buildSummary(body, page) {
  body.appendChild(h('div', { class: 'intro' },
    h('h1', null, 'ملخص ليلة الاختبار'),
    h('p', { class: 'mo-lead', richText: (D.examDate ? 'الاختبار يوم ' + App.fmtDate(D.examDate) + '. ' : '') + 'هذا تذكير سريع، وليس درسًا جديدًا.' })));

  var saved = prefs('more');
  var tabs = [], built = {};
  var watchBox = h('div'), watchSrc = false;
  try { watchSrc = buildWatch(watchBox); } catch (e) { console.error(e); watchSrc = false; }
  var paraBox = h('div'), termBox = h('div');
  var okPara = false, okTerms = false;
  try { okPara = buildParagraphs(paraBox); } catch (e) { console.error(e); }
  /* confuse cards already listed under «انتبهي» are left out of the term list */
  try { okTerms = buildTerms(termBox, watchSrc === 'cards' ? 'confuse' : null); } catch (e) { console.error(e); }
  if (okPara) tabs.push({ k: 'para', ar: 'الفقرة', box: paraBox });
  if (okTerms) tabs.push({ k: 'terms', ar: 'المصطلحات', box: termBox });
  if (watchSrc) tabs.push({ k: 'watch', ar: 'انتبهي', box: watchBox });
  if (!tabs.length) { body.appendChild(App.placeholder('الملخص غير متاح الآن.')); return; }
  tabs.forEach(function (t) { built[t.k] = t; });

  var seg = h('div', { class: 'seg mo-seg mo-sum-seg', role: 'group', 'aria-label': 'أقسام الملخص' });
  if (tabs.length > 1) body.appendChild(seg);
  tabs.forEach(function (t) { t.box.hidden = true; body.appendChild(t.box); });
  function show(k) {
    if (!built[k]) k = tabs[0].k;
    saved.sumTab = k;
    App.save();
    tabs.forEach(function (t) { t.box.hidden = t.k !== k; });
    var bs = seg.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', tabs[i].k === k ? 'true' : 'false');
  }
  tabs.forEach(function (t) {
    seg.appendChild(h('button', { type: 'button', 'aria-pressed': 'false', onclick: function () {
      if (saved.sumTab === t.k) return;
      show(t.k);
      try { page.el.scrollTop = 0; } catch (e) { /* ignore */ }
    } }, t.ar));
  });
  show(saved.sumTab);
}
/* {unit?} from Today: opening the summary marks its unit done. */
App.registerPage('summary', function (opts) {
  opts = opts || {};
  var u = unitIdOf(opts);
  var pg = App.openPage('ملخص ليلة الاختبار', function (body, page) { ensureCSS(); buildSummary(body, page); },
    { large: true, acc: 'P' });
  unitDone(u);
  return pg;
});

/* =====================================================================
   6. Settings: theme · export / import / reset progress · version
   ===================================================================== */
var THEMES = [{ v: 'system', ar: 'تلقائي' }, { v: 'light', ar: 'فاتح' }, { v: 'dark', ar: 'داكن' }];

function themeCard() {
  var cur = App.getTheme();
  var seg = h('div', { class: 'seg mo-seg', role: 'group', 'aria-label': 'المظهر' });
  THEMES.forEach(function (t) {
    seg.appendChild(h('button', {
      type: 'button', 'aria-pressed': cur === t.v ? 'true' : 'false',
      onclick: function () {
        App.setTheme(t.v);
        var bs = seg.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', THEMES[i].v === t.v ? 'true' : 'false');
      }
    }, t.ar));
  });
  return h('div', { class: 'card mo-pad' }, seg);
}

/* the export's own app name, so a phonetics backup is refused */
function exportApp() {
  try { return JSON.parse(App.exportState()).app || null; } catch (e) { return null; }
}
function parseBackup(text) {
  var obj;
  try { obj = JSON.parse(String(text || '').trim()); } catch (e) { return null; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  var mine = exportApp();
  if (obj.app && (obj.app === 'phonetics' || (mine && obj.app !== mine))) return null;
  var raw = obj.state && typeof obj.state === 'object' ? obj.state : obj;
  function isMap(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  if (!isMap(raw) || !['q', 'cards', 'lessons', 'tasks', 'units'].some(function (k) { return isMap(raw[k]); })) return null;
  return { at: obj.at || null, q: keys(raw.q).length, cards: keys(raw.cards).length, lessons: keys(raw.lessons).length };
}

var importDraft = '';
function exportSheet(rebuild) {
  var text = App.exportState();
  var ta = h('textarea', { readonly: true, 'aria-label': 'نص التقدّم', dir: 'ltr' });
  ta.value = text;
  var p = prefs('more');
  p.exportedAt = Date.now();
  App.save();
  var actions = [{
    label: 'انسخي النص', kind: 'primary', onClick: function () {
      App.copyText(text).then(function (ok) {
        if (ok) App.toast('نسختُ النص.');
        else { try { ta.focus(); ta.select(); } catch (e) { /* ignore */ } App.toast('اضغطي على النص مطوّلًا، ثم انسخيه.'); }
      });
      return false;
    }
  }];
  if (navigator.share) {
    actions.push({
      label: 'شاركي', kind: 'soft', onClick: function () {
        navigator.share({ title: 'تقدّمي في الأدب', text: text }).catch(function () { /* cancelled */ });
        return false;
      }
    });
  }
  App.sheet({
    title: 'صدّري تقدّمكِ',
    text: 'انسخي النص واحفظيه في الملاحظات، أو أرسليه لنفسكِ. ثم الصقيه في «استوردي التقدّم» على الجهاز الآخر.',
    body: function (box) { box.appendChild(ta); },
    actions: actions, cancel: 'إغلاق', onClose: rebuild
  });
}
function importSheet(rebuild) {
  var ta = h('textarea', { 'aria-label': 'نص التقدّم', dir: 'ltr', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false' });
  ta.value = importDraft;
  var err = h('p', { class: 'mo-err', role: 'alert' });
  ta.addEventListener('input', function () { importDraft = ta.value; err.textContent = ''; });
  var paste = null;
  if (navigator.clipboard && navigator.clipboard.readText) {
    paste = h('button', { class: 'btn btn-tint mo-paste', type: 'button' }, 'الصقي من الحافظة');
    paste.addEventListener('click', function () {
      navigator.clipboard.readText().then(function (t) { ta.value = importDraft = t || ''; err.textContent = ''; })
        .catch(function () { App.toast('اضغطي على المربع مطوّلًا، ثم اختاري «لصق».'); });
    });
  }
  App.sheet({
    title: 'استوردي تقدّمكِ',
    text: 'الصقي النص الذي صدّرتِه من الجهاز الآخر.',
    body: function (box) { box.appendChild(ta); box.appendChild(err); if (paste) box.appendChild(paste); },
    actions: [{
      label: 'استوردي', kind: 'primary', onClick: function () {
        var text = ta.value;
        if (!String(text).trim()) { err.textContent = 'الصقي النص أولًا.'; return false; }
        var info = parseBackup(text);
        if (!info) { err.textContent = 'هذا النص ليس نسخة تقدّم صحيحة.'; return false; }
        var when = info.at && !isNaN(Date.parse(info.at)) ? ' صُدّرت ' + fmtWhen(Date.parse(info.at)) + '.' : '';
        App.ask({
          title: 'نستبدل تقدّمكِ الحالي؟',
          text: 'سنضع النسخة التي لصقتِها مكان تقدّمكِ الحالي على هذا الجهاز.' + when + ' فيها: الأسئلة ' + info.q + ' · البطاقات ' + info.cards + ' · الدروس ' + info.lessons + '.',
          ok: 'استبدلي', danger: true
        }).then(function (yes) {
          if (!yes) return;
          var r = App.importState(text);
          if (r && r.ok) { importDraft = ''; App.toast('استوردتُ تقدّمكِ.'); rebuild(); }
          else App.sheet({ title: 'لم يُستورد التقدّم', text: (r && r.error) || 'هذا النص ليس نسخة تقدّم صحيحة.', cancel: 'إغلاق' });
        });
      }
    }],
    cancel: true
  });
}
function resetAsk(rebuild) {
  App.ask({
    title: 'نصفّر التقدّم؟',
    text: 'سنحذف إجاباتكِ وبطاقاتكِ ودروسكِ وما أنهيتِه من الخطة. صدّري نسخة أولًا إذا أردتِ الرجوع إليها. سيبقى المظهر كما هو.',
    ok: 'صفّري', danger: true
  }).then(function (yes) {
    if (!yes) return;
    App.resetState();
    App.toast('صفّرتُ التقدّم.');
    rebuild();
  });
}
/* The release version = the suffix of the newest 'lit-shell-<VERSION>' cache (sw.js); else App.version. */
function appVersion(cb) {
  var fallback = App.version ? String(App.version) : '';
  if (!window.caches || !caches.keys) { cb(fallback); return; }
  caches.keys().then(function (ks) {
    var vs = ks.filter(function (k) { return k.indexOf('lit-shell-') === 0; }).map(function (k) { return k.slice(10); });
    vs.sort(function (a, b) { return (parseInt(b.replace(/\D/g, ''), 10) || 0) - (parseInt(a.replace(/\D/g, ''), 10) || 0); });
    cb(vs[0] || fallback);
  }).catch(function () { cb(fallback); });
}

function buildSettings(body, page) {
  function rebuild() { if (page && page.replace) page.replace('الإعدادات', buildSettings); }
  var env = App.env || {};
  body.appendChild(h('div', { class: 'intro' }, h('h1', null, 'الإعدادات')));

  body.appendChild(App.secHead('المظهر'));
  body.appendChild(themeCard());

  body.appendChild(App.secHead('التقدّم'));
  body.appendChild(h('div', { class: 'list' },
    App.row({ title: 'صدّري التقدّم', sub: 'انسخي نسخة منه أو شاركيها', icon: 'share', iconBg: 'var(--tint)', onClick: function () { exportSheet(rebuild); } }),
    App.row({ title: 'استوردي التقدّم', sub: 'الصقي نسخة صدّرتِها من قبل', icon: 'doc', iconBg: 'var(--l1-btn)', onClick: function () { importSheet(rebuild); } })));
  var saved = App.state.prefs.savedAt, exported = prefs('more').exportedAt;
  var foot = [];
  if (!App.storageOK()) foot.push('هذا المتصفح لا يحفظ التقدّم، فسيضيع عند إغلاق الصفحة.');
  else if (saved) foot.push('آخر حفظ: ' + fmtWhen(saved) + '.');
  if (exported) foot.push('آخر تصدير: ' + fmtWhen(exported) + '.');
  if (foot.length) body.appendChild(h('p', { class: 'mo-foot num' }, foot.join(' ')));

  var where = env.standalone ? 'أنتِ الآن في تطبيق الشاشة الرئيسية.' : (env.safari ? 'أنتِ الآن في Safari.' : '');
  body.appendChild(h('div', { class: 'banner mo-banner', role: 'note' }, App.icon('info'),
    h('div', { class: 'b-txt' }, h('div', { richText: 'تطبيق الشاشة الرئيسية يحفظ تقدّمه وحده، منفصلًا عن Safari. إذا انتقلتِ من أحدهما إلى الآخر، صدّري تقدّمكِ من الأول واستورديه في الثاني.' + (where ? ' ' + where : '') }))));

  body.appendChild(h('div', { class: 'list', style: 'margin-top:26px' },
    App.row({ title: 'صفّري التقدّم', className: 'mo-danger', chev: false, onClick: function () { resetAsk(rebuild); } })));

  var ver = h('bdi', { class: 'mo-ver num', dir: 'ltr' }, ' ');
  body.appendChild(App.secHead('عن التطبيق'));
  body.appendChild(h('div', { class: 'list' }, App.row({ title: 'الإصدار', end: ver })));
  appVersion(function (v) { ver.textContent = v || '—'; });
}
App.registerPage('settings', function () {
  return App.openPage('الإعدادات', function (body, page) { ensureCSS(); buildSettings(body, page); }, { large: true });
});
})();
