
let map
let rutaLayer

function initMap(){
 map=L.map('map').setView([23,-102],5)
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map)
}

function calcularRuta(){

 setEstado("Calculando ruta...")

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value

 const url=`https://router.project-osrm.org/route/v1/driving/${encodeURIComponent(origen)};${encodeURIComponent(destino)}?overview=full&geometries=geojson`

 fetch(url)
 .then(r=>r.json())
 .then(data=>{

 const route=data.routes[0]
 const km=(route.distance/1000).toFixed(0)

 document.getElementById("km").value=km

 if(rutaLayer) map.removeLayer(rutaLayer)

 rutaLayer=L.geoJSON(route.geometry).addTo(map)

 map.fitBounds(rutaLayer.getBounds())

 window.currentRoute=route.geometry.coordinates

 setEstado("Ruta calculada")

 })
}
