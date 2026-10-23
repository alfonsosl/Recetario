/* Service worker de Mediterráneo 5.
 * - Navegación: network-first con fallback a la última versión en caché (funciona sin conexión).
 * - Recursos estáticos del propio dominio (JS/CSS con hash, iconos): cache-first.
 * - Fotos de Unsplash: stale-while-revalidate en una caché limitada.
 * - Nunca intercepta Supabase ni peticiones que no sean GET.
 */
const VERSION = 'med5-v2';
const SHELL = `${VERSION}-shell`;
const IMAGES = `${VERSION}-img`;
const MAX_IMAGES = 120;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(['/', '/manifest.json', '/icons/icon-192.png'])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(SHELL).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (url.hostname === 'images.unsplash.com') {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok || res.type === 'opaque') {
              cache.put(request, res.clone());
              trim(IMAGES, MAX_IMAGES);
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
