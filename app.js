
let map=L.map('map').setView([23,-102],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);

let routeLayer
let precioFinal=0

function formato(n){
return "$"+Math.round(n).toLocaleString("en-US")
}

function redondear100(n){
return Math.ceil(n/100)*100
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

let km_alto=km*38

precioFinal=redondear100(km_alto)

document.getElementById("resultado").innerHTML=`
Km: ${km}<br>
Diesel: ${formato(costoDiesel)}<br>
Casetas: ${formato(casetas)}<br><br>

Tarifa 22/km: ${formato(km*22)}<br>
Tarifa 32/km: ${formato(km*32)}<br>
<b>Tarifa 38/km: ${formato(km_alto)}</b><br><br>

<b>Precio cotización (redondeado): ${formato(precioFinal)}</b>
`

}

function enviarWhatsApp(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value
let km=document.getElementById("km").value

let texto=`FLETE TDL

Origen: ${origen}
Destino: ${destino}
Km: ${km}

Precio: ${formato(precioFinal)}`

let url="https://wa.me/?text="+encodeURIComponent(texto)

window.open(url,"_blank")

}

function generarImagen(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value
let km=document.getElementById("km").value

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=900

let ctx=canvas.getContext("2d")

let img=new Image()
img.src="logo.jpg"

img.onload=function(){

ctx.fillStyle="#fff"
ctx.fillRect(0,0,900,900)

ctx.drawImage(img,300,40,300,300)

ctx.fillStyle="#000"
ctx.font="32px Arial"

ctx.fillText("FLETE TDL",360,380)
ctx.fillText("Origen: "+origen,120,470)
ctx.fillText("Destino: "+destino,120,520)
ctx.fillText("Km: "+km,120,570)

ctx.font="46px Arial"
ctx.fillText("PRECIO",340,660)
ctx.fillText(formato(precioFinal),330,740)

let data=canvas.toDataURL("image/jpeg")

let link=document.createElement("a")
link.href=data
link.download="cotizacion.jpg"
link.click()

}

}

function reiniciar(){

document.getElementById("origen").value=""
document.getElementById("destino").value=""
document.getElementById("km").value=""
document.getElementById("diesel").value=24
document.getElementById("rendimiento").value=2.8
document.getElementById("ejes").value=5

document.getElementById("resultado").innerHTML=""

precioFinal=0

if(routeLayer){
map.removeLayer(routeLayer)
}

map.setView([23,-102],5)

}
