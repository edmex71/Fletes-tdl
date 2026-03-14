
let map
let routeLayer
let routeCoords=[]
let tollMarkers=[]
let buscando=false

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

 buscarCasetas()

}

function limpiarCasetas(){
 tollMarkers.forEach(m=>map.removeLayer(m))
 tollMarkers=[]
}

function setBuscando(on){

 let el=document.getElementById("precios")

 if(on){
   el.innerHTML="<span class='loader'></span> Buscando casetas en internet..."
 }else{
   el.innerHTML=""
 }

}

async function buscarCasetas(){

 limpiarCasetas()
 setBuscando(true)

 let casetas={}
 let total=0

 for(let i=0;i<routeCoords.length;i+=40){

   let p=routeCoords[i]
   let lat=p[1]
   let lon=p[0]

   let query=`
   [out:json];
   node["barrier"="toll_booth"](around:4000,${lat},${lon});
   out;
   `

   let url="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(query)

   try{

     let res=await fetch(url)
     let data=await res.json()

     data.elements.forEach(n=>{

       let nombre=n.tags?.name || "Caseta"

       if(!casetas[nombre]){

          let tarifa=window.obtenerTarifa ? window.obtenerTarifa(nombre) : 0

          casetas[nombre]={
            name:nombre,
            costo:tarifa,
            lat:n.lat,
            lon:n.lon
          }

          total+=tarifa

          let m=L.marker([n.lat,n.lon]).addTo(map)
          m.bindPopup(nombre+" $"+tarifa)
          tollMarkers.push(m)

       }

     })

   }catch(e){
     console.log("error Overpass",e)
   }

 }

 window.casetasDetectadas=Object.values(casetas)
 window.casetasCosto=total

 setBuscando(false)

 document.getElementById("precios").innerHTML="Casetas detectadas: "+window.casetasDetectadas.length

}
