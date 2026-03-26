
let map=L.map('map').setView([23,-102],5)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

let rutaLayer

async function geo(q){
let r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`)
let j=await r.json()
return [j[0].lon,j[0].lat]
}

async function ruta(){

let o=document.getElementById("origen").value
let d=document.getElementById("destino").value

let c1=await geo(o)
let c2=await geo(d)

let r=await fetch(`https://router.project-osrm.org/route/v1/driving/${c1[0]},${c1[1]};${c2[0]},${c2[1]}?overview=full&geometries=geojson`)
let data=await r.json()

let km=data.routes[0].distance/1000
document.getElementById("km").value=Math.round(km)

if(rutaLayer)map.removeLayer(rutaLayer)
rutaLayer=L.geoJSON(data.routes[0].geometry).addTo(map)
map.fitBounds(rutaLayer.getBounds())

detectar(data.routes[0].geometry.coordinates)
}

async function detectar(coords){

let casetas=await fetch("casetas_nacional.json").then(r=>r.json())

let usadas=new Map()

casetas.forEach(c=>{

coords.forEach(p=>{

let d=dist(p[1],p[0],c.lat,c.lon)

if(d<8){

usadas.set(c.name,c.cost_5)

}

})

})

let lista=document.getElementById("lista")
lista.innerHTML=""

let total=0

usadas.forEach((precio,nombre)=>{

let li=document.createElement("li")
li.innerText=nombre+" $"+precio

lista.appendChild(li)

total+=precio

})

document.getElementById("totalCasetas").innerText=total

}

function dist(a,b,c,d){

let R=6371

let dLat=(c-a)*Math.PI/180
let dLon=(d-b)*Math.PI/180

let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2

return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))

}
