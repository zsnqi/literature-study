/* app-practice.js — practice module (literature).
   Owns: the Practice tab; the pages practice-task / mock / mistakes / quick-check; answer recording through App.recordAnswer.
   Questions come only from D.questions (mcq and tf). Contract: docs/app-api.md. Copy: docs/copy-guide.md. */
(function () {
'use strict';
var App = window.App;
if (!App) return;
var D = App.D || {};
var h = App.h;

/* =====================================================================
   1. Styles (only what index.html does not already have; tokens only)
   ===================================================================== */
var CSS = [
  '.pr-qs{display:flex;flex-direction:column;',
  '  min-height:calc(100vh - 72px - env(safe-area-inset-top) - env(safe-area-inset-bottom));',
  '  min-height:calc(100dvh - 72px - env(safe-area-inset-top) - env(safe-area-inset-bottom));',
  '  animation:prIn .28s cubic-bezier(.16,1,.3,1)}',
  '@keyframes prIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
  '.pr-grow{flex:1 1 auto;min-height:6px}',
  '.pr-end{margin-inline-start:auto}',
  '.pr-q{white-space:pre-line}',
  '.opt:disabled{cursor:default;color:inherit}',
  '.opt.pr-sel{border-color:var(--tint);background:var(--fill2)}',
  '.opt.pr-sel .o-k{background:var(--tint);color:#fff}',
  '.pr-tf .opt{flex-direction:column;gap:0;min-height:60px}',
  '.pr-tf .opt small{font-size:12px;font-weight:500;color:var(--label2);direction:ltr}',
  /* bottom bar: the next/result button */
  '.pr-bar{position:sticky;bottom:0;z-index:4;margin:14px -16px calc(-28px - env(safe-area-inset-bottom));padding:10px 16px calc(10px + env(safe-area-inset-bottom));',
  '  background:var(--bar);border-top:0.5px solid var(--bar-line);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}',
  '@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){.pr-bar{background:var(--bg)}}',
  /* feedback */
  '.fb.right .fb-head svg{animation:prPop .4s cubic-bezier(.25,1,.5,1)}',
  '@keyframes prPop{from{opacity:.4;transform:scale(.6)}to{opacity:1;transform:scale(1)}}',
  '.pr-pk{display:flex;align-items:baseline;gap:10px;margin-top:10px}',
  '.pr-pk > span{flex:none;min-width:58px;font-size:14px;font-weight:700}',
  '.pr-pk.bad > span{color:var(--bad)}.pr-pk.ok > span{color:var(--ok)}',
  '.pr-pk .pr-pv{flex:1;min-width:0;font-size:16px;line-height:1.45}',
  '.pr-pk bdi.pr-pv{direction:ltr;text-align:left;unicode-bidi:isolate}',
  /* practice tab */
  '.pr-lico{font-size:12px;font-weight:700;letter-spacing:.01em;direction:ltr}',
  '.pr-list2{margin-top:14px}',
  '.pr-small{margin-top:10px;font-size:13px;color:var(--label2);line-height:1.5}',
  /* end screens */
  '.pr-endwrap{padding-top:6px;animation:prIn .28s cubic-bezier(.16,1,.3,1)}',
  '.pr-result{position:relative;overflow:hidden}',
  '.pr-actions{display:grid;gap:10px;margin-top:14px}',
  '.pr-intro{padding:18px 16px}',
  '.pr-intro h2{font-size:22px;font-weight:700;line-height:1.25}',
  '.pr-intro p{margin-top:8px;font-size:15px;color:var(--label2);line-height:1.55}',
  '.pr-intro .list{margin-top:14px;background:var(--raised);box-shadow:none}',
  '.pr-rev .row .txt b{direction:ltr;text-align:left;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:16px}',
  '.pr-sheet-fb{max-height:58vh;overflow-y:auto;margin-top:10px;-webkit-overflow-scrolling:touch}',
  '.pr-sheet-fb .fb{margin-top:10px}',
  '.pr-qline{direction:ltr;text-align:left;font-size:17px;font-weight:600;line-height:1.45;white-space:pre-line}',
  /* quick check end */
  '.pr-qc-wrong{padding:14px 16px;margin-top:12px}',
  '.pr-qc-wrong .fb-why{margin-top:8px;font-size:15px;line-height:1.55}'
].join('\n');
(function injectCSS() {
  try {
    if (document.getElementById('css-practice')) return;
    var st = document.createElement('style');
    st.id = 'css-practice';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* no styles is better than no module */ }
})();

/* =====================================================================
   2. Vocabulary
   ===================================================================== */
var LECS = ['L1', 'L2', 'L3'];
var ROUND = 15;      /* questions in one practice round */
var QUICK = 3;       /* questions in the quick check at the end of a lesson */
var MOCK_N = 15;     /* Part 1 of the exam: 15 MCQ */
var KIND_AR = { mcq: '', tf: 'صح أو خطأ' };
var TYPE_ORDER = ['mcq', 'tf'];

/* =====================================================================
   3. Small helpers
   ===================================================================== */
function prefs() {
  var p = App.state.prefs;
  if (!p.practice || typeof p.practice !== 'object' || Array.isArray(p.practice)) p.practice = {};
  return p.practice;
}
function arr(x) { return Array.isArray(x) ? x : []; }
function n11(n) { return n <= 1 ? 'سؤال' : (n === 2 ? 'سؤالان' : (n >= 3 && n <= 10 ? 'أسئلة' : 'سؤالًا')); }
function qCount(n) { return App.plural ? App.plural(n, ['سؤال واحد', 'سؤالان', 'أسئلة', 'سؤالًا']) : n + ' ' + n11(n); }
function reduced() { return App.reducedMotion ? App.reducedMotion() : false; }
function lecName(l) { return App.lecName ? App.lecName(l) : l; }
function topicAr(t) { var x = (D.topics || {})[t]; return x && x.ar ? x.ar : ''; }
function topicLec(t) { var x = (D.topics || {})[t]; return x && x.lec ? x.lec : null; }
function lecIcon(l) { return h('span', { class: 'pr-lico', dir: 'ltr' }, l); }
function lecBg(l) { return 'var(--' + String(l).toLowerCase() + '-btn, var(--tint))'; }
/* the plan unit a page was opened for: { unit: 'id' } (also accepts an object with .id, unitId, or task.id) */
function unitIdOf(o) {
  if (!o) return null;
  var u = o.unit != null ? o.unit : (o.unitId != null ? o.unitId : (o.task && o.task.id));
  if (u && typeof u === 'object') u = u.id;
  return u != null && u !== '' ? String(u) : null;
}
function markUnit(id) {
  if (!id || typeof App.unitDone !== 'function') return;
  try { App.unitDone(id); } catch (e) { console.error('[practice] unitDone failed', e); }
}

/* =====================================================================
   4. Question bank (only the authored D.questions; ids are stable)
   ===================================================================== */
var BANK = null, BYID = {};
function buildBank() {
  BANK = [];
  arr(D.questions).forEach(function (x) {
    if (!x || !x.id || BYID[x.id]) return;
    if (x.type === 'mcq' && !(arr(x.o).length && x.o[x.a] != null)) return;
    if (x.type !== 'mcq' && x.type !== 'tf') return;
    var q = { id: x.id, type: x.type, lec: x.lec, topic: x.topic || String(x.lec || '').toLowerCase(), x: x };
    BYID[q.id] = q;
    BANK.push(q);
  });
}
function bank() { if (!BANK) buildBank(); return BANK; }
function getQ(id) { bank(); return BYID[id] || null; }

/* options, shuffled on every showing; idx[i] = index in x.o */
function mcqOptions(q) {
  var idx = App.shuffle(q.x.o.map(function (o, i) { return i; }));
  return { opts: idx.map(function (i) { return q.x.o[i]; }), idx: idx, a: idx.indexOf(q.x.a) };
}

/* pools */
function poolForLecs(lecs) {
  lecs = arr(lecs);
  return bank().filter(function (q) { return !lecs.length || lecs.indexOf(q.lec) > -1; });
}
function poolForTopics(topics) {
  topics = arr(topics);
  return bank().filter(function (q) { return topics.indexOf(q.topic) > -1; });
}
var RANK = { wrong: 0, new: 1, right: 2, mastered: 3 };
/* wrong first, then new, then right, then mastered (random inside each group) */
function order(list) {
  return App.shuffle(list).map(function (q, i) {
    return { q: q, k: RANK[App.qStatus(q.id)] || 0, i: i };
  }).sort(function (a, b) { return a.k - b.k || a.i - b.i; }).map(function (o) { return o.q; });
}
function makeList(pool, n) { return order(pool).slice(0, Math.max(0, n)); }

/* short one-line form of a question (lists, review rows) */
function promptEl(q) { return h('bdi', { dir: 'ltr', lang: 'en' }, q.x ? q.x.q : q.id); }
function rightText(q) { return q.type === 'tf' ? (q.x.a ? 'صح' : 'خطأ') : q.x.o[q.x.a]; }
function givenText(q, given, extra) {
  if (q.type === 'mcq' && extra && extra.pickO != null) return q.x.o[extra.pickO];
  return given == null ? '' : String(given);
}

/* =====================================================================
   5. Question views
   ctx.pick(ok, given, extra): the answer is final (practice) or a selection (mock, can change)
   ===================================================================== */
function promptNode(q) {
  return h('div', null, h('p', { class: 'q-text ltr pr-q', dir: 'ltr', lang: 'en' }, q.x.q));
}

function choiceView(q, ctx) {
  var m = mcqOptions(q);
  var wrap = h('div', { class: 'opts' });
  var btns = m.opts.map(function (o, i) {
    var b = h('button', { class: 'opt ltr', type: 'button', dir: 'ltr', lang: 'en', 'aria-pressed': ctx.mock ? 'false' : null },
      h('span', { class: 'o-k' }, String.fromCharCode(97 + i)), h('span', null, o));
    b.addEventListener('click', function () { pick(i); });
    wrap.appendChild(b);
    return b;
  });
  function pick(i) {
    if (ctx.answered) return;
    if (ctx.mock) {
      btns.forEach(function (b, j) { b.classList.toggle('pr-sel', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    } else {
      btns.forEach(function (b, j) { b.disabled = true; b.classList.add(j === m.a ? 'right' : (j === i ? 'wrong' : 'muted')); });
    }
    ctx.pick(i === m.a, m.opts[i], { pickO: m.idx[i] });
  }
  return {
    el: wrap,
    lock: function () { btns.forEach(function (b) { b.disabled = true; }); },
    key: function (e) {
      var n = '1234'.indexOf(e.key);
      if (n < 0) n = 'abcd'.indexOf(e.key);
      if (n > -1 && n < btns.length) { pick(n); return true; }
      return false;
    }
  };
}

function tfView(q, ctx) {
  var wrap = h('div', { class: 'tf pr-tf' });
  var vals = [[true, 'صح', 'True'], [false, 'خطأ', 'False']];
  var right = !!q.x.a;
  var btns = vals.map(function (v) {
    var b = h('button', { class: 'opt', type: 'button', 'aria-pressed': ctx.mock ? 'false' : null }, h('span', null, v[1]), h('small', null, v[2]));
    b.addEventListener('click', function () { pick(v[0]); });
    wrap.appendChild(b);
    return b;
  });
  function pick(val) {
    if (ctx.answered) return;
    if (ctx.mock) {
      btns.forEach(function (b, j) { var on = vals[j][0] === val; b.classList.toggle('pr-sel', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    } else {
      btns.forEach(function (b, j) { b.disabled = true; b.classList.add(vals[j][0] === right ? 'right' : (vals[j][0] === val ? 'wrong' : 'muted')); });
    }
    ctx.pick(val === right, val ? 'صح' : 'خطأ', { pickTF: val });
  }
  return {
    el: wrap,
    lock: function () { btns.forEach(function (b) { b.disabled = true; }); },
    key: function (e) {
      if (e.key === 't' || e.key === '1') { pick(true); return true; }
      if (e.key === 'f' || e.key === '2') { pick(false); return true; }
      return false;
    }
  };
}
var VIEWS = { mcq: choiceView, tf: tfView };

/* =====================================================================
   6. Feedback: right or wrong, her choice and the right one, then why
   ===================================================================== */
function pickRow(label, value, cls, english) {
  return h('div', { class: 'pr-pk ' + cls },
    h('span', null, label),
    english ? h('bdi', { class: 'pr-pv', dir: 'ltr', lang: 'en' }, value) : h('span', { class: 'pr-pv' }, value));
}
/* review = shown away from the option buttons (mock review sheet), so the right answer is always written out */
function fbNode(q, ok, given, extra, review) {
  var x = q.x, english = q.type === 'mcq';
  var fb = h('div', { class: 'fb ' + (ok ? 'right' : 'wrong'), role: 'status' },
    h('p', { class: 'fb-head' }, App.icon(ok ? 'checkFill' : 'info'), h('span', null, ok ? 'صح، أحسنتِ' : 'غلط')));
  try {
    if (!ok) {
      var g = givenText(q, given, extra);
      if (g) fb.appendChild(pickRow('اخترتِ', g, 'bad', english));
      fb.appendChild(pickRow('الصحيح', rightText(q), 'ok', english));
    } else if (review) {
      fb.appendChild(pickRow('الجواب', rightText(q), 'ok', english));
    }
    if (x.why) fb.appendChild(h('p', { class: 'fb-why', rich: x.why }));
    if (x.src) fb.appendChild(h('p', { class: 'fb-src' }, App.srcEl(x.src)));
  } catch (e) { console.error('[practice] explanation failed', e); }
  return fb;
}

/* =====================================================================
   7. Session engine: one question per screen
   modes: practice (round), redo (a fixed list), mock (no feedback until the end)
   ===================================================================== */
var active = null;   /* {page, onKey} of the screen that listens to the hardware keyboard */

function record(s, q, ok) {
  var topics = [q.topic];
  if (s.mode === 'mock') topics.unshift('mock');
  else if (s.mode === 'quick') topics.unshift('quick');
  return App.recordAnswer(q.id, ok, { topics: topics, type: q.type, lec: q.lec });
}
function progressOf(s) {
  var n = s.list.length, done = s.i + (s.cur && s.cur.answered ? 1 : 0);
  return { f: n ? done / n : 0, t: Math.min(s.i + 1, n) + ' من ' + n };
}
function isLast(s) { return s.i >= s.list.length - 1; }
function scrollIntoBar(page, el, bar) {
  try {
    var sc = page.el, r = el.getBoundingClientRect(), pr = sc.getBoundingClientRect();
    var limit = pr.bottom - (bar ? bar.offsetHeight : 0) - 12;
    var over = r.bottom - limit;
    var room = r.top - pr.top - 60;
    var dy = Math.min(over, room);
    if (dy <= 0) return;
    var start = sc.scrollTop, target = start + dy;
    if (reduced() || !('scrollBehavior' in document.documentElement.style)) { sc.scrollTop = target; return; }
    sc.scrollTo({ top: target, behavior: 'smooth' });
    /* some engines drop a smooth scroll (page in the background, busy frame): finish it */
    setTimeout(function () { if (Math.abs(sc.scrollTop - start) < dy / 2) sc.scrollTop = target; }, 700);
  } catch (e) { /* old engines */ }
}

function newRun(page, cfg) {
  var s = { page: page, cfg: cfg, mode: cfg.mode, list: cfg.list, i: cfg.start || 0, res: cfg.res || [], cur: null, onKey: null };
  active = s;
  if (!s.list.length || s.i >= s.list.length) { cfg.end(s); return s; }
  showQ(s);
  return s;
}

function showQ(s) {
  var q = s.list[s.i];
  var page = s.page, body = page.body, mock = s.mode === 'mock';
  body.textContent = '';
  try { page.el.scrollTop = 0; } catch (e) { /* ignore */ }
  var ctx = { q: q, answered: false, mock: mock };
  s.cur = ctx;
  var fill = h('i'), cnt = h('span', { class: 'q-count num' });
  function paintTop() { var p = progressOf(s); fill.style.transform = 'scaleX(' + p.f + ')'; cnt.textContent = p.t; }
  var wrap = h('div', { class: 'pr-qs ' + App.acc(q.lec) },
    h('div', { class: 'q-top' }, h('div', { class: 'q-prog', 'aria-hidden': 'true' }, fill), cnt));
  paintTop();
  /* the state chip shows only after she answers (before that it would read as a verdict) */
  var chip = null;
  var meta = h('div', { class: 'q-meta' }, App.tag(q.lec), KIND_AR[q.type] ? h('span', { class: 'q-kind' }, KIND_AR[q.type]) : null);
  var card = h('section', { class: 'card q-card', 'aria-label': 'السؤال' }, meta, promptNode(q));
  var view = (VIEWS[q.type] || choiceView)(q, ctx);
  card.appendChild(view.el);
  var after = h('div');
  wrap.appendChild(card);
  wrap.appendChild(after);
  wrap.appendChild(h('div', { class: 'pr-grow' }));
  body.appendChild(wrap);
  var nextBtn = null, pending = null;

  function nextLabel() { return isLast(s) ? 'النتيجة' : 'التالي'; }
  /* save the answer: record it, keep it in the run */
  function commit(ok, given, extra) {
    ctx.answered = true;
    s.res.push({ q: q, ok: !!ok, given: given, extra: extra || null });
    if (s.cfg.onAnswer) { try { s.cfg.onAnswer(s); } catch (e) { console.error(e); } }
    return record(s, q, ok);
  }

  if (mock) {
    /* the button sits there from the start; it wakes up once she picks */
    nextBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true, onclick: function () {
      if (!pending || ctx.answered) return;
      if (view.lock) view.lock();
      commit(pending.ok, pending.given, pending.extra);
      next(s);
    } }, nextLabel());
    wrap.appendChild(h('div', { class: 'pr-bar' }, nextBtn));
    ctx.pick = function (ok, given, extra) { pending = { ok: ok, given: given, extra: extra }; nextBtn.disabled = false; };
  } else {
    ctx.pick = function (ok, given, extra) {
      if (ctx.answered) return;
      var st = commit(ok, given, extra);
      if (!chip) { chip = App.stateChip(st); chip.classList.add('pr-end'); meta.appendChild(chip); }
      paintTop();
      after.appendChild(fbNode(q, ok, given, extra, false));
      nextBtn = h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { next(s); } }, nextLabel());
      var nb = h('div', { class: 'pr-bar' }, nextBtn);
      wrap.appendChild(nb);
      var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
      raf(function () { scrollIntoBar(page, after, nb); });
    };
  }
  s.onKey = function (e) {
    if (nextBtn && !nextBtn.disabled && (e.key === 'Enter' || (ctx.answered && e.key === ' '))) { nextBtn.click(); return true; }
    if (ctx.answered) return false;
    return view.key ? view.key(e) : false;
  };
}

function next(s) {
  s.i++;
  if (s.i >= s.list.length) { s.cfg.end(s); return; }
  showQ(s);
}

/* ----- end screens ----- */
function confetti(card) {
  if (reduced()) return;
  var box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  var cols = ['var(--l1)', 'var(--l2)', 'var(--l3)', 'var(--ok)', 'var(--tint)'];
  for (var i = 0; i < 22; i++) {
    box.appendChild(h('i', { style: 'left:' + Math.round(Math.random() * 96) + '%;background:' + cols[i % cols.length] + ';animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's' }));
  }
  card.appendChild(box);
}
function scoreMsg(r, n) {
  if (!n) return '';
  var f = r / n;
  return f >= 0.8 ? 'أحسنتِ!' : (f >= 0.5 ? 'تقدّم جميل، كمّلي.' : 'راجعي الشرح، ثم جرّبي مرة ثانية.');
}
function resultCard(right, total, msg, parts) {
  var card = h('section', { class: 'card result pr-result' },
    h('p', { class: 'r-big num', dir: 'ltr' }, String(right), h('small', null, ' / ' + total)),
    msg ? h('p', { richText: msg }) : null,
    parts ? h('div', { class: 'r-parts' }, parts.map(function (p) { return h('div', null, h('b', { class: 'num', dir: 'ltr' }, String(p[1])), h('span', null, p[0])); })) : null);
  if (total && right / total >= 0.8) confetti(card);
  return card;
}
function endScreen(page, nodes, actions) {
  var body = page.body;
  body.textContent = '';
  try { page.el.scrollTop = 0; } catch (e) { /* ignore */ }
  var wrap = h('div', { class: 'pr-endwrap' }, nodes);
  var btns = (actions || []).filter(Boolean).map(function (a) {
    return h('button', { class: 'btn ' + (a.kind === 'soft' ? 'btn-soft' : (a.kind === 'tint' ? 'btn-tint' : 'btn-primary')), type: 'button', onclick: a.fn }, a.label);
  });
  if (btns.length) wrap.appendChild(h('div', { class: 'pr-actions' }, btns));
  body.appendChild(wrap);
  active = { page: page, onKey: function (e) { if (e.key === 'Enter' && btns[0]) { btns[0].click(); return true; } return false; } };
  return wrap;
}
function emptyScreen(page) {
  endScreen(page, [h('section', { class: 'card pr-intro' },
    h('h2', null, 'لا توجد أسئلة هنا'),
    h('p', null, 'الأسئلة غير متاحة الآن. جرّبي مرة ثانية بعد قليل.'))],
    [{ label: 'رجوع', fn: function () { page.close(); } }]);
}
function tally(res) {
  var right = 0, ids = {}, mastered = 0;
  res.forEach(function (r) { if (r.ok) right++; ids[r.q.id] = 1; });
  Object.keys(ids).forEach(function (id) { if (App.qStatus(id) === 'mastered') mastered++; });
  return { right: right, n: res.length, wrong: res.length - right, mastered: mastered };
}
function wrongQs(res) {
  var seen = {}, out = [];
  res.forEach(function (r) { if (!r.ok && !seen[r.q.id]) { seen[r.q.id] = 1; out.push(r.q); } });
  return out;
}
function statParts(t) { return [['صح', t.right], ['غلط', t.wrong], ['متقَن', t.mastered]]; }

/* ----- runs ----- */
/* one round of up to 15 questions from the pool; unit = the Today unit to mark done at the end */
function runPractice(page, pool, unit) {
  if (!pool.length) { emptyScreen(page); return; }
  newRun(page, { mode: 'practice', list: makeList(pool, Math.min(ROUND, pool.length)), end: function (s) { endPractice(s, pool, unit); } });
}
function endPractice(s, pool, unit) {
  var t = tally(s.res), wq = wrongQs(s.res);
  if (unit) markUnit(unit);
  var again = function () { runPractice(s.page, pool, null); };
  var redo = wq.length ? { label: 'أعيدي الغلط', fn: function () { runRedo(s.page, wq, again, 'جولة جديدة'); } } : null;
  if (unit) {
    endScreen(s.page, [resultCard(t.right, t.n, 'خلصتِ هذه الخطوة. ' + scoreMsg(t.right, t.n), statParts(t))], [
      /* with wrong answers the useful next step is the redo; «رجوع» turns soft */
      redo ? redo : { label: 'رجوع', fn: function () { s.page.close(); } },
      redo ? { label: 'رجوع', kind: 'soft', fn: function () { s.page.close(); } } : null,
      { label: 'جولة جديدة', kind: 'soft', fn: again }
    ]);
    return;
  }
  endScreen(s.page, [resultCard(t.right, t.n, scoreMsg(t.right, t.n), statParts(t))], [
    redo ? redo : { label: 'كمّلي', fn: again },
    redo ? { label: 'كمّلي', kind: 'soft', fn: again } : null
  ]);
}
/* redo a list of questions; afterwards offer `then` (label thenLabel) */
function runRedo(page, qs, then, thenLabel) {
  newRun(page, { mode: 'redo', list: qs.slice(), end: function (s) {
    var t = tally(s.res);
    endScreen(s.page, [resultCard(t.right, t.n, 'صحّحتِ ' + t.right + ' من ' + t.n + '.', null)], [
      then ? { label: thenLabel || 'رجوع', fn: then } : { label: 'رجوع', fn: function () { s.page.close(); } }
    ]);
  } });
}

/* ----- page helper ----- */
function sessionPage(title, acc, build) {
  return App.openPage(title, function (body, page) { build(page); }, {
    acc: acc, className: 'pr-page',
    onClose: function (page) { if (active && active.page === page) active = null; }
  });
}
function onDocKey(e) {
  var s = active;
  if (!s || !s.onKey || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  if (App.topPage() !== s.page) return;
  if (document.querySelector('.sheet.on')) return;
  var t = e.target;
  if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) return;
  if ((e.key === ' ' || e.key === 'Enter') && t && t.tagName === 'BUTTON') return;   /* native button activation */
  if (s.onKey(e)) e.preventDefault();
}
App.onReady(function () { document.addEventListener('keydown', onDocKey); });

/* =====================================================================
   8. Practice tab: a short list
   ===================================================================== */
/* «صح 12 من 40»: questions whose last answer was right (or mastered) */
function progSub(pool) {
  var n = pool.length;
  if (!n) return 'لا توجد أسئلة بعد.';
  var c = App.countStatus(pool.map(function (q) { return q.id; }));
  var r = c.right + c.mastered;
  return r ? 'صح ' + r + ' من ' + n : qCount(n);
}
function openPool(title, acc, pool) {
  sessionPage(title, acc, function (page) { runPractice(page, pool, null); });
}
function renderTab(body, ctx) {
  bank();
  ctx.setSub('كل جولة ' + ROUND + ' سؤالًا، والشرح بعد كل إجابة.');
  var all = bank();
  var rows = [App.row({ title: 'كل الأسئلة', sub: progSub(all), icon: 'redo', iconBg: 'var(--tint)',
    onClick: function () { openPool('كل الأسئلة', null, poolForLecs([])); } })];
  LECS.forEach(function (l) {
    var pool = poolForLecs([l]);
    if (!pool.length) return;
    rows.push(App.row({ title: lecName(l), sub: progSub(pool), icon: lecIcon(l), iconBg: lecBg(l),
      onClick: function () { openPool(lecName(l), l, poolForLecs([l])); } }));
  });
  var conf = poolForTopics(['confuse']);
  if (conf.length) rows.push(App.row({ title: 'المصطلحات المتشابهة', sub: progSub(conf), icon: 'compass', iconBg: 'var(--tint)',
    onClick: function () { openPool('المصطلحات المتشابهة', null, poolForTopics(['confuse'])); } }));
  body.appendChild(h('div', { class: 'list' }, rows));
  if (!all.length) body.appendChild(h('p', { class: 'pr-small' }, 'الأسئلة غير متاحة الآن.'));

  var P = prefs(), run = validMockRun(), last = P.mockLast;
  var mockSub = run ? 'كمّلي من السؤال ' + (run.i + 1)
    : (last && last.score != null ? 'آخر نتيجة: ' + last.score + ' من ' + (last.n || MOCK_N) : MOCK_N + ' سؤالًا، والنتيجة في النهاية');
  var wrong = mistakeList().length;
  body.appendChild(h('div', { class: 'list pr-list2' },
    App.row({ title: 'أخطائي', sub: wrong ? null : 'لا توجد أخطاء الآن.', meta: wrong ? String(wrong) : null, icon: 'cross', iconBg: 'var(--bad)', onClick: function () { App.go('mistakes'); } }),
    App.row({ title: 'اختبار تجريبي', sub: mockSub, icon: 'mock', iconBg: 'var(--tint)', onClick: function () { App.go('mock'); } })));
}
App.registerTab('practice', renderTab);

/* =====================================================================
   9. practice-task: the filtered round a Today unit opens
   App.go('practice-task', { topics: ['p2-figures', …], unit: '<plan unit id>' })
   ===================================================================== */
App.registerPage('practice-task', function (o) {
  o = o || {};
  var topics = arr(o.topics).length ? o.topics : (o.task ? arr(o.task.topics) : []);
  var lec = o.lec || (o.task && o.task.lec) || null;
  var pool = topics.length ? poolForTopics(topics) : [];
  if (!pool.length && lec) pool = poolForLecs([lec]);
  if (!pool.length && !topics.length) pool = bank().slice();
  var names = topics.map(topicAr).filter(Boolean);
  var title = o.title || (names.length === 1 ? names[0] : 'تدريب');
  var acc = lec || (topics.length ? topicLec(topics[0]) : null);
  if (acc && LECS.indexOf(acc) < 0) acc = null;
  var unit = unitIdOf(o);
  return sessionPage(title, acc, function (page) { runPractice(page, pool, unit); });
});

/* =====================================================================
   9b. quick-check: 3 questions at the end of a lesson («تأكدي»)
   App.go('quick-check', { lesson: '<lesson id>', unit: '<plan unit id>' | null, page: <lesson page handle> })
   With `page`, the check replaces the lesson inside that page; «الدرس التالي» replaces it again.
   ===================================================================== */
/* the English terms the lesson defines: the first item of each `def` block (also inside `more`);
   "Meter (Metre)" gives Meter and Metre */
function lessonTerms(L) {
  var out = [];
  (function walk(blocks) {
    arr(blocks).forEach(function (b) {
      if (!b || typeof b !== 'object') return;
      if (Array.isArray(b.def) && b.def[0]) {
        String(b.def[0]).replace(/<[^>]*>/g, ' ').split(/[()·\/]/).forEach(function (t) {
          t = t.replace(/\s+/g, ' ').trim();
          if (t.length > 1 && out.indexOf(t.toLowerCase()) < 0) out.push(t.toLowerCase());
        });
      }
      if (b.blocks) walk(b.blocks);
    });
  })(L && L.blocks);
  return out;
}
function termRe(terms) {
  if (!terms.length) return null;
  var parts = terms.slice().sort(function (a, b) { return b.length - a.length; })
    .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
  return new RegExp('\\b(?:' + parts.join('|') + ')\\b', 'i');
}
/* the stem, plus the right option of an mcq */
function qHay(q) { return String(q.x.q || '') + (q.type === 'mcq' ? ' \n ' + String(q.x.o[q.x.a] || '') : ''); }
/* 3 questions for a lesson, never the same one twice:
   1) same topic, stem or right option names a term the lesson defines;
   2) same lecture, other topic, same match;
   3) same topic, not naming a term another lesson of this topic defines;
   4) the rest of the topic. Inside each group: wrong first, then new, then right, then mastered. */
function quickList(L, n) {
  if (!L) return [];
  var re = termRe(lessonTerms(L)), sib = [];
  arr(D.lessons).forEach(function (o) { if (o && o.id !== L.id && o.topic === L.topic) sib = sib.concat(lessonTerms(o)); });
  var mine = re ? sib.filter(function (t) { return !re.test(t); }) : sib;
  var sibRe = termRe(mine);
  var hit = function (q) { return !!re && re.test(qHay(q)); };
  var all = bank(), groups = [
    all.filter(function (q) { return q.topic === L.topic && hit(q); }),
    all.filter(function (q) { return q.lec === L.lec && q.topic !== L.topic && hit(q); }),
    all.filter(function (q) { return q.topic === L.topic && !hit(q) && !(sibRe && sibRe.test(qHay(q))); }),
    all.filter(function (q) { return q.topic === L.topic; })
  ];
  /* spread the picks over the lesson's terms: first one question per term, then any */
  var out = [], seen = {}, used = {};
  var termOf = function (q) { var m = re && re.exec(qHay(q)); return m ? m[0].toLowerCase() : null; };
  groups.forEach(function (g) {
    var og = order(g);
    [true, false].forEach(function (strict) {
      og.forEach(function (q) {
        if (out.length >= n || seen[q.id]) return;
        var k = termOf(q);
        if (strict && k && used[k]) return;
        seen[q.id] = 1;
        if (k) used[k] = 1;
        out.push(q);
      });
    });
  });
  return out;
}
function runQuick(page, L, unit) {
  var list = quickList(L, QUICK);
  if (!list.length) { endQuick({ page: page, res: [] }, L, unit); return; }
  newRun(page, { mode: 'quick', list: list, end: function (s) { endQuick(s, L, unit); } });
}
function endQuick(s, L, unit) {
  var page = s.page, t = tally(s.res), wq = wrongQs(s.res);
  var nx = App.nextLesson ? App.nextLesson(L.id, unit) : null;
  var nodes = [];
  if (t.n) {
    nodes.push(h('section', { class: 'card pr-intro' },
      h('h2', { class: 'num' }, t.right + ' من ' + t.n + ' صح'),
      h('p', null, !t.wrong ? 'أحسنتِ، كلها صح.' : (wq.length === 1 ? 'هذا السؤال الذي أخطأتِ فيه، مع الشرح:' : 'هذه الأسئلة التي أخطأتِ فيها، مع الشرح:'))));
    wq.forEach(function (q) {
      nodes.push(h('section', { class: 'card pr-qc-wrong ' + App.acc(q.lec) },
        h('p', { class: 'pr-qline', dir: 'ltr', lang: 'en' }, q.x.q),
        pickRow('الصحيح', rightText(q), 'ok', q.type === 'mcq'),
        q.x.why ? h('p', { class: 'fb-why', rich: q.x.why }) : null));
    });
  } else {
    nodes.push(h('section', { class: 'card pr-intro' },
      h('h2', null, 'خلصتِ الدرس'),
      h('p', null, 'لا توجد أسئلة على هذا الدرس بعد.')));
  }
  var act;
  if (nx) {
    act = { label: 'الدرس التالي', fn: function () {
      if (active && active.page === page) active = null;
      App.openLesson(nx.id, { unit: unit, page: page });
    } };
  } else {
    act = { label: 'رجوع', fn: function () {
      if (active && active.page === page) active = null;
      page.close(); /* back to the lecture's lessons list (or Today when the lesson came from there) */
    } };
  }
  endScreen(page, nodes, [act]);
}
App.registerPage('quick-check', function (o) {
  o = o || {};
  var L = App.lesson(o.lesson || o.id);
  if (!L) return null;
  var unit = unitIdOf(o), acc = LECS.indexOf(L.lec) > -1 ? L.lec : null, title = 'تأكدي من فهمك';
  var pg = o.page;
  if (pg && pg.replace && App.topPage() === pg) {
    pg.replace(title, function () { runQuick(pg, L, unit); }, { acc: acc, large: false });
    return pg;
  }
  return sessionPage(title, acc, function (page) { runQuick(page, L, unit); });
});

/* =====================================================================
   10. Mock exam: 15 MCQ across L1-L3 (in proportion to the bank), result at the end
   ===================================================================== */
function mcqByLec() {
  var out = {};
  LECS.forEach(function (l) { out[l] = []; });
  bank().forEach(function (q) { if (q.type === 'mcq' && out[q.lec]) out[q.lec].push(q); });
  return out;
}
/* largest-remainder split of MOCK_N over the lectures */
function mockQuotas(by) {
  var total = 0;
  LECS.forEach(function (l) { total += by[l].length; });
  var n = Math.min(MOCK_N, total), q = {}, left = n;
  if (!total) return { q: q, n: 0 };
  var rem = LECS.map(function (l) {
    var raw = n * by[l].length / total;
    q[l] = Math.min(by[l].length, Math.floor(raw));
    left -= q[l];
    return { l: l, f: raw - Math.floor(raw) };
  }).sort(function (a, b) { return b.f - a.f; });
  for (var guard = 0; left > 0 && guard < 50; guard++) {
    rem.forEach(function (r) { if (left > 0 && q[r.l] < by[r.l].length) { q[r.l]++; left--; } });
  }
  return { q: q, n: n - left };
}
function mockIds() {
  var by = mcqByLec(), quota = mockQuotas(by).q, ids = [];
  LECS.forEach(function (l) {
    App.sample(by[l], quota[l] || 0).forEach(function (q) { ids.push(q.id); });
  });
  return App.shuffle(ids);
}
function validMockRun() {
  var r = prefs().mockRun;
  if (!r || !Array.isArray(r.ids) || !r.ids.length || !Array.isArray(r.res)) return null;
  if (!(r.i > 0 && r.i < r.ids.length) || r.res.length !== r.i) return null;
  if (Date.now() - (+r.at || 0) > 3 * 864e5) return null;
  if (!r.ids.every(function (id) { return !!getQ(id); })) return null;
  return r;
}
function saveMockRun(s) {
  prefs().mockRun = {
    at: Date.now(), ids: s.list.map(function (q) { return q.id; }), i: s.res.length,
    res: s.res.map(function (r) {
      return [r.ok ? 1 : 0, String(r.given == null ? '' : r.given), r.extra && r.extra.pickO != null ? r.extra.pickO : null];
    })
  };
  App.save();
}
function mockIntro(page, unit) {
  var run = validMockRun(), last = prefs().mockLast;
  var by = mcqByLec(), quota = mockQuotas(by);
  if (!quota.n) { emptyScreen(page); return; }
  var parts = h('div', { class: 'list' }, LECS.filter(function (l) { return quota.q[l]; }).map(function (l) {
    return App.row({ title: lecName(l), meta: String(quota.q[l]), icon: lecIcon(l), iconBg: lecBg(l) });
  }));
  var card = h('section', { class: 'card pr-intro' },
    h('h2', null, 'اختيار من متعدد: ' + quota.n + ' ' + n11(quota.n)),
    h('p', null, 'مثل الجزء الأول في الاختبار: سؤال واحد لكل درجة.'),
    h('p', null, 'تقدرين تغيّرين اختياركِ قبل «التالي». النتيجة والشرح في النهاية.'),
    parts,
    last && last.score != null ? h('p', null, 'آخر نتيجة: ' + last.score + ' من ' + (last.n || MOCK_N)) : null);
  endScreen(page, [card], run ? [
    { label: 'كمّلي من السؤال ' + (run.i + 1), fn: function () { startMock(page, run, unit); } },
    { label: 'ابدئي من جديد', kind: 'soft', fn: function () { startMock(page, null, unit); } }
  ] : [{ label: 'ابدئي', fn: function () { startMock(page, null, unit); } }]);
}
function startMock(page, run, unit) {
  var list, res = [], start = 0;
  if (run) {
    list = run.ids.map(getQ);
    res = run.res.map(function (r, i) {
      return { q: list[i], ok: !!r[0], given: r[1], extra: r[2] != null ? { pickO: r[2] } : null };
    });
    start = run.i;
  } else {
    list = mockIds().map(getQ).filter(Boolean);
    prefs().mockRun = null;
    App.save();
  }
  newRun(page, { mode: 'mock', list: list, start: start, res: res, onAnswer: saveMockRun, end: function (s) { endMock(s, unit); } });
}
function endMock(s, unit) {
  var per = LECS.map(function (l) {
    var rs = s.res.filter(function (r) { return r.q.lec === l; });
    return { l: l, right: rs.filter(function (r) { return r.ok; }).length, n: rs.length };
  }).filter(function (x) { return x.n; });
  var score = s.res.filter(function (r) { return r.ok; }).length;
  var P = prefs();
  P.mockRun = null;
  P.mockLast = { at: Date.now(), score: score, n: s.res.length };
  App.save();
  if (unit) markUnit(unit);
  showMockResult(s.page, s.res.slice(), score, per, unit);
}
function showMockResult(page, res, score, per, unit) {
  var wrongs = res.filter(function (r) { return !r.ok; });
  var rights = res.filter(function (r) { return r.ok; });
  var card = resultCard(score, res.length, scoreMsg(score, res.length), per.length > 1 ? per.map(function (x) { return [x.l, x.right + '/' + x.n]; }) : null);
  var nodes = [card];
  if (wrongs.length) {
    nodes.push(App.secHead('راجعي الغلط', String(wrongs.length)));
    nodes.push(h('div', { class: 'list pr-rev' }, wrongs.map(reviewRow)));
  }
  if (rights.length) {
    nodes.push(App.secHead('إجاباتكِ الصحيحة', String(rights.length)));
    nodes.push(h('div', { class: 'list pr-rev' }, rights.map(reviewRow)));
  }
  endScreen(page, nodes, [
    { label: 'تدرّبي على الفقرة', fn: function () { App.go('paragraph'); } },
    { label: 'اختبار جديد', kind: 'soft', fn: function () { startMock(page, null, unit); } }
  ]);
}
function reviewRow(r) {
  var q = r.q;
  return App.row({
    title: promptEl(q),
    end: h('span', { class: 'state ' + (r.ok ? 'st-right' : 'st-wrong') }, App.icon(r.ok ? 'tick' : 'cross'), r.ok ? 'صح' : 'غلط'),
    onClick: function () { openReview(r); }
  });
}
function openReview(r) {
  var q = r.q;
  App.sheet({
    title: 'مراجعة السؤال',
    acc: q.lec,
    body: function (box) {
      box.appendChild(h('div', { class: 'pr-sheet-fb ' + App.acc(q.lec) },
        h('p', { class: 'pr-qline', dir: 'ltr', lang: 'en' }, q.x.q),
        fbNode(q, r.ok, r.given, r.extra, true)));
    },
    actions: [{ label: 'تمام', kind: 'primary' }]
  });
}
App.registerPage('mock', function (o) {
  var unit = unitIdOf(o);
  return sessionPage('اختبار تجريبي', null, function (page) { mockIntro(page, unit); });
});

/* =====================================================================
   11. Mistakes review: every question whose last answer was wrong
   ===================================================================== */
function mistakeList() {
  return App.wrongIds().map(getQ).filter(Boolean).sort(function (a, b) {
    var la = LECS.indexOf(a.lec), lb = LECS.indexOf(b.lec);
    return (la < 0 ? 9 : la) - (lb < 0 ? 9 : lb) || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || (a.id < b.id ? -1 : 1);
  });
}
function mistakesHome(page) {
  var qs = mistakeList();
  if (!qs.length) {
    endScreen(page, [h('section', { class: 'card pr-intro' },
      h('h2', null, 'لا توجد أخطاء الآن'),
      h('p', null, 'كل سؤال تخطئين فيه يظهر هنا لتعيديه.'))],
      [{ label: 'رجوع', fn: function () { page.close(); } }]);
    return;
  }
  function startAt(i) {
    var order2 = qs.slice(i).concat(qs.slice(0, i));
    runRedo(page, order2, function () { mistakesHome(page); }, 'رجوع للقائمة');
  }
  var nodes = [h('section', { class: 'card pr-intro' },
    h('h2', null, qCount(qs.length)),
    h('p', null, qs.length === 1 ? 'أخطأتِ في هذا السؤال آخر مرة. جرّبي إجابته مرة ثانية.' : 'أخطأتِ في هذه الأسئلة آخر مرة. جرّبي إجابتها مرة ثانية.'))];
  var groups = LECS.map(function (l) { return { l: l, qs: qs.filter(function (q) { return q.lec === l; }) }; });
  var rest = qs.filter(function (q) { return LECS.indexOf(q.lec) < 0; });
  if (rest.length) groups.push({ l: null, qs: rest });
  groups.forEach(function (g) {
    if (!g.qs.length) return;
    nodes.push(h('h2', { class: 'sec-h' },
      g.l ? h('span', { style: 'display:inline-flex;align-items:center;gap:6px' }, App.tag(g.l), h('span', { richText: lecName(g.l) })) : h('span', null, 'أسئلة أخرى'),
      h('b', { class: 'num' }, String(g.qs.length))));
    nodes.push(h('div', { class: 'list pr-rev ' + (g.l ? App.acc(g.l) : '') }, g.qs.map(function (q) {
      return App.row({ title: promptEl(q), onClick: function () { startAt(qs.indexOf(q)); } });
    })));
  });
  var wrap = endScreen(page, nodes, []);
  wrap.insertBefore(h('div', { class: 'pr-actions' },
    h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { startAt(0); } }, 'ابدئي المراجعة')), wrap.children[1] || null);
  active = { page: page, onKey: function (e) { if (e.key === 'Enter') { startAt(0); return true; } return false; } };
}
App.registerPage('mistakes', function () {
  return sessionPage('أخطائي', null, function (page) { mistakesHome(page); });
});

/* small read-only hooks for testing and for other modules */
App.practice = { question: getQ, all: function () { return bank().slice(); }, quotas: function () { return mockQuotas(mcqByLec()); },
  quick: function (lessonId) { return quickList(App.lesson(lessonId), QUICK).map(function (q) { return q.id; }); } };
})();
