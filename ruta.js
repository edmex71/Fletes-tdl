
let map = L.map('map').setView([23,-102],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

let rutaCoords=[]
let rutaLinea

async function geocode(ciudad){
let url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudad)}`
let r=await fetch(url)
let d=await r.json()
return {lat:d[0].lat,lon:d[0].lon}
}

async function calcularRuta(){

let o=await geocode(document.getElementById("origen").value)
let d=await geocode(document.getElementById("destino").value)

let url=`https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`
let r=await fetch(url)
let data=await r.json()

rutaCoords=data.routes[0].geometry.coordinates

let coords=rutaCoords.map(c=>[c[1],c[0]])

if(rutaLinea) map.removeLayer(rutaLinea)

rutaLinea=L.polyline(coords,{color:"red"}).addTo(map)

map.fitBounds(rutaLinea.getBounds())

document.getElementById("km").value=(data.routes[0].distance/1000).toFixed(0)

detectarCasetas()
}
