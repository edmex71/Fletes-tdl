

let map
let routeLayer
let routeCoords=[]
let tollMarkers=[]

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

detectarCasetas(routeCoords)

}

function distancia(a,b,c,d){
const R=6371
let dLat=(c-a)*Math.PI/180
let dLon=(d-b)*Math.PI/180
let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2
let y=2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
return R*y
}

function limpiarCasetas(){
tollMarkers.forEach(m=>map.removeLayer(m))
tollMarkers=[]
}

function detectarCasetas(coords){

limpiarCasetas()

let usadas=[]
let total=0

coords.forEach((p,i)=>{

if(i%10!==0)return

let lon=p[0]
let lat=p[1]

CAPUFE_CASETAS.forEach(c=>{

let d=distancia(lat,lon,c.lat,c.lon)

if(d<10){

if(!usadas.find(u=>u.name===c.name)){

let costo=(c.costos && c.costos["5"]) ? c.costos["5"] : (c.costo||300)

usadas.push({name:c.name,costo:costo})
total+=costo

let marker=L.marker([c.lat,c.lon]).addTo(map)
marker.bindPopup(c.name+" $"+costo)
tollMarkers.push(marker)

}

}

})

})

window.casetasDetectadas=usadas
window.casetasCosto=total

}
