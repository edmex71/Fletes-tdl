

let map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)

let casetasDB=null

fetch("casetas.json").then(r=>r.json()).then(data=>casetasDB=data)

function formato(n){return "$"+Math.round(n).toLocaleString("en-US")}

function setEjes(){
document.getElementById("ejes").value=document.getElementById("camion").value
}

async function calcularRuta(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let g1=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+origen)
let d1=await g1.json()

let g2=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+destino)
let d2=await g2.json()

let lat1=d1[0].lat
let lon1=d1[0].lon
let lat2=d2[0].lat
let lon2=d2[0].lon

let route=await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`)
let r=await route.json()

let km=r.routes[0].distance/1000
document.getElementById("km").value=km.toFixed(0)

let routeLayer=L.geoJSON(r.routes[0].geometry,{style:{color:"red",weight:5}}).addTo(map)
map.fitBounds(routeLayer.getBounds())

}

function calcularCasetas(ejes){

let total=0

for(let autopista in casetasDB){

casetasDB[autopista].forEach(c=>{
total+=c[ejes]
})

}

return total

}

function calcular(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("rendimiento").value)
let ejes=document.getElementById("ejes").value

let litros=km/rendimiento
let dieselCosto=litros*diesel

let casetas=calcularCasetas(ejes)

let costoOperativo=dieselCosto+casetas

let bajo=km*22
let medio=km*32
let alto=km*38

document.getElementById("resultado").innerHTML=`
Diesel: ${formato(dieselCosto)}<br>
Casetas: ${formato(casetas)}<br>
Costo operativo: ${formato(costoOperativo)}<br><br>

Precio bajo: ${formato(bajo)}<br>
Precio medio: ${formato(medio)}<br>
Precio alto: ${formato(alto)}
`

}
