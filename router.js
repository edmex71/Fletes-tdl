
let map
let routeLayer
let currentRoute=[]

function initMap(){
 map=L.map('map').setView([23,-102],5)
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)
}

async function calcularRuta(){

 try{

 setEstado("Calculando ruta...")

 const o=await geocode(document.getElementById("origen").value)
 const d=await geocode(document.getElementById("destino").value)

 const url=`https://router.project-osrm.org/route/v1/driving/${o[0]},${o[1]};${d[0]},${d[1]}?overview=full&geometries=geojson`

 const r=await fetch(url)
 const data=await r.json()

 const route=data.routes[0]

 const km=(route.distance/1000).toFixed(0)
 document.getElementById("km").value=km

 if(routeLayer) map.removeLayer(routeLayer)

 routeLayer=L.geoJSON(route.geometry).addTo(map)
 map.fitBounds(routeLayer.getBounds())

 currentRoute=route.geometry.coordinates

 setEstado("Ruta calculada")

 }catch(e){

 setEstado("Error "+e)

 }

}


function estimarCasetas(km){

 let factor=2.6;

 if(km<200) factor=2.2;
 else if(km<500) factor=2.5;
 else if(km<900) factor=2.8;
 else if(km<1400) factor=3.1;
 else factor=3.4;

 return km*factor;

}

function obtenerCostoAdicional(){
 let el=document.getElementById('costoAdicional');
 return el?parseFloat(el.value||0):0;
}
