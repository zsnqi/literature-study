/* sw.js — service worker for the Arabic literature study app (GitHub Pages project page).
 *
 * All URLs are resolved against this file's own location, so the app works under
 * https://user.github.io/repo/ (never absolute "/..." paths).
 *
 * One cache:
 *   lit-shell-<VERSION>  app shell. Precached atomically on install, served
 *                        stale-while-revalidate, DELETED when VERSION changes.
 *   (Cache names are per-origin and github.io is shared by all of a user's project pages,
 *    including the phonetics app, hence the "lit-" prefix; we only ever delete our own prefix.)
 *
 * RELEASE RULE: whenever any shell file changes, bump VERSION. The new worker installs
 * next to the old one, waits, and the page shows an "update available" banner; the page
 * then posts {type:'skip-waiting'} and reloads.
 * While a new worker is waiting, the old worker stops background revalidation so old and new
 * files are never mixed in the old cache.
 *
 * Message protocol:
 *   page -> worker  {type:'skip-waiting'}       activate a waiting worker now.
 *   worker -> page  {type:'sw-updated', version} (broadcast to all window clients) a new version
 *                                                just activated over an older one; reload to use it.
 */
'use strict';

const VERSION = 'v2';                       // bump on every shell change

const SHELL_PREFIX = 'lit-shell-';
const SHELL_CACHE = SHELL_PREFIX + VERSION;

const abs = (p) => new URL(p, self.location.href).href;
const INDEX_URL = abs('./index.html');

// Must be cached or the install fails (the worker then retries later; the old one keeps running).
const SHELL_REQUIRED = [
  './', './index.html', './data.js', './data-questions.js', './data-poems.js',
  './app-core.js', './app-practice.js', './app-more.js', './app-paragraph.js',
  './manifest.webmanifest',
].map(abs);
// Best effort: a failure is logged but does not block the install.
const SHELL_OPTIONAL = [
  './icons/apple-touch-icon.png', './icons/icon-192.png',
  './icons/icon-512.png', './icons/icon-512-maskable.png',
].map(abs);
const SHELL_SET = new Set([...SHELL_REQUIRED, ...SHELL_OPTIONAL]);

/* ---------------------------------------------------------------- install */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const problems = [];
    await Promise.all([...SHELL_REQUIRED, ...SHELL_OPTIONAL].map(async (url) => {
      try {
        // 'reload' bypasses the HTTP cache so a version bump always captures fresh files.
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await cache.put(url, res);
      } catch (err) {
        if (SHELL_REQUIRED.includes(url)) problems.push(url + ' (' + err.message + ')');
        else console.warn('[sw] optional precache failed:', url, err);
      }
    }));
    if (problems.length) {
      await caches.delete(SHELL_CACHE);
      throw new Error('[sw] precache failed: ' + problems.join(', '));
    }
    // No skipWaiting() here: the page decides when to switch (message 'skip-waiting').
  })());
});

/* --------------------------------------------------------------- activate */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const stale = names.filter((n) => n.startsWith(SHELL_PREFIX) && n !== SHELL_CACHE);
    await Promise.all(stale.map((n) => caches.delete(n)));
    await self.clients.claim();
    // Tell open pages only when this activation replaced an older version (not on first install).
    if (stale.length) {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      wins.forEach((c) => c.postMessage({ type: 'sw-updated', version: VERSION }));
    }
  })());
});

/* ---------------------------------------------------------------- messages */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'skip-waiting') self.skipWaiting();
});

/* ------------------------------------------------------------------- fetch */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  url.hash = '';
  url.search = '';                                     // ignore ?query for shell files
  if (SHELL_SET.has(url.href)) event.respondWith(shellStaleWhileRevalidate(event, url.href));
});

// Shell: answer from cache at once, refresh in the background (HTTP revalidation, not the HTTP cache).
async function shellStaleWhileRevalidate(event, key) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(key);
  const refresh = () => fetch(key, { cache: 'no-cache' }).then((res) => {
    if (res.ok) event.waitUntil(cache.put(key, res.clone()));
    return res;
  });
  if (cached) {
    // A newer worker is waiting: keep this cache frozen so versions are not mixed.
    if (!self.registration.waiting && !self.registration.installing) {
      event.waitUntil(refresh().catch(() => {}));
    }
    return cached;
  }
  try {
    return await refresh();
  } catch (err) {
    if (event.request.mode === 'navigate') {
      const index = await cache.match(INDEX_URL);
      if (index) return index;
    }
    return Response.error();
  }
}
