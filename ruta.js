
let map = L.map('map').setView([23,-102],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19
}).addTo(map);

let rutaLinea;
let rutaCoords=[];

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

rutaCoords=data.routes[0].geometry.coordinates

let coords=rutaCoords.map(c=>[c[1],c[0]])

if(rutaLinea){
map.removeLayer(rutaLinea)
}

rutaLinea=L.polyline(coords,{color:"red"}).addTo(map)

map.fitBounds(rutaLinea.getBounds())

let km=(data.routes[0].distance/1000).toFixed(0)
document.getElementById("km").value=km

detectarCasetas()

}

function distancia(a,b,c,d){
const R=6371
let dLat=(c-a)*Math.PI/180
let dLon=(d-b)*Math.PI/180
let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2
let y=2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
return R*y
}

function detectarCasetas(){

let usadas=[]
let total=0

for(let i=0;i<rutaCoords.length;i+=20){

let r=rutaCoords[i]

CASETAS.forEach(c=>{

let d=distancia(r[1],r[0],c.lat,c.lon)

if(d<5){

if(!usadas.find(u=>u.name===c.name)){
usadas.push(c)
total+=c.costo
}

}

})

}

window.casetasDetectadas=usadas
window.casetasCosto=total

}


// CAPUFE detection upgrade

function distancia(a,b,c,d){
const R=6371
let dLat=(c-a)*Math.PI/180
let dLon=(d-b)*Math.PI/180
let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2
let y=2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
return R*y
}

function detectarCasetasRuta(coords){

let usadas=[]
let total=0

for(let i=0;i<coords.length;i+=10){

let r=coords[i]

CAPUFE_CASETAS.forEach(c=>{

let d=distancia(r[1],r[0],c.lat,c.lon)

if(d<2){   // tighter detection radius

if(!usadas.find(u=>u.name===c.name)){
usadas.push(c)
total+=c.costo
}

}

})

}

window.casetasDetectadas=usadas
window.casetasCosto=total

}



let tollMarkers=[];

function limpiarMarkers(){
tollMarkers.forEach(m=>map.removeLayer(m))
tollMarkers=[]
}

function detectarCasetas(coords, ejes){

limpiarMarkers()

let usadas=[]
let total=0

for(let i=0;i<coords.length;i+=10){

let r=coords[i]

CAPUFE_CASETAS.forEach(c=>{

let d=distancia(r[1],r[0],c.lat,c.lon)

if(d<2){

if(!usadas.find(u=>u.name===c.name)){

let costo=c.costos[ejes]||c.costos["5"]

usadas.push({name:c.name,costo:costo})

total+=costo

let marker=L.marker([c.lat,c.lon]).addTo(map)
marker.bindPopup(c.name+" $"+costo)

tollMarkers.push(marker)

}

}

})

}

window.casetasDetectadas=usadas
window.casetasCosto=total

}
