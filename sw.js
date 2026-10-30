// Service worker de Flete TDL: primero la red (siempre la versión más nueva) y, sin internet, la última copia guardada.
const V="tdl-v1"
const ARCHIVOS=["./","index.html","style.css","fondo.jpg","logo.png","casetas_data.js","geocoder.js","router.js","tariffs.js","toll_detector.js","mapa_imagen.js","xlsx_min.js","docx_min.js","app.js","manifest.json"]
self.addEventListener("install",e=>{
 self.skipWaiting()
 e.waitUntil(caches.open(V).then(c=>Promise.all(ARCHIVOS.map(f=>c.add(f).catch(()=>{})))))
})
self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))
})
self.addEventListener("fetch",e=>{
 const r=e.request
 if(r.method!=="GET"||new URL(r.url).origin!==location.origin) return // mapas, rutas y búsquedas van directo a internet
 e.respondWith(
  fetch(r,{cache:"no-cache"}).then(res=>{
   if(res&&res.ok&&res.status===200){const copia=res.clone();caches.open(V).then(c=>c.put(r,copia)).catch(()=>{})}
   return res
  }).catch(()=>caches.match(r).then(m=>m||caches.match("index.html")))
 )
})
