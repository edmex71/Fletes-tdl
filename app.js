
let map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)

let routeLayer
let precioFinal=0

function formato(n){
return "$"+Math.round(n).toLocaleString("en-US")
}

function redondear100(n){
return Math.ceil(n/100)*100
}

function toggleDark(){
document.body.classList.toggle("dark")
}

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
let tarifaKm=2.9
let factor={2:1,3:1.4,4:1.7,5:2.0,6:2.3}
return km*tarifaKm*factor[ejes]
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

let bajo=costoOperativo*1.2
let medio=costoOperativo*1.35
let alto=costoOperativo*1.5

let km38=km*38

precioFinal=redondear100(km38)

document.getElementById("resultado").innerHTML=`
<b>Costo operativo</b><br>
Diesel: ${formato(costoDiesel)}<br>
Casetas: ${formato(casetas)}<br>
Total: ${formato(costoOperativo)}<br><br>

<b>Precio por costos</b><br>
Bajo: ${formato(bajo)}<br>
Medio: ${formato(medio)}<br>
Alto: ${formato(alto)}<br><br>

<b>Tarifa 38/km</b>: ${formato(km38)}<br>
<b>Precio cotización</b>: ${formato(precioFinal)}
`

guardarHistorial()

}

function enviarWhatsApp(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value
let km=document.getElementById("km").value

let texto=`FLETE TDL
Cliente: ${document.getElementById("cliente").value}
Origen: ${origen}
Destino: ${destino}
Km: ${km}
Precio: ${formato(precioFinal)}`

window.open("https://wa.me/?text="+encodeURIComponent(texto))

}

function generarImagen(){

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=900

let ctx=canvas.getContext("2d")

ctx.fillStyle="#fff"
ctx.fillRect(0,0,900,900)

ctx.fillStyle="#000"
ctx.font="40px Arial"
ctx.fillText("FLETE TDL",300,120)

ctx.font="28px Arial"
ctx.fillText("Cliente: "+document.getElementById("cliente").value,120,260)
ctx.fillText("Origen: "+document.getElementById("origen").value,120,320)
ctx.fillText("Destino: "+document.getElementById("destino").value,120,380)
ctx.fillText("Km: "+document.getElementById("km").value,120,440)

ctx.font="48px Arial"
ctx.fillText(formato(precioFinal),300,600)

let data=canvas.toDataURL("image/jpeg")
let link=document.createElement("a")
link.href=data
link.download="cotizacion.jpg"
link.click()

}

function guardarCliente(){

let c=document.getElementById("cliente").value
if(!c) return

let lista=JSON.parse(localStorage.getItem("clientes")||"[]")
if(!lista.includes(c)){
lista.push(c)
localStorage.setItem("clientes",JSON.stringify(lista))
}

}

function guardarHistorial(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")

h.push({
cliente:document.getElementById("cliente").value,
origen:document.getElementById("origen").value,
destino:document.getElementById("destino").value,
precio:precioFinal
})

localStorage.setItem("historial",JSON.stringify(h))

mostrarHistorial()
}

function mostrarHistorial(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")

document.getElementById("historial").innerHTML=h.map(x=>
`${x.cliente} | ${x.origen} → ${x.destino} | ${formato(x.precio)}`
).join("<br>")

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

precioFinal=0

if(routeLayer) map.removeLayer(routeLayer)
map.setView([23,-102],5)

}
