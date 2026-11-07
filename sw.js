// Service worker : permet d'utiliser le test hors ligne.
// Les fichiers sont servis depuis le cache puis mis à jour en arrière-plan : une modification sur GitHub apparaît à la visite suivante.
// Si besoin de forcer une mise à jour complète, changez le numéro de CACHE ci-dessous (v1 -> v2).
const CACHE = 'qcm-noai-v1';
const FILES = ['./', 'index.html', 'questions.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'qr-code.png', 'og-image.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r && r.status === 200 && new URL(e.request.url).origin === location.origin) {
        const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
      }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
