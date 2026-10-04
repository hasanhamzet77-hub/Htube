// HTube: aplicația merge și fără internet; feed-ul se ia mereu proaspăt când există conexiune
const CACHE = "htube-v5";
const FILES = ["./", "./index.html", "./data.js", "./threads.js", "./feed.json", "./channels.json", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== "GET") return;
  const key = new Request(u.origin + u.pathname);
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(key, c)); return r; })
    .catch(() => caches.match(key)));
});
