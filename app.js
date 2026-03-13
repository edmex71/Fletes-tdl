
let map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)

let routeLayer
let precioBajo=0
let precioMedio=0
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
let dieselCosto=litros*diesel
let casetas=estimarCasetas(km,ejes)

let costoOperativo=dieselCosto+casetas

precioBajo=km*22
precioMedio=km*32
precioAlto=redondear100(km*38)

document.getElementById("resultado").innerHTML=`
<b>Costo operativo</b><br>
Diesel: ${formato(dieselCosto)}<br>
Casetas: ${formato(casetas)}<br>
Total: ${formato(costoOperativo)}<br><br>

<b>Precio bajo</b>: ${formato(precioBajo)}<br>
<b>Precio medio</b>: ${formato(precioMedio)}<br>
<b>Precio alto</b>: ${formato(precioAlto)}
`

guardarHistorial()

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

let precio=obtenerPrecio()

let mapCanvas = await html2canvas(document.getElementById("map"))

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=1200

let ctx=canvas.getContext("2d")

ctx.fillStyle="#fff"
ctx.fillRect(0,0,900,1200)

let logo=new Image()
logo.src="logo.jpg"

logo.onload=function(){

ctx.drawImage(logo,300,20,300,300)

ctx.fillStyle="#000"
ctx.font="36px Arial"
ctx.fillText("Transportes D’ Leon",250,360)

ctx.font="26px Arial"
ctx.fillText("Cliente: "+document.getElementById("cliente").value,100,430)
ctx.fillText("Origen: "+document.getElementById("origen").value,100,480)
ctx.fillText("Destino: "+document.getElementById("destino").value,100,530)
ctx.fillText("Km: "+document.getElementById("km").value,100,580)

ctx.drawImage(mapCanvas,100,620,700,300)

ctx.font="48px Arial"
ctx.fillText(formato(precio),300,1000)

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
