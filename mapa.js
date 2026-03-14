
async function geocode(ciudad){
let url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudad)}`
let r=await fetch(url)
let data=await r.json()
return {lat:data[0].lat,lon:data[0].lon}
}

async function calcularRuta(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let o=await geocode(origen)
let d=await geocode(destino)

let url=`https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`
let r=await fetch(url)
let data=await r.json()

let km=(data.routes[0].distance/1000).toFixed(0)
document.getElementById("km").value=km
window.routeCoords=data.routes[0].geometry.coordinates
}
