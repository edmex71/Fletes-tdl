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

// Punto [lon,lat] de una caseta de la base buscada por nombre (sin acentos ni mayúsculas), o null.
function puntoCaseta(nombre){
 if(typeof CASETAS_TARIFA==="undefined") return null
 const n=normalizarNombre(nombre)
 const c=CASETAS_TARIFA.find(x=>normalizarNombre(x.n)===n&&x.pts.length)
 return c?c.pts[0]:null
}

// ¿Sale de CDMX y va al norte por la 57D? (Bajío, SLP, Monterrey, Reynosa, Torreón, Chihuahua, Juárez...)
function norteDesdeCdmx(o,d){
 const sale=o[0]>-99.45&&o[0]<-98.9&&o[1]>19.15&&o[1]<19.75
 if(!sale) return false
 const [x,y]=d
 const huasteca=y<23.5&&x>-99.3
 if(y>=22&&x>=-102.5&&x<=-97.5) return !huasteca
 if(y>=24.5&&x>=-107&&x<-102.5) return true
 return false
}

async function calcularRuta(){

 const origen=document.getElementById("origen").value.trim()
 const destino=document.getElementById("destino").value.trim()
 if(!origen||!destino){setEstado("Escribe origen y destino");return}

 try{

  setEstado("Calculando ruta...")

  const o=await geocode(origen)
  await esperar(1100) // Nominatim permite 1 consulta por segundo
  await esperar(1100)
  const d=await geocode(destino)

  // Puntos intermedios para forzar el camino. Se pueden escribir ciudades o nombres de casetas, separados por ;
  const vias=[]
  const viaTxt=(document.getElementById("via")||{value:""}).value
  for(const v of viaTxt.split(";").map(x=>x.trim()).filter(Boolean)){
   const pc=puntoCaseta(v)
   if(pc){vias.push(pc);continue}
   await esperar(1100)
   vias.push(await geocode(v))
  }
  // Desde CDMX hacia el norte se va por la autopista México-Querétaro (Palmillas y Chichimequillas),
  // no por el Arco Norte, que solo se usa viniendo de Puebla. Solo si el usuario no puso sus propios puntos.
  let viaAuto=false
  if(!vias.length && norteDesdeCdmx(o,d)){
   const a=puntoCaseta("Palmillas"), b=puntoCaseta("Chichimequillas")
   if(a&&b){vias.push(a,b);viaAuto=true}
  }
  const puntos=[o,...vias,d].map(p=>p[0]+","+p[1]).join(";")

  const url=`https://router.project-osrm.org/route/v1/driving/${puntos}?overview=full&geometries=geojson${vias.length?"&continue_straight=true":""}`

  const r=await fetch(url)
  if(!r.ok) throw "El servicio de rutas no respondió ("+r.status+")"
  const data=await r.json()
  if(data.code!=="Ok"||!data.routes||!data.routes.length) throw "No se encontró ruta entre esos lugares"

  const route=data.routes[0]

  const km=(route.distance/1000).toFixed(0)
  document.getElementById("km").value=km

  limpiarRuta()
  currentRoute=route.geometry.coordinates
  if(typeof ignoradas!=="undefined") ignoradas=new Set()

  if(map){
   routeLayer=L.geoJSON(route.geometry).addTo(map)
   map.fitBounds(routeLayer.getBounds())
  }

  setEstado("Ruta calculada: "+km+" km"+(viaAuto?" (por autopista México–Querétaro: Palmillas y Chichimequillas)":""))

 }catch(e){

  setEstado("Error: "+e)

 }

}
