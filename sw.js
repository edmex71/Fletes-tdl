self.addEventListener("install",e=>{
e.waitUntil(
caches.open("tdl-cache").then(cache=>{
return cache.addAll(["./","index.html","style.css","app.js","icon.png"])
})
)
})
