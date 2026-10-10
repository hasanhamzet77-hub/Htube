// HTube: aplicația merge și fără internet; feed-ul se ia mereu proaspăt când există conexiune
const CACHE = "imperium-v14";
const FILES = ["./", "./index.html", "./data.js", "./threads.js", "./body.js", "./sport.js", "./music.js", "./feed.json", "./channels.json", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./brand/intro.jpg", "./brand/emblem.png", "./brand/emblem-96.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // cititorul de PDF (pdf.js) se păstrează după prima descărcare, ca raftul să meargă și fără internet
  if (u.hostname === "cdn.jsdelivr.net" && (u.pathname.includes("/pdfjs-dist@") || u.pathname.includes("/three@") || u.pathname.includes("/tesseract.js") || u.pathname.includes("/@tesseract.js-data/"))) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })));
    return;
  }
  if (u.origin !== location.origin) return;
  // corpul 3D (câțiva MB) se descarcă o singură dată pe versiune
  if (u.pathname.includes("/body/")) {
    e.respondWith(caches.match(u.origin + u.pathname).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(u.origin + u.pathname, c)); return r; })));
    return;
  }
  const key = new Request(u.origin + u.pathname);
  // ocolim cache-ul browserului (GitHub ține fișierele 10 minute), ca modificările să apară imediat
  e.respondWith(fetch(e.request, { cache: "no-store" }).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(key, c)); return r; })
    .catch(() => caches.match(key)));
});

// notificarea de seară pentru jurnal
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Jurnalul de seară", {
    body: d.body || "Trei lucruri bune de azi și o lecție. Două minute.",
    icon: "icon-192.png", badge: "icon-192.png", tag: "jurnal", renotify: true, data: { url: d.url || "./?open=jurnal" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./?open=jurnal";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ("focus" in c) { c.postMessage({ open: "jurnal" }); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
