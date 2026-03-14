
let map
let routeLayer
let routeCoords=[]
let tollMarkers=[]
let dataset=[]

async function cargarDataset(){
 const r=await fetch("dataset_capufe.json")
 dataset=await r.json()
}

cargarDataset()

function initMap(){
 if(map) return
 map=L.map('map').setView([23,-102],5)
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map)
}

async function calcularRuta(){

 initMap()

 let origen=document.getElementById("origen").value
 let destino=document.getElementById("destino").value

 let o=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(origen))
 let od=await o.json()

 let d=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(destino))
 let dd=await d.json()

 let oLat=od[0].lat
 let oLon=od[0].lon
 let dLat=dd[0].lat
 let dLon=dd[0].lon

 let route=await fetch("https://router.project-osrm.org/route/v1/driving/"+oLon+","+oLat+";"+dLon+","+dLat+"?overview=full&geometries=geojson")
 let r=await route.json()

 routeCoords=r.routes[0].geometry.coordinates

 let km=r.routes[0].distance/1000
 document.getElementById("km").value=km.toFixed(0)

 if(routeLayer) map.removeLayer(routeLayer)
 routeLayer=L.geoJSON(r.routes[0].geometry).addTo(map)
 map.fitBounds(routeLayer.getBounds())

 detectarCasetas()
}

function distancia(a,b,c,d){
 let dx=a-c
 let dy=b-d
 return Math.sqrt(dx*dx+dy*dy)*111
}

function detectarCasetas(){

 document.getElementById("precios").innerHTML="<span class='loader'></span> Analizando casetas..."

 tollMarkers.forEach(m=>map.removeLayer(m))
 tollMarkers=[]

 let usadas=[]
 let total=0

 dataset.forEach(c=>{

   let min=999

   routeCoords.forEach(p=>{
     let d=distancia(c.lon,c.lat,p[0],p[1])
     if(d<min) min=d
   })

   if(min<3){

     let tarifa=window.obtenerTarifa?window.obtenerTarifa(c.name):0

     usadas.push({name:c.name,costo:tarifa})

     let m=L.marker([c.lat,c.lon]).addTo(map)
     m.bindPopup(c.name+" $"+tarifa)
     tollMarkers.push(m)

     total+=tarifa

   }

 })

 window.casetasDetectadas=usadas
 window.casetasCosto=total

 document.getElementById("precios").innerHTML="Casetas detectadas: "+usadas.length
}
