
let map = L.map('map').setView([23,-102],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 18
}).addTo(map);

let routeLayer

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

function calcular(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("rendimiento").value)
let ejes=parseInt(document.getElementById("ejes").value)

let litros=km/rendimiento
let costoDiesel=litros*diesel

let peajeBase=km*0.9
let factorEjes={2:0.6,3:0.8,4:1,5:1.3,6:1.6}

let casetas=peajeBase*factorEjes[ejes]

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
Diesel: $${costoDiesel.toFixed(0)}<br>
Casetas estimadas: $${casetas.toFixed(0)}<br><br>

<b>Precio bajo: $${bajo.toFixed(0)}</b><br>
Precio medio: $${medio.toFixed(0)}<br>
Precio alto: $${alto.toFixed(0)}<br><br>

<b>--- TARIFA POR KM ---</b><br>
Bajo (22/km): $${km_bajo.toFixed(0)}<br>
Medio (32/km): $${km_medio.toFixed(0)}<br>
<b>Alto (38/km): $${km_alto.toFixed(0)}</b>
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
ctx.fillText("$"+Math.round(precio),360,740)

let data=canvas.toDataURL("image/jpeg")

let link=document.createElement("a")
link.href=data
link.download="cotizacion.jpg"
link.click()

}

}
