/* app-note.js — one-time note banner (a private message from the user to the student).
   How it works: reads ./message.json (not cached by the service worker). If its `id` has not been
   shown on this device yet, a banner slides in from the top once, then its id is stored in
   localStorage 'lit-note-seen' so it never shows again. To send a new note: change the file
   (new `id`, new text) and publish. Text is always set with textContent (never as HTML).
   message.json shape: { "id": "...", "title": "أحبك", "lines": ["...", "..."] }
   An empty file, a missing file, or an id already seen: nothing happens. */
(function () {
'use strict';
var App = window.App;
if (!App) return;

var SEEN_KEY = 'lit-note-seen';
var POLL_MS = 25000;       /* while the app is open and visible */
var SHOW_MS = 16000;       /* the banner leaves by itself after this long */
var doc = document;
var showing = false, timer = 0, busy = false;

var CSS = [
  '.lnote{position:absolute;z-index:70;inset-inline:12px;top:calc(env(safe-area-inset-top) + 8px);',
  'display:flex;gap:12px;align-items:flex-start;padding:14px 14px 14px 12px;border-radius:20px;',
  'background:var(--raised);color:var(--label);border:0.5px solid var(--sep);',
  'box-shadow:0 18px 40px -16px rgba(0,0,0,.35);',
  'transform:translateY(-130%);opacity:0;transition:transform .5s cubic-bezier(.32,.72,0,1),opacity .3s;',
  'cursor:pointer;-webkit-tap-highlight-color:transparent}',
  '.lnote.on{transform:none;opacity:1}',
  '.lnote-ic{flex:none;width:40px;height:40px;border-radius:20px;display:grid;place-items:center;',
  'background:var(--l3-wash);color:var(--l3)}',
  '.lnote-ic svg{width:22px;height:22px;transform-origin:50% 55%}',
  '.lnote.on .lnote-ic svg{animation:note-beat 1.5s ease-in-out .5s 3}',
  '@keyframes note-beat{0%,100%{transform:scale(1)}18%{transform:scale(1.22)}34%{transform:scale(1)}50%{transform:scale(1.15)}66%{transform:scale(1)}}',
  '.lnote-b{min-width:0;flex:1}',
  '.lnote-t{font-size:20px;font-weight:700;line-height:1.3;color:var(--l3-ink)}',
  '.lnote-l{margin-top:4px;font-size:16px;line-height:1.75;color:var(--label)}',
  '.lnote-l div+div{margin-top:0}',
  '.lnote-x{flex:none;margin:-6px -6px 0 -4px;width:36px;height:36px;border-radius:18px;display:grid;place-items:center;color:var(--label3)}',
  '.lnote-x svg{width:12px;height:12px}',
  '.lnote-x:active{background:var(--fill)}'
].join('');

function injectCSS() {
  var s = doc.createElement('style');
  s.textContent = CSS;
  doc.head.appendChild(s);
}

function seenGet() {
  try { return localStorage.getItem(SEEN_KEY) || ''; } catch (e) { return ''; }
}
function seenAdd(id) {
  try {
    var all = seenGet().split('|').filter(Boolean);
    if (all.indexOf(id) < 0) all.push(id);
    localStorage.setItem(SEEN_KEY, all.slice(-20).join('|'));
  } catch (e) { /* memory only: shown again on the next open, acceptable */ }
}
function wasSeen(id) { return seenGet().split('|').indexOf(id) >= 0; }

var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  var el = doc.createElementNS(NS, tag);
  Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}
function heartIcon() {
  var s = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
  s.appendChild(svgEl('path', { fill: 'currentColor', d: 'M12 20.6C5.2 15.4 3 12.2 3 8.9 3 6.2 5.1 4.2 7.6 4.2c1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 2.5 0 4.6 2 4.6 4.7 0 3.3-2.2 6.5-9 11.7z' }));
  return s;
}
function closeIcon() {
  var s = svgEl('svg', { viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'aria-hidden': 'true' });
  s.appendChild(svgEl('path', { d: 'M2 2l10 10M12 2L2 12' }));
  return s;
}

function hide(el) {
  clearTimeout(timer);
  el.classList.remove('on');
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); showing = false; }, 600);
}

function show(msg) {
  var host = doc.getElementById('app');
  if (!host || showing) return;
  showing = true;
  seenAdd(msg.id);

  var el = doc.createElement('div');
  el.className = 'lnote';
  el.setAttribute('role', 'status');

  var ic = doc.createElement('div');
  ic.className = 'lnote-ic';
  ic.appendChild(heartIcon());

  var b = doc.createElement('div');
  b.className = 'lnote-b';
  if (msg.title) {
    var t = doc.createElement('div');
    t.className = 'lnote-t';
    t.textContent = msg.title;
    b.appendChild(t);
  }
  if (msg.lines.length) {
    var l = doc.createElement('div');
    l.className = 'lnote-l';
    msg.lines.forEach(function (line) {
      var d = doc.createElement('div');
      d.textContent = line;
      l.appendChild(d);
    });
    b.appendChild(l);
  }

  var x = doc.createElement('button');
  x.type = 'button';
  x.className = 'lnote-x';
  x.setAttribute('aria-label', 'إغلاق');
  x.appendChild(closeIcon());

  el.appendChild(ic); el.appendChild(b); el.appendChild(x);
  el.addEventListener('click', function () { hide(el); });
  host.appendChild(el);
  /* two frames so the slide-in transition runs */
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on'); }); });
  timer = setTimeout(function () { hide(el); }, SHOW_MS);
}

function clean(raw) {
  if (!raw || typeof raw !== 'object') return null;
  var id = typeof raw.id === 'string' ? raw.id.trim() : '';
  if (!id || id.length > 60) return null;
  var title = typeof raw.title === 'string' ? raw.title.trim().slice(0, 80) : '';
  var lines = Array.isArray(raw.lines) ? raw.lines.filter(function (s) { return typeof s === 'string' && s.trim(); }).map(function (s) { return s.trim().slice(0, 200); }).slice(0, 8) : [];
  if (!title && !lines.length) return null;
  return { id: id, title: title, lines: lines };
}

function check() {
  if (busy || showing || doc.hidden) return;
  if (typeof fetch !== 'function') return;
  busy = true;
  fetch('./message.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (raw) {
      var msg = clean(raw);
      if (msg && !wasSeen(msg.id)) show(msg);
    })
    .catch(function () { /* offline or no file: stay silent */ })
    .then(function () { busy = false; });
}

injectCSS();
App.onReady(function () {
  setTimeout(check, 1500);
  setInterval(check, POLL_MS);
  doc.addEventListener('visibilitychange', function () { if (!doc.hidden) check(); });
});
})();
