/* app-paragraph.js — page 'paragraph': the paragraph trainer (exam Part 2, 15 marks).
   Contract: docs/app-api.md (API = window.App, data = App.D). Copy: docs/copy-guide.md.
   Design: design/dir-2b.html (start screen; one topic page with 3 tabs on a sticky segmented control).
   Data read: D.paragraphs, D.poems (lines[].ar and lines[].words are optional), D.devices,
   D.paragraphGuide, D.plan (the 'paragraph' units). Progress: App.state.para[id] =
   {poem, model, rebuild: 0|1, best: right slots}; core cleans it on load/import. */
(function () {
'use strict';
var App = window.App;
if (!App) return;

var D = App.D || {};
var h = App.h;

var TABS = [{ id: 'poem', ar: 'القصيدة' }, { id: 'model', ar: 'النموذج' }, { id: 'rebuild', ar: 'أعيدي البناء' }];
var ROLE_AR = { open: 'بداية', point: 'نقطة', close: 'خاتمة' };
var DEVS = ['alliteration', 'consonance', 'simile', 'metaphor', 'personification', 'imagery'];
/* quotes that are only a joining word are not poem lines */
var STOP = { as: 1, like: 1, and: 1, the: 1 };

/* =====================================================================
   0. Styles (tokens only; device colours --dv-* live in index.html, light + dark)
   ===================================================================== */
var CSS = [
  '.pa-page{--pa-poem:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}',
  '.sheet{--pa-poem:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}',
  /* start screen */
  '.pa-lead{margin:8px 4px 6px;font-size:16px;line-height:1.6;color:var(--label2)}',
  '.pa-topic{display:block;width:100%;padding:16px 16px 14px;margin-top:12px;text-align:start;transition:transform .15s}',
  '.pa-topic:active{transform:scale(.985)}',
  '.pa-topic-h{display:flex;align-items:center;justify-content:space-between;gap:10px}',
  '.pa-topic-h h2{font-size:20px;font-weight:700;line-height:1.3}',
  '.pa-topic-h .chev{width:8px;height:14px;color:var(--label3);flex:none;transform:scaleX(-1)}',
  '.pa-topic-sub{margin-top:2px;font-size:14px;color:var(--label2)}',
  '.pa-steps{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:12px;font-size:14px;color:var(--label3)}',
  '.pa-steps i{font-style:normal;opacity:.6}',
  '.pa-steps .done{display:inline-flex;align-items:center;gap:3px;color:var(--ok);font-weight:600}',
  '.pa-steps .done svg{width:13px;height:13px;flex:none}',
  '.pa-steps .now{color:var(--acc-ink);font-weight:700}',
  '.pa-guide{margin-top:20px}',
  '.pa-tiny{margin:14px 4px 0;font-size:13px;color:var(--label3);line-height:1.5}',
  /* topic page: sticky segmented control under the top bar */
  '.pa-segbar{position:sticky;top:calc(44px + env(safe-area-inset-top));z-index:4;margin:0 -16px;padding:6px 16px 8px;background:var(--bar);' +
    '-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom:0.5px solid var(--bar-line)}',
  '.pa-segbar .seg button{min-height:44px;font-size:14px}',
  '.pa-panel{padding-top:16px}',
  /* poem tab */
  '.pa-ptitle{direction:ltr;text-align:left}',
  '.pa-ptitle b{display:block;font-family:var(--pa-poem);font-size:26px;font-weight:700;line-height:1.2}',
  '.pa-ptitle span{font-size:14px;color:var(--label2)}',
  '.pa-form{display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:100%;min-height:44px;margin:12px 0;text-align:start}',
  '.pa-fchip{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 11px;border-radius:16px;background:var(--fill);font-size:13px;color:var(--label)}',
  '.pa-fchip .t-en{color:var(--label2)}',
  '.pa-fchip svg{width:15px;height:15px;color:var(--tint)}',
  '.pa-form:active .pa-fchip{background:var(--fill2)}',
  '.pa-poem{padding:8px 6px;border-radius:18px;background:var(--card);box-shadow:var(--shadow)}',
  '.pa-line{display:flex;align-items:center;gap:8px;width:100%;direction:ltr;text-align:left;padding:4px 10px;border-radius:10px;min-height:44px}',
  '.pa-line:active{background:var(--fill)}',
  '.pa-lt{flex:1;min-width:0;font-family:var(--pa-poem);font-size:17px;line-height:1.6}',
  '.pa-rh{flex:none;width:16px;text-align:center;font-size:12px;font-weight:700;color:var(--label3)}',
  '.pa-sgap{height:10px}',
  /* device colours: a neutral default first, then one class per device */
  '.pa-hl,.pa-dpill,.pa-dot{--dc:var(--label3);--di:var(--label);--dw:var(--fill)}',
  '.pa-hl{background:var(--dw);color:var(--di);border-radius:5px;padding:0 2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
  /* a second device on the same words: a thin underline in its colour */
  '.pa-hl.two{box-shadow:inset 0 -2px 0 var(--dc2)}',
  DEVS.map(function (d) { return '.pa-d-' + d + '{--dc:var(--dv-' + d + ');--di:var(--dv-' + d + '-ink);--dw:var(--dv-' + d + '-wash)}'; }).join('\n'),
  '.pa-dot{display:inline-block;width:8px;height:8px;border-radius:4px;background:var(--dc);flex:none}',
  '.pa-leg{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin:12px 4px 0;font-size:13px;color:var(--label2)}',
  '.pa-leg span{display:inline-flex;align-items:center;gap:6px}',
  '.pa-leg .pa-leg-t{flex-direction:column;align-items:flex-start;gap:1px}',
  '.pa-leg .pa-leg-ar{color:var(--label);font-weight:600}',
  '.pa-hint{margin:12px 4px 0;font-size:13px;color:var(--label3);line-height:1.5}',
  /* line sheet */
  '.pa-sh-line{margin:6px 0;direction:ltr;text-align:left;font-family:var(--pa-poem);font-size:19px;line-height:1.55}',
  '.pa-sh-mean{font-size:16px;line-height:1.6;color:var(--label)}',
  '.pa-sh-lbl{margin:14px 0 6px;font-size:13px;font-weight:600;color:var(--label3)}',
  '.pa-words{list-style:none;margin:0;padding:2px 12px;border-radius:14px;background:var(--card)}',
  '.pa-words li{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:40px;font-size:15.5px}',
  '.pa-words li + li{border-top:0.5px solid var(--sep)}',
  '.pa-w-en{font-family:var(--pa-poem);font-size:17px;direction:ltr;unicode-bidi:isolate}',
  '.pa-w-ar{color:var(--label2)}',
  '.pa-dev{padding:10px 12px;border-radius:14px;background:var(--card);margin-top:8px}',
  '.pa-dev-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '.pa-dpill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:13px;background:var(--dw);color:var(--di);font-size:14px;font-weight:600}',
  '.pa-dev-ar{font-size:15px;font-weight:600}',
  '.pa-dev-en{margin-top:6px;direction:ltr;text-align:left;font-size:15px;line-height:1.45}',
  '.pa-dev-x{margin-top:3px;font-size:14.5px;line-height:1.55;color:var(--label2)}',
  /* model + rebuild: plain sentence blocks with a thin role bar on the right edge */
  '.pa-sec-t{font-size:22px;font-weight:700;line-height:1.3}',
  '.pa-roles{display:flex;align-items:center;gap:14px;margin:6px 0 12px;font-size:13px;color:var(--label2)}',
  '.pa-roles span{display:inline-flex;align-items:center;gap:6px}',
  '.pa-roles i{display:inline-block;width:3px;height:14px;border-radius:2px;background:var(--rc)}',
  '.pa-r-open{--rc:var(--l1)}', '.pa-r-point{--rc:var(--lp)}', '.pa-r-close{--rc:var(--l2)}',
  '.pa-blocks{display:flex;flex-direction:column;gap:6px}',
  '.pa-sb{position:relative;display:block;padding:6px 14px 6px 8px;direction:ltr;text-align:left;font-size:16px;line-height:1.65;color:var(--label);border-radius:10px}',
  '.pa-sb::after{content:"";position:absolute;right:0;top:8px;bottom:8px;width:3px;border-radius:2px;background:var(--rc)}',
  '.pa-sb.tap{cursor:pointer;-webkit-tap-highlight-color:transparent}',
  '.pa-sb.sel{background:var(--card)}',
  '.pa-sb:focus-visible{outline:2px solid var(--tint);outline-offset:2px}',
  '.pa-lchip{position:relative;display:inline-flex;align-items:center;height:24px;padding:0 9px;margin:0 3px;border-radius:12px;background:var(--fill);border:0.5px solid var(--sep);' +
    'font-family:var(--font);font-size:12.5px;font-weight:600;color:var(--acc-ink);vertical-align:1px;direction:rtl;unicode-bidi:isolate;line-height:1}',
  '.pa-lchip::after{content:"";position:absolute;left:-4px;right:-4px;top:-10px;bottom:-10px}',
  '.pa-lchip:active{background:var(--fill2)}',
  '.pa-mean{margin:0 14px 4px 0;padding:10px 12px;border-radius:12px;background:var(--fill);font-size:15.5px;line-height:1.6}',
  '.pa-mean small{display:block;font-size:12px;font-weight:600;color:var(--label3);margin-bottom:2px}',
  '.pa-link{display:inline-flex;align-items:center;min-height:44px;padding:0 4px;margin-top:4px;font-size:15px;font-weight:600;color:var(--tint)}',
  '.pa-link:active{opacity:.5}',
  '.pa-whole{margin-top:12px;direction:ltr;text-align:left;font-size:16px;line-height:1.75;color:var(--label)}',
  /* guide sheet */
  '.pa-gstep{position:relative;margin-top:10px;padding:2px 14px 2px 0}',
  '.pa-gstep::after{content:"";position:absolute;right:0;top:4px;bottom:4px;width:3px;border-radius:2px;background:var(--rc)}',
  '.pa-gstep b{display:block;font-size:13px;color:var(--label3)}',
  '.pa-gstep div{font-size:15.5px;line-height:1.55}',
  '.pa-gstep .t-en{display:block;margin-top:2px;font-size:13px;color:var(--label2);text-align:left}',
  '.pa-gnote{margin-top:16px}',
  /* rebuild */
  '.pa-res{display:flex;align-items:center;justify-content:space-between;gap:6px 10px;flex-wrap:wrap;padding:12px 14px;border-radius:16px;background:var(--ok-bg);margin-bottom:12px}',
  '.pa-res b{font-size:17px;color:var(--ok)}',
  '.pa-res span{font-size:14px;color:var(--label2)}',
  '.pa-res.low{background:var(--bad-bg)}',
  '.pa-res.low b{color:var(--bad)}',
  '.pa-blocks.rb .pa-sb{font-size:15.5px;line-height:2}',
  '.pa-slot{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:76px;min-height:36px;padding:0 10px;margin:0 2px;border-radius:8px;' +
    'background:var(--fill);border:1.5px dashed var(--fill2);font-size:15px;font-weight:600;line-height:1.2;vertical-align:middle;color:var(--label)}',
  '.pa-slot::after{content:"";position:absolute;left:0;right:0;top:-4px;bottom:-4px}',
  '.pa-slot.cur{border:1.5px solid var(--acc)}',
  '.pa-slot.full{border:1.5px solid transparent;background:var(--acc-wash);color:var(--acc-ink)}',
  '.pa-slot.ok{border:1.5px solid transparent;background:var(--ok-bg);color:var(--ok)}',
  '.pa-slot.no{border:1.5px solid transparent;background:var(--bad-bg);color:var(--bad)}',
  '.pa-slot s{opacity:.7;margin-right:6px;font-weight:500}',
  '.pa-why{margin:0 14px 4px 0;padding:10px 12px;border-radius:12px;background:var(--bad-bg);font-size:14.5px;line-height:1.6}',
  '.pa-why b{color:var(--bad)}',
  '.pa-why .pa-why-en{font-weight:600}',
  '.pa-tray{position:sticky;bottom:0;z-index:3;margin:18px -16px calc(-28px - env(safe-area-inset-bottom));padding:10px 16px calc(12px + env(safe-area-inset-bottom));' +
    'background:var(--bar);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-top:0.5px solid var(--bar-line)}',
  '.pa-tray-h{margin-bottom:8px;font-size:13px;color:var(--label3);text-align:center}',
  '.pa-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}',
  '.pa-chip{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:22px;background:var(--raised);border:0.5px solid var(--sep);' +
    'box-shadow:0 1px 2px rgba(0,0,0,.06);font-size:15px;font-weight:600;color:var(--label);direction:ltr;transition:opacity .15s}',
  '.pa-chip:active{transform:scale(.96)}',
  '.pa-chip[disabled]{opacity:.28}',
  '.pa-tray .btn{margin-top:10px}',
  '.pa-tray .btn[disabled]{opacity:.45;pointer-events:none}',
  '.pa-end{margin-top:18px}'
].join('\n');

function ensureCSS() {
  if (document.getElementById('css-paragraph')) return;
  var s = document.createElement('style');
  s.id = 'css-paragraph';
  s.textContent = CSS;
  (document.head || document.documentElement).appendChild(s);
}
App.onReady(ensureCSS);

/* =====================================================================
   1. Data helpers and progress
   ===================================================================== */
function paras() { return (D.paragraphs || []).filter(function (p) { return p && p.id && (p.sentences || []).length; }); }
function para(id) { return paras().filter(function (p) { return p.id === id; })[0] || null; }
function poemOf(p) { return (D.poems || []).filter(function (x) { return x && x.id === p.poem; })[0] || null; }
function unitFor(id) {
  return (D.plan || []).filter(function (u) { return u && (u.open || {}).type === 'paragraph' && u.open.id === id; })[0] || null;
}
function titleOf(p) { var u = unitFor(p.id); return (u && u.ar) || p.ar || ''; }
function kindOf(p) { return /theme/i.test(p.en || '') ? ['الفكرة الرئيسة', 'Theme'] : ['الشكل والأدوات', 'Style']; }
function bdi(t, cls) { return h('bdi', { class: cls || 't-en', dir: 'ltr' }, t); }
function devCls(dev) { return 'pa-d-' + String(dev || 'x').replace(/[^a-z]/gi, '').toLowerCase(); }

function prog(id) {
  var s = App.state;
  if (!s.para || typeof s.para !== 'object') s.para = {};
  var r = s.para[id];
  if (!r || typeof r !== 'object') r = s.para[id] = { poem: 0, model: 0, rebuild: 0, best: 0 };
  return r;
}
function markSeen(id, tab) {
  if (tab === 'rebuild') return;              /* rebuild counts only after a check */
  var r = prog(id);
  if (!r[tab]) { r[tab] = 1; App.save(); }
}
function firstTab(id) {
  var r = (App.state.para || {})[id] || {};
  for (var i = 0; i < TABS.length; i++) if (!r[TABS[i].id]) return TABS[i].id;
  return 'poem';
}

/* rhyme letters and stanza sizes from the form text ("... rhyme scheme of AAA BBB") */
function formInfo(poem) {
  var t = (poem.form || {}).en || '', n = (poem.lines || []).length;
  var sch = /rhyme scheme of ([A-Z]+(?: [A-Z]+)*)/.exec(t);
  var info = { letters: null, breaks: {}, chips: [] };
  var lines = function (k) { return App.plural(k, ['سطر واحد', 'سطران', 'أسطر', 'سطرًا']); };
  if (sch) {
    var groups = sch[1].split(' '), flat = groups.join('');
    if (flat.length === n) {
      info.letters = flat;
      var at = 0;
      groups.forEach(function (g, i) { at += g.length; if (i < groups.length - 1) info.breaks[at - 1] = 1; });
    }
    var each = groups[0].length, same = groups.every(function (g) { return g.length === each; });
    var called = /stanzas called (\w+)/i.exec(t);
    info.chips.push([App.plural(groups.length, ['مقطع واحد', 'مقطعان', 'مقاطع', 'مقطعًا']) + (same ? '، كل مقطع ' + lines(each) : ''), called ? called[1] : '']);
    info.chips.push(['القافية', sch[1]]);
  } else {
    if (/free verse/i.test(t)) info.chips.push(['بلا قافية منتظمة', 'free verse']);
    info.chips.push([lines(n), '']);
  }
  return info;
}

/* a poem line as nodes, device words coloured. Overlapping marks: each piece takes the colour
   of the shortest mark that covers it; a second mark on the same piece adds an underline. */
function lineNodes(t, marks) {
  var rs = [];
  (marks || []).forEach(function (m, k) {
    if (!m || !m.words) return;
    var w = String(m.words), i = t.indexOf(w);
    if (i < 0) i = t.toLowerCase().indexOf(w.toLowerCase());
    if (i > -1) rs.push({ a: i, b: i + w.length, dev: m.dev, k: k });
  });
  if (!rs.length) return [t];
  var cuts = [0, t.length];
  rs.forEach(function (r) { cuts.push(r.a, r.b); });
  cuts = cuts.sort(function (x, y) { return x - y; }).filter(function (x, i, a) { return !i || x !== a[i - 1]; });
  var out = [];
  for (var j = 0; j < cuts.length - 1; j++) {
    var a = cuts[j], b = cuts[j + 1];
    var cov = rs.filter(function (r) { return r.a <= a && r.b >= b; })
      .sort(function (x, y) { return (x.b - x.a) - (y.b - y.a) || x.k - y.k; });
    var seg = t.slice(a, b);
    if (!cov.length) { out.push(seg); continue; }
    var sp = h('span', { class: 'pa-hl ' + devCls(cov[0].dev) + (cov.length > 1 ? ' two' : '') }, seg);
    if (cov.length > 1) sp.style.setProperty('--dc2', 'var(--dv-' + devCls(cov[1].dev).slice(5) + ', var(--label3))');
    out.push(sp);
  }
  return out;
}

/* which poem line a quote comes from (-1: none, the title, or a joining word) */
function norm(s) {
  return ' ' + String(s || '').toLowerCase().replace(/[‘’]/g, '\'').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
}
function matchLine(q, poem) {
  var n = norm(q), bare = n.trim();
  if (bare.length < 3 || STOP[bare] || n === norm(poem.title)) return -1;
  var ls = poem.lines || [];
  for (var i = 0; i < ls.length; i++) if (norm(ls[i].t).indexOf(n) > -1) return i;
  return -1;
}
/* a sentence split into text and {line} chips: one chip after the last quote of a run from the same line */
function quoteParts(en, poem) {
  var re = /["“]([^"”]+)["”]/g, m, qs = [];
  while ((m = re.exec(en))) qs.push({ end: re.lastIndex, line: poem ? matchLine(m[1], poem) : -1 });
  var out = [], last = 0;
  qs.forEach(function (q, i) {
    if (q.line < 0) return;
    var nx = qs[i + 1];
    if (nx && nx.line === q.line) return;
    out.push(en.slice(last, q.end));
    out.push({ line: q.line });
    last = q.end;
  });
  out.push(en.slice(last));
  return out;
}

/* =====================================================================
   2. Sheets: a poem line, the whole paragraph, our guide
   ===================================================================== */
function openLine(poem, i) {
  var L = (poem.lines || [])[i];
  if (!L) return;
  App.sheet({
    acc: 'P', title: 'السطر ' + (i + 1),
    body: function (box) {
      box.appendChild(h('div', { class: 'pa-sh-line', dir: 'ltr' }, lineNodes(L.t, L.marks)));
      if (L.ar) box.appendChild(h('div', { class: 'pa-sh-mean', rich: L.ar }));
      var words = (L.words || []).filter(function (w) { return w && w.w; });
      if (words.length) {
        box.appendChild(h('div', { class: 'pa-sh-lbl' }, 'كلمات صعبة'));
        box.appendChild(h('ul', { class: 'pa-words' }, words.map(function (w) {
          return h('li', null, h('span', { class: 'pa-w-ar', rich: w.ar || '' }), h('bdi', { class: 'pa-w-en', dir: 'ltr' }, w.w));
        })));
      }
      var marks = (L.marks || []).filter(function (m) { return m && m.dev; });
      if (!marks.length) return;
      box.appendChild(h('div', { class: 'pa-sh-lbl' }, 'الأدوات في هذا السطر'));
      marks.forEach(function (m) {
        var d = (D.devices || {})[m.dev] || { en: m.dev };
        box.appendChild(h('div', { class: 'pa-dev' },
          h('div', { class: 'pa-dev-h' },
            h('span', { class: 'pa-dpill ' + devCls(m.dev) }, h('span', { class: 'pa-dot ' + devCls(m.dev) }), bdi(d.en || m.dev, 'en')),
            d.ar ? h('span', { class: 'pa-dev-ar', rich: d.ar }) : null),
          m.en ? h('div', { class: 'pa-dev-en', dir: 'ltr' }, m.en) : null,
          m.ar ? h('div', { class: 'pa-dev-x', rich: m.ar }) : null));
      });
    }
  });
}
function openWhole(p) {
  App.sheet({
    acc: 'P', title: 'الفقرة كاملة',
    body: function (box) {
      box.appendChild(h('div', { class: 'pa-whole', dir: 'ltr' }, p.sentences.map(function (s) { return s.en; }).join(' ')));
    }
  });
}
function openGuide() {
  var g = D.paragraphGuide;
  if (!g) return;
  App.sheet({
    acc: 'P', title: 'كيف أكتب الفقرة؟',
    body: function (box) {
      (g.steps || []).forEach(function (st) {
        box.appendChild(h('div', { class: 'pa-gstep pa-r-' + (ROLE_AR[st.role] ? st.role : 'point') },
          h('b', null, ROLE_AR[st.role] || ''),
          h('div', { rich: st.ar || '' }),
          st.en ? bdi(st.en) : null));
      });
      if (g.note_ar) box.appendChild(h('div', { class: 'note pa-gnote' }, App.icon('info'), h('div', { rich: g.note_ar })));
    }
  });
}

/* =====================================================================
   3. The start screen (no id)
   ===================================================================== */
function stepsLine(id) {
  var r = (App.state.para || {})[id] || {}, now = false, out = [];
  TABS.forEach(function (t, i) {
    if (i) out.push(h('i', { 'aria-hidden': 'true' }, '·'));
    if (r[t.id]) out.push(h('span', { class: 'done' }, App.icon('tick'), t.ar));
    else if (!now) { now = true; out.push(h('span', { class: 'now' }, t.ar)); }
    else out.push(h('span', null, t.ar));
  });
  return h('div', { class: 'pa-steps' }, out);
}
function buildStart(body) {
  var list = paras();
  body.appendChild(h('div', { class: 'lt' }, h('h1', null, 'فقرة الاختبار')));
  body.appendChild(h('p', { class: 'pa-lead' }, 'في الاختبار تأتيكِ 2 من هذه الـ3، وتكتبين فقرة واحدة.'));
  if (!list.length) { body.appendChild(App.placeholder('الفقرات قيد التجهيز.')); return; }
  list.forEach(function (p) {
    var k = kindOf(p);
    body.appendChild(h('button', { class: 'card pa-topic', type: 'button', onclick: function () { openTopic(p.id, null, 'الفقرات'); } },
      h('div', { class: 'pa-topic-h' }, h('h2', { richText: titleOf(p) }), App.icon('chev', 'chev')),
      h('div', { class: 'pa-topic-sub' }, k[0] + ' · ', bdi(k[1], 'en')),
      stepsLine(p.id)));
  });
  if (D.paragraphGuide) {
    body.appendChild(h('div', { class: 'list pa-guide' },
      App.row({ title: 'كيف أكتب الفقرة؟', sub: 'ترتيب نقترحه عليكِ', icon: 'doc', iconBg: 'var(--acc-btn)', onClick: openGuide })));
  }
  body.appendChild(h('p', { class: 'pa-tiny' }, 'الجزء الثاني من الاختبار: فقرة واحدة، 15 درجة.'));
}
function openStart() {
  return App.openPage('فقرة الاختبار', function (body) { buildStart(body); }, {
    large: true, acc: 'P', className: 'pa-page',
    onShow: function (page) { var top = page.el.scrollTop; page.body.textContent = ''; buildStart(page.body); page.el.scrollTop = top; }
  });
}

/* =====================================================================
   4. The topic page: القصيدة · النموذج · أعيدي البناء
   ===================================================================== */
function openTopic(id, unit, back) {
  var p = para(id);
  if (!p) return openStart();
  var poem = poemOf(p);
  var tab = firstTab(id), openIdx = -1, rb = null, pageRef = null, panel = null, segBtns = [];

  function keepScroll(fn) {
    var el = pageRef && pageRef.el, top = el ? el.scrollTop : 0;
    fn();
    if (el) el.scrollTop = top;
  }
  function show(t, toTop) {
    tab = t;
    segBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tab') === t ? 'true' : 'false'); });
    markSeen(id, t);
    panel.textContent = '';
    if (t === 'poem') renderPoem(panel);
    else if (t === 'model') renderModel(panel);
    else renderRebuild(panel);
    if (toTop && pageRef && pageRef.el) pageRef.el.scrollTop = 0;
  }

  /* ----- القصيدة ----- */
  function renderPoem(box) {
    if (!poem) { box.appendChild(App.placeholder('القصيدة قيد التجهيز.')); return; }
    var fi = formInfo(poem);
    box.appendChild(h('div', { class: 'pa-ptitle', dir: 'ltr' }, h('b', null, poem.title || ''), h('span', null, poem.poet || '')));
    var form = h('button', { class: 'pa-form', type: 'button', 'aria-haspopup': 'dialog', 'aria-label': 'شكل القصيدة' },
      fi.chips.map(function (c, ci) {
        return h('span', { class: 'pa-fchip' }, h('span', null, c[0]), c[1] ? bdi(c[1]) : null, ci === fi.chips.length - 1 ? App.icon('info') : null);
      }));
    form.addEventListener('click', function () {
      App.sheet({ acc: 'P', title: 'شكل القصيدة', body: function (b) {
        if (poem.form.en) b.appendChild(h('div', { class: 'pa-dev-en', dir: 'ltr' }, poem.form.en));
        if (poem.form.ar) b.appendChild(h('div', { class: 'pa-dev-x', style: 'margin-top:8px;font-size:15.5px', rich: poem.form.ar }));
      } });
    });
    if (poem.form) box.appendChild(form);
    var card = h('div', { class: 'pa-poem' });
    var used = {};
    (poem.lines || []).forEach(function (L, i) {
      (L.marks || []).forEach(function (m) { if (m && m.dev) used[m.dev] = 1; });
      card.appendChild(h('button', { class: 'pa-line', type: 'button', dir: 'ltr', 'aria-haspopup': 'dialog', onclick: function () { openLine(poem, i); } },
        h('span', { class: 'pa-lt' }, lineNodes(L.t || '', L.marks)),
        fi.letters ? h('span', { class: 'pa-rh', 'aria-hidden': 'true' }, fi.letters.charAt(i)) : null));
      if (fi.breaks[i]) card.appendChild(h('div', { class: 'pa-sgap', 'aria-hidden': 'true' }));
    });
    box.appendChild(card);
    var devs = Object.keys(used).sort(function (a, b) { return DEVS.indexOf(a) - DEVS.indexOf(b); });
    if (devs.length) {
      box.appendChild(h('div', { class: 'pa-leg', dir: 'ltr' }, devs.map(function (d) {
        var dv = (D.devices || {})[d] || {};
        return h('span', null, h('span', { class: 'pa-dot ' + devCls(d) }), h('span', { class: 'pa-leg-t' }, bdi(dv.en || d, 'en'), dv.ar ? h('span', { class: 'pa-leg-ar', dir: 'rtl' }, dv.ar) : null));
      })));
    }
  }

  /* ----- النموذج ----- */
  function roleLegend() {
    return h('div', { class: 'pa-roles' }, ['open', 'point', 'close'].map(function (r) {
      return h('span', { class: 'pa-r-' + r }, h('i', { 'aria-hidden': 'true' }), ROLE_AR[r]);
    }));
  }
  function roleCls(s) { return 'pa-r-' + (ROLE_AR[s.role] ? s.role : 'point'); }
  function renderModel(box) {
    box.appendChild(h('h2', { class: 'pa-sec-t' }, 'الفقرة النموذجية'));
    box.appendChild(roleLegend());
    var wrap = h('div', { class: 'pa-blocks' });
    p.sentences.forEach(function (s, i) {
      var sel = i === openIdx;
      var kids = quoteParts(s.en || '', poem).map(function (part) {
        if (typeof part === 'string') return part;
        var chip = h('button', { class: 'pa-lchip', type: 'button', 'aria-haspopup': 'dialog' }, 'السطر ' + (part.line + 1));
        chip.addEventListener('click', function (e) { e.stopPropagation(); openLine(poem, part.line); });
        chip.addEventListener('keydown', function (e) { e.stopPropagation(); });
        return chip;
      });
      var sb = h('div', { class: 'pa-sb tap ' + roleCls(s) + (sel ? ' sel' : ''), dir: 'ltr', role: 'button', tabindex: '0', 'aria-expanded': sel ? 'true' : 'false' }, kids);
      function toggle() { openIdx = sel ? -1 : i; keepScroll(function () { show('model'); }); }
      sb.addEventListener('click', toggle);
      sb.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      wrap.appendChild(sb);
      if (sel && s.ar) wrap.appendChild(h('div', { class: 'pa-mean' }, h('small', null, 'المعنى'), h('div', { rich: s.ar })));
    });
    box.appendChild(wrap);
    box.appendChild(h('button', { class: 'pa-link', type: 'button', 'aria-haspopup': 'dialog', onclick: function () { openWhole(p); } }, 'اقرئي الفقرة كاملة'));
    box.appendChild(h('p', { class: 'pa-hint' }, 'اضغطي على جملة لتري معناها.'));
  }

  /* ----- أعيدي البناء ----- */
  function newRound() {
    var items = [];
    p.sentences.forEach(function (s, i) {
      var at = s.gap && s.en ? s.en.indexOf(s.gap) : -1;
      if (at > -1) items.push({ i: i, gap: s.gap, at: at });
    });
    var idx = items.map(function (x, k) { return k; });
    var order = App.shuffle(idx);
    if (idx.length > 2 && order.join() === idx.join()) order = App.shuffle(idx);
    return { items: items, chips: order.map(function (k) { return items[k].gap; }), fill: items.map(function () { return -1; }), checked: false, right: 0 };
  }
  function slotOf(i) { for (var k = 0; k < rb.items.length; k++) if (rb.items[k].i === i) return k; return -1; }
  function isRight(k) { return rb.fill[k] > -1 && rb.chips[rb.fill[k]] === rb.items[k].gap; }
  function rerender() { keepScroll(function () { show('rebuild'); }); }
  function check() {
    rb.checked = true;
    rb.right = rb.items.filter(function (x, k) { return isRight(k); }).length;
    var r = prog(id);
    r.rebuild = 1;
    if (rb.right > (r.best || 0)) r.best = rb.right;
    App.save();
    /* the unit ticks only at 2/3 of the slots or more; a lower score still saves progress above */
    var u = unit || (unitFor(id) || {}).id;
    if (u && App.unitDone && rb.right * 3 >= rb.items.length * 2) App.unitDone(u);
    show('rebuild', true);
  }
  function renderRebuild(box) {
    if (!rb) rb = newRound();
    var n = rb.items.length;
    if (!n) { box.appendChild(App.placeholder('هذا التمرين قيد التجهيز.')); return; }
    var firstEmpty = rb.fill.indexOf(-1);
    if (rb.checked) {
      var all = rb.right === n;
      box.appendChild(h('div', { class: 'pa-res' + (all ? '' : ' low'), role: 'status' },
        h('b', null, rb.right + ' من ' + n + ' صحيحة'),
        h('span', null, all ? 'أحسنتِ! الفقرة كاملة.' : (rb.right * 3 >= n * 2 ? 'راجعي الكلمات الحمراء.' : 'راجعي الكلمات الحمراء ثم أعيدي المحاولة.'))));
    } else {
      box.appendChild(h('h2', { class: 'pa-sec-t' }, 'أكملي الفقرة'));
      box.appendChild(roleLegend());
    }
    var wrap = h('div', { class: 'pa-blocks rb' });
    p.sentences.forEach(function (s, i) {
      var k = slotOf(i), en = s.en || '';
      var sb = h('div', { class: 'pa-sb ' + roleCls(s), dir: 'ltr' });
      if (k < 0) { sb.appendChild(document.createTextNode(en)); wrap.appendChild(sb); return; }
      var it = rb.items[k], f = rb.fill[k], slot;
      if (rb.checked) {
        var ok = isRight(k);
        slot = h('span', { class: 'pa-slot ' + (ok ? 'ok' : 'no') },
          ok ? it.gap : [f > -1 ? h('s', null, rb.chips[f]) : null, it.gap]);
      } else {
        slot = h('button', {
          class: 'pa-slot' + (f > -1 ? ' full' : (k === firstEmpty ? ' cur' : '')), type: 'button',
          'aria-label': f > -1 ? rb.chips[f] + ' (اضغطي لإزالتها)' : 'فراغ ' + (k + 1)
        }, f > -1 ? rb.chips[f] : ' ');
        slot.addEventListener('click', function () { if (rb.fill[k] > -1) { rb.fill[k] = -1; rerender(); } });
      }
      sb.appendChild(document.createTextNode(en.slice(0, it.at)));
      sb.appendChild(slot);
      sb.appendChild(document.createTextNode(en.slice(it.at + it.gap.length)));
      wrap.appendChild(sb);
      if (rb.checked && !isRight(k)) {
        wrap.appendChild(h('div', { class: 'pa-why' },
          h('div', null, h('b', null, 'الصحيح: '), bdi(it.gap, 't-en pa-why-en')),
          s.ar ? h('div', { rich: s.ar }) : null));
      }
    });
    box.appendChild(wrap);
    if (rb.checked) {
      box.appendChild(h('div', { class: 'btn-row pa-end' },
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { rb = newRound(); show('rebuild', true); } }, 'أعيدي المحاولة'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { if (pageRef) pageRef.close(); } }, 'تم')));
      return;
    }
    var used = {};
    rb.fill.forEach(function (f) { if (f > -1) used[f] = 1; });
    var left = rb.fill.filter(function (f) { return f < 0; }).length;
    box.appendChild(h('div', { class: 'pa-tray' },
      h('div', { class: 'pa-tray-h' }, left ? 'اضغطي كلمة لتملأ أول فراغ.' : 'اضغطي كلمة في الفقرة لتزيليها.'),
      h('div', { class: 'pa-chips' }, rb.chips.map(function (c, ci) {
        var b = h('button', { class: 'pa-chip', type: 'button', dir: 'ltr', disabled: !!used[ci] }, c);
        b.addEventListener('click', function () {
          var e = rb.fill.indexOf(-1);
          if (e < 0 || used[ci]) return;
          rb.fill[e] = ci;
          rerender();
        });
        return b;
      })),
      h('button', { class: 'btn btn-primary', type: 'button', disabled: !!left, onclick: check }, 'تحقّقي')));
  }

  function build(body, page) {
    pageRef = page;
    segBtns = TABS.map(function (t) {
      return h('button', { type: 'button', 'data-tab': t.id, 'aria-pressed': 'false', onclick: function () { if (tab !== t.id) show(t.id, true); } }, t.ar);
    });
    body.appendChild(h('div', { class: 'pa-segbar' }, h('div', { class: 'seg', role: 'group', 'aria-label': 'أقسام الموضوع' }, segBtns)));
    panel = h('div', { class: 'pa-panel' });
    body.appendChild(panel);
    show(tab);
  }
  return App.openPage(titleOf(p), build, { acc: 'P', className: 'pa-page', back: back || null });
}

/* =====================================================================
   5. Registration
   ===================================================================== */
App.registerPage('paragraph', function (opts) {
  ensureCSS();
  opts = opts || {};
  if (opts.id && para(opts.id)) return openTopic(opts.id, opts.unit || null);
  return openStart();
});

})();
