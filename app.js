
let map = L.map('map').setView([23,-102],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 18
}).addTo(map);

let routeLayer

function formato(n){
return "$" + Math.round(n).toLocaleString("en-US");
}

async function calcularRuta(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let geo1=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+origen)
let data1=await geo1.json()

let geo2=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+destino)
let data2=await geo2.json()

let lat1=data1[0].lat
let lon1=data1[0].lon

let lat2=data2[0].lat
let lon2=data2[0].lon

let route=await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`)
let r=await route.json()

let km=r.routes[0].distance/1000

document.getElementById("km").value=km.toFixed(0)

if(routeLayer){
map.removeLayer(routeLayer)
}

routeLayer=L.geoJSON(r.routes[0].geometry).addTo(map)
map.fitBounds(routeLayer.getBounds())

}

async function obtenerCasetasReales(km,ejes){

try{

// TollGuru placeholder (user can add API key)
let apiKey = ""
if(apiKey===""){
throw "sin_api"
}

// Example request (not active without key)
let res = await fetch("https://dev.tollguru.com/v1/calc/route",{
method:"POST",
headers:{
"x-api-key":apiKey,
"Content-Type":"application/json"
},
body:JSON.stringify({})
})

let data=await res.json()

return data.route.costs.tag

}catch{

// fallback estimation closer to CAPUFE
let tarifaKm = 2.9
let factor={2:1,3:1.4,4:1.7,5:2.0,6:2.3}

return km * tarifaKm * factor[ejes]

}

}

async function calcular(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("rendimiento").value)
let ejes=parseInt(document.getElementById("ejes").value)

let litros=km/rendimiento
let costoDiesel=litros*diesel

let casetas = await obtenerCasetasReales(km,ejes)

let base=costoDiesel+casetas

let bajo=base*1.2
let medio=base*1.35
let alto=base*1.5

let km_bajo=km*22
let km_medio=km*32
let km_alto=km*38

document.getElementById("resultado").innerHTML=`
<b>--- COSTO OPERATIVO ---</b><br>
Km: ${km}<br>
Diesel: ${formato(costoDiesel)}<br>
Casetas: ${formato(casetas)}<br><br>

<b>Precio bajo: ${formato(bajo)}</b><br>
Precio medio: ${formato(medio)}<br>
Precio alto: ${formato(alto)}<br><br>

<b>--- TARIFA POR KM ---</b><br>
Bajo (22/km): ${formato(km_bajo)}<br>
Medio (32/km): ${formato(km_medio)}<br>
<b>Alto (38/km): ${formato(km_alto)}</b>
`

window.precioAlto=km_alto

}

function generarImagen(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value
let km=document.getElementById("km").value
let precio=window.precioAlto||0

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=900

let ctx=canvas.getContext("2d")

let img=new Image()
img.src="logo.jpg"

img.onload=function(){

ctx.fillStyle="#ffffff"
ctx.fillRect(0,0,900,900)

ctx.drawImage(img,300,40,300,300)

ctx.fillStyle="#000"
ctx.font="32px Arial"

ctx.fillText("FLETE TDL",360,380)
ctx.fillText("Origen: "+origen,120,470)
ctx.fillText("Destino: "+destino,120,520)
ctx.fillText("Km: "+km,120,570)

ctx.font="46px Arial"
ctx.fillText("PRECIO ALTO",290,660)
ctx.fillText(formato(precio),340,740)

let data=canvas.toDataURL("image/jpeg")

let link=document.createElement("a")
link.href=data
link.download="cotizacion.jpg"
link.click()

}

}
