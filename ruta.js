

let map
let routeLayer
let routeCoords=[]
let tollMarkers=[]

function initMap(){
if(map){return}
map=L.map('map').setView([19.4326,-99.1332],6)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map)
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

if(routeLayer){ map.removeLayer(routeLayer) }

routeLayer=L.geoJSON(rdata.routes[0].geometry).addTo(map)
map.fitBounds(routeLayer.getBounds())

detectarCasetas(routeCoords)

}

function distancia(lat1,lon1,lat2,lon2){
const R=6371
let dLat=(lat2-lat1)*Math.PI/180
let dLon=(lon2-lon1)*Math.PI/180
let a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
return R*c
}

function limpiarCasetas(){
tollMarkers.forEach(m=>map.removeLayer(m))
tollMarkers=[]
}

function detectarCasetas(coords){

limpiarCasetas()

let usadas=[]
let total=0

// radio reducido para evitar casetas lejanas
const RADIO=1.8

coords.forEach((p,i)=>{

// revisar cada ~1 km aprox
if(i%5!==0) return

let lon=p[0]
let lat=p[1]

CAPUFE_CASETAS.forEach(c=>{

let d=distancia(lat,lon,c.lat,c.lon)

if(d<RADIO){

if(!usadas.find(u=>u.name===c.name)){

let costo=0

// soporte varios ejes
if(c.costos){
costo=c.costos["5"] || c.costos["4"] || c.costos["2"] || 0
}else{
costo=c.costo || 0
}

usadas.push({
name:c.name,
costo:costo,
lat:c.lat,
lon:c.lon,
dist:i
})

}

}

})

})

// ordenar por posición en la ruta
usadas.sort((a,b)=>a.dist-b.dist)

// calcular total y dibujar
usadas.forEach(c=>{

total+=c.costo

let marker=L.marker([c.lat,c.lon]).addTo(map)
marker.bindPopup(c.name+" $"+c.costo)
tollMarkers.push(marker)

})

window.casetasDetectadas=usadas
window.casetasCosto=total

}

