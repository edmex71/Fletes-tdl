
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('sw.js');
}

let map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)

let routeLayer
let precioAlto=0

function formato(n){return "$"+Math.round(n).toLocaleString("en-US")}
function redondear100(n){return Math.ceil(n/100)*100}

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

if(routeLayer) map.removeLayer(routeLayer)
routeLayer=L.geoJSON(r.routes[0].geometry).addTo(map)
map.fitBounds(routeLayer.getBounds())

}

function estimarCasetas(km,ejes){

let tarifa=3.6

let factor={2:1,3:1.5,4:1.8,5:2.2,6:2.6}

return km*tarifa*factor[ejes]

}

function calcular(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("rendimiento").value)
let ejes=parseInt(document.getElementById("ejes").value)

let litros=km/rendimiento
let costoDiesel=litros*diesel

let casetas=estimarCasetas(km,ejes)

let costoOperativo=costoDiesel+casetas

let bajo=km*22
let medio=km*32
let alto=km*38

precioAlto=redondear100(alto)

document.getElementById("resultado").innerHTML=`
<b>Costo operativo</b><br>
Diesel: ${formato(costoDiesel)}<br>
Casetas: ${formato(casetas)}<br>
Total: ${formato(costoOperativo)}<br><br>

<b>Precio bajo (22/km)</b>: ${formato(bajo)}<br>
<b>Precio medio (32/km)</b>: ${formato(medio)}<br>
<b>Precio alto (38/km)</b>: ${formato(precioAlto)}
`

guardarHistorial()

}

function enviarWhatsApp(){

let txt=`FLETE TDL
Cliente: ${document.getElementById("cliente").value}
Origen: ${document.getElementById("origen").value}
Destino: ${document.getElementById("destino").value}
Km: ${document.getElementById("km").value}
Precio: ${formato(precioAlto)}`

window.open("https://wa.me/?text="+encodeURIComponent(txt))

}

function generarImagen(){

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=900

let ctx=canvas.getContext("2d")

ctx.fillStyle="#fff"
ctx.fillRect(0,0,900,900)

let img=new Image()
img.src="logo.jpg"

img.onload=function(){

ctx.drawImage(img,300,40,300,300)

ctx.fillStyle="#000"
ctx.font="40px Arial"
ctx.fillText("FLETE TDL",300,380)

ctx.font="28px Arial"
ctx.fillText("Cliente: "+document.getElementById("cliente").value,120,460)
ctx.fillText("Origen: "+document.getElementById("origen").value,120,520)
ctx.fillText("Destino: "+document.getElementById("destino").value,120,580)
ctx.fillText("Km: "+document.getElementById("km").value,120,640)

ctx.font="48px Arial"
ctx.fillText(formato(precioAlto),300,760)

let link=document.createElement("a")
link.href=canvas.toDataURL("image/jpeg")
link.download="cotizacion.jpg"
link.click()

}

}

function guardarHistorial(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")

h.push({
cliente:document.getElementById("cliente").value,
ruta:document.getElementById("origen").value+" → "+document.getElementById("destino").value,
precio:precioAlto
})

localStorage.setItem("historial",JSON.stringify(h))

mostrarHistorial()

}

function mostrarHistorial(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")

document.getElementById("historial").innerHTML=h.map(x=>`${x.cliente} | ${x.ruta} | $${x.precio}`).join("<br>")

}

function reiniciar(){

document.getElementById("cliente").value=""
document.getElementById("origen").value=""
document.getElementById("destino").value=""
document.getElementById("km").value=""
document.getElementById("diesel").value=24
document.getElementById("rendimiento").value=2.8
document.getElementById("ejes").value=5

document.getElementById("resultado").innerHTML=""

if(routeLayer) map.removeLayer(routeLayer)
map.setView([23,-102],5)

}

mostrarHistorial()
