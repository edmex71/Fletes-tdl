
let map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)

let routeLayer
let lat1,lon1,lat2,lon2
let precioBajo=0,precioMedio=0,precioAlto=0

function formato(n){return "$"+Math.round(n).toLocaleString("en-US")}
function redondear100(n){return Math.ceil(n/100)*100}

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

if(document.getElementById("tipoViaje").value==2) km=km*2

document.getElementById("km").value=km.toFixed(0)

if(routeLayer) map.removeLayer(routeLayer)
routeLayer=L.geoJSON(r.routes[0].geometry,{style:{color:"red",weight:5}}).addTo(map)
map.fitBounds(routeLayer.getBounds())
}

function calcular(){

let km=parseFloat(document.getElementById("km").value)

precioBajo=redondear100(km*22)
precioMedio=redondear100(km*32)
precioAlto=redondear100(km*38)

document.getElementById("resultado").innerHTML=
"Precio bajo: "+formato(precioBajo)+"<br>"+
"Precio medio: "+formato(precioMedio)+"<br>"+
"Precio alto: "+formato(precioAlto)
}

function obtenerPrecio(){
let t=document.getElementById("precioSeleccionado").value
if(t=="bajo") return precioBajo
if(t=="medio") return precioMedio
return precioAlto
}

function guardarHistorial(){
let precio=obtenerPrecio()
let registro=document.getElementById("origen").value+" → "+document.getElementById("destino").value+" "+formato(precio)
let hist=JSON.parse(localStorage.getItem("historial")||"[]")
hist.push(registro)
localStorage.setItem("historial",JSON.stringify(hist))
mostrarHistorial()
}

function mostrarHistorial(){
let hist=JSON.parse(localStorage.getItem("historial")||"[]")
document.getElementById("historial").innerHTML=hist.map(x=>"<div>"+x+"</div>").join("")
}
mostrarHistorial()

async function generarImagen(){

let precio=obtenerPrecio()

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=900
let ctx=canvas.getContext("2d")

ctx.fillStyle="#fff"
ctx.fillRect(0,0,900,900)

let logo=new Image()
logo.src="logo.jpg"
await new Promise(r=>logo.onload=r)

ctx.drawImage(logo,300,20,300,300)

ctx.fillStyle="#000"
ctx.font="28px Arial"

ctx.fillText("Origen: "+document.getElementById("origen").value,100,400)
ctx.fillText("Destino: "+document.getElementById("destino").value,100,440)
ctx.fillText("Km: "+document.getElementById("km").value,100,480)

ctx.font="50px Arial"
ctx.fillText(formato(precio),300,700)

let imgURL=canvas.toDataURL("image/jpeg")

let w=window.open()
w.document.write("<img src='"+imgURL+"' style='width:100%'>")
}

function reiniciar(){
location.reload()
}
