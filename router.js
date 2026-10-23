let map=null
let routeLayer=null
let currentRoute=[]

function initMap(){
 if(typeof L==="undefined"){
  setEstado("Mapa no disponible (sin conexión). Puedes escribir los km a mano.")
  return
 }
 map=L.map('map').setView([23,-102],5)
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:18,
  attribution:'© OpenStreetMap'
 }).addTo(map)
}

function limpiarRuta(){
 currentRoute=[]
 if(map&&routeLayer){map.removeLayer(routeLayer);routeLayer=null}
}

const esperar=ms=>new Promise(r=>setTimeout(r,ms))

async function calcularRuta(){

 const origen=document.getElementById("origen").value.trim()
 const destino=document.getElementById("destino").value.trim()
 if(!origen||!destino){setEstado("Escribe origen y destino");return}

 try{

  setEstado("Calculando ruta...")

  const o=await geocode(origen)
  await esperar(1100) // Nominatim permite 1 consulta por segundo
  const d=await geocode(destino)

  const url=`https://router.project-osrm.org/route/v1/driving/${o[0]},${o[1]};${d[0]},${d[1]}?overview=full&geometries=geojson`

  const r=await fetch(url)
  if(!r.ok) throw "El servicio de rutas no respondió ("+r.status+")"
  const data=await r.json()
  if(data.code!=="Ok"||!data.routes||!data.routes.length) throw "No se encontró ruta entre esos lugares"

  const route=data.routes[0]

  const km=(route.distance/1000).toFixed(0)
  document.getElementById("km").value=km

  limpiarRuta()
  currentRoute=route.geometry.coordinates

  if(map){
   routeLayer=L.geoJSON(route.geometry).addTo(map)
   map.fitBounds(routeLayer.getBounds())
  }

  setEstado("Ruta calculada: "+km+" km")

 }catch(e){

  setEstado("Error: "+e)

 }

}
