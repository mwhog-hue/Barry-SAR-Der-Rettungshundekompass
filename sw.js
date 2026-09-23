/* BARRY Service Worker – macht die App offline startfähig.
   Daten liegen NICHT im Cache, sondern im lokalen Speicher des Browsers (localStorage).
   Bei jeder neuen BARRY-Version CACHE_VERSION erhöhen, damit Geräte die neue Datei laden. */
const CACHE_VERSION = 'barry-1.7.1';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(DATEIEN)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Netzwerk zuerst (damit Updates ankommen), bei fehlender Verbindung aus dem Cache.
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET' || new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(
    fetch(e.request).then(antwort=>{
      const kopie = antwort.clone();
      caches.open(CACHE_VERSION).then(c=>c.put(e.request, kopie));
      return antwort;
    }).catch(()=>caches.match(e.request).then(r=>r || caches.match('./index.html')))
  );
});
