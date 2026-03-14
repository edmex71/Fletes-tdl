

let map
let routeLayer
let routeCoords=[]

function initMap(){

if(map){return}

map=L.map('map').setView([19.4326,-99.1332],6)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map)

}

async function calcularRuta(){

initMap()

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

if(!origen || !destino){
alert("Escribe origen y destino")
return
}

let o=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(origen))
let odata=await o.json()

let d=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(destino))
let ddata=await d.json()

if(!odata.length || !ddata.length){
alert("No se pudo encontrar ubicación")
return
}

let oLat=odata[0].lat
let oLon=odata[0].lon

let dLat=ddata[0].lat
let dLon=ddata[0].lon

let route=await fetch(
"https://router.project-osrm.org/route/v1/driving/"+oLon+","+oLat+";"+dLon+","+dLat+"?overview=full&geometries=geojson"
)

let rdata=await route.json()

if(!rdata.routes || !rdata.routes.length){
alert("No se pudo calcular ruta")
return
}

routeCoords=rdata.routes[0].geometry.coordinates

let km=rdata.routes[0].distance/1000
document.getElementById("km").value=km.toFixed(0)

if(routeLayer){
map.removeLayer(routeLayer)
}

routeLayer=L.geoJSON(rdata.routes[0].geometry).addTo(map)

map.fitBounds(routeLayer.getBounds())

if(typeof buscarCasetasAutopista==="function"){
buscarCasetasAutopista(routeCoords)
}

}

function distancia(a,b,c,d){
const R=6371
let dLat=(c-a)*Math.PI/180
let dLon=(d-b)*Math.PI/180
let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2
let y=2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
return R*y
}
