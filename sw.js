/* Wishverse public asset service worker.
 * Only public static pages/assets are cached. URL fragments are never sent to SW.
 * Legacy ?wish= links are explicitly excluded from storage.
 * Uploaded photos, audio blobs, downloadable cards and local drafts are NOT cached.
 */
const VERSION = 'wishverse-public-v9';
const CACHE = `${VERSION}-cache`;
const SHELL = [
  '/', '/offline.html', '/site.webmanifest', '/favicon.svg',
  '/src/styles.css', '/src/main.js',
  '/src/data/themes.js', '/src/data/templates.js', '/src/data/i18n.js',
  '/src/lib/share.js', '/src/lib/download.js', '/src/lib/drafts.js',
  '/src/lib/soundscapes.js', '/src/lib/memory.js',
  '/src/lib/share-studio.js', '/src/lib/qr-vendor.js',
  '/assets/art/birthday.svg', '/assets/art/anniversary.svg', '/assets/art/diwali.svg',
  '/assets/art/rakhi.svg', '/assets/art/newyear.svg', '/assets/art/christmas.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('wishverse-public-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !/^https?:$/.test(new URL(req.url).protocol)) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.searchParams.has('wish')) return;
  // Navigations are network-first to keep public guides current. Only the pathname is cached.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const key = new Request(url.origin + url.pathname);
      try {
        const response = await fetch(req);
        if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) {
          const cache = await caches.open(CACHE);
          await cache.put(key, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(key)) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }
  if (/^\/(src|assets)\//.test(url.pathname) || ['/favicon.svg', '/site.webmanifest', '/og-preview.png'].includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(url.pathname);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) await cache.put(url.pathname, res.clone());
      return res;
    })());
  }
});
