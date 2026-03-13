
let map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)

let routeLayer
let lat1,lon1,lat2,lon2
let casetasDB=null

fetch("casetas.json").then(r=>r.json()).then(data=>casetasDB=data)

let precioBajo=0
let precioMedio=0
let precioAlto=0

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

lat1=d1[0].lat
lon1=d1[0].lon
lat2=d2[0].lat
lon2=d2[0].lon

let route=await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`)
let r=await route.json()

let km=r.routes[0].distance/1000
document.getElementById("km").value=km.toFixed(0)

if(routeLayer) map.removeLayer(routeLayer)

routeLayer=L.geoJSON(r.routes[0].geometry,{style:{color:"red",weight:5}}).addTo(map)

map.fitBounds(routeLayer.getBounds())
}

function calcularCasetas(ejes){
let total=0
for(let autopista in casetasDB){
casetasDB[autopista].forEach(c=>{
if(c[ejes]) total+=c[ejes]
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

precioBajo=km*22
precioMedio=km*32
precioAlto=km*38

document.getElementById("resultado").innerHTML=`
Diesel: ${formato(dieselCosto)}<br>
Casetas: ${formato(casetas)}<br>
Costo operativo: ${formato(costoOperativo)}<br><br>

Precio bajo: ${formato(precioBajo)}<br>
Precio medio: ${formato(precioMedio)}<br>
Precio alto: ${formato(precioAlto)}
`
}

function obtenerPrecio(){

let tipo=document.getElementById("precioSeleccionado").value

if(tipo=="bajo") return precioBajo
if(tipo=="medio") return precioMedio
return precioAlto
}

function enviarWhatsApp(){

let precio=obtenerPrecio()

let txt=`Cotizacion Transportes D’ Leon
Cliente: ${document.getElementById("cliente").value}
Origen: ${document.getElementById("origen").value}
Destino: ${document.getElementById("destino").value}
Km: ${document.getElementById("km").value}
Precio: ${formato(precio)}`

window.open("https://wa.me/?text="+encodeURIComponent(txt))
}

async function generarImagen(){

if(!lat1 || !lat2){
alert("Primero calcula la ruta")
return
}

let precio=obtenerPrecio()

let staticMap=`https://staticmap.openstreetmap.de/staticmap.php?size=700x300&markers=${lat1},${lon1},blue1|${lat2},${lon2},red1`

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=1100

let ctx=canvas.getContext("2d")

ctx.fillStyle="#ffffff"
ctx.fillRect(0,0,900,1100)

let logo=new Image()
logo.src="logo.jpg"

await new Promise(resolve=>{logo.onload=resolve})

ctx.drawImage(logo,300,20,300,300)

ctx.fillStyle="#000"
ctx.font="36px Arial"
ctx.fillText("Transportes D’ Leon",250,360)

ctx.font="26px Arial"
ctx.fillText("Cliente: "+document.getElementById("cliente").value,100,420)
ctx.fillText("Origen: "+document.getElementById("origen").value,100,460)
ctx.fillText("Destino: "+document.getElementById("destino").value,100,500)
ctx.fillText("Km: "+document.getElementById("km").value,100,540)

let mapImg=new Image()
mapImg.crossOrigin="anonymous"
mapImg.src=staticMap

await new Promise(resolve=>{mapImg.onload=resolve})

ctx.drawImage(mapImg,100,580,700,300)

ctx.font="48px Arial"
ctx.fillText(formato(precio),300,950)

let link=document.createElement("a")
link.href=canvas.toDataURL("image/jpeg")
link.download="cotizacion.jpg"
link.click()

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
