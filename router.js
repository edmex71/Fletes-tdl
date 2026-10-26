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

// ¿Sale de CDMX y va a la zona de Guadalajara?
function guadalajaraDesdeCdmx(o,d){
 const sale=o[0]>-99.45&&o[0]<-98.9&&o[1]>19.15&&o[1]<19.75
 return sale&&d[0]>-104&&d[0]<-102.6&&d[1]>20.2&&d[1]<21.1
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

// ---- Rutas que no deben cruzar a EE.UU. (un tráiler solo cruza la frontera si el destino está fuera de México)

// Frontera norte (aprox.) de Tijuana a Ciudad Juárez, como latitud según la longitud
const FRONTERA_NORTE=[[-117.125,32.535],[-114.72,32.718],[-114.7199,32.495],[-111.07,31.33],[-108.21,31.33],[-108.2099,31.78],[-106.53,31.78]]
function latFrontera(lon){
 const f=FRONTERA_NORTE
 if(lon<f[0][0]||lon>f[f.length-1][0]) return null
 for(let i=0;i<f.length-1;i++){
  if(lon>=f[i][0]&&lon<=f[i+1][0]){
   const t=(lon-f[i][0])/(f[i+1][0]-f[i][0])
   return f[i][1]+t*(f[i+1][1]-f[i][1])
  }
 }
 return null
}
// ¿Está el punto [lon,lat] del lado de EE.UU. (más de ~4 km al norte de la frontera)?
function enEstadosUnidos(p){
 const b=latFrontera(p[0])
 return b!==null&&p[1]>b+0.04
}
function rutaCruzaFrontera(coords,o,d){
 if(enEstadosUnidos(o)||enEstadosUnidos(d)) return false // el viaje mismo es hacia/desde EE.UU.
 return coords.some(enEstadosUnidos)
}

// Baja California / noroeste de Sonora ↔ Ciudad Juárez: por México es por Mexicali, San Luis Río Colorado,
// Santa Ana y Magdalena (como Traza tu ruta) y luego Mex 2 por Cananea, Agua Prieta, Janos y Ascensión.
function bajaYJuarez(o,d){
 const oeste=p=>p[0]<-114&&p[1]>30&&p[1]<33
 const juarez=p=>p[0]>-107.2&&p[0]<-106&&p[1]>31.2&&p[1]<32.2
 return (oeste(o)&&juarez(d))?1:((oeste(d)&&juarez(o))?-1:0)
}
function viasBajaJuarez(){
 const pts=[puntoCaseta("Mexicali"),puntoCaseta("San Luis Río Colorado"),puntoCaseta("Santa Ana"),puntoCaseta("Magdalena"),
  [-110.30,31.00],[-109.55,31.32],[-108.19,30.89],[-107.99,31.10]]
 return pts.every(Boolean)?pts:null
}

async function calcularRuta(){

 const origen=document.getElementById("origen").value.trim()
 const destino=document.getElementById("destino").value.trim()
 if(!origen||!destino){setEstado("Escribe origen y destino");return}

 try{

  setEstado("Calculando ruta...")

  const o=await geocode(origen)
  if(requiereBusqueda(origen)&&requiereBusqueda(destino)) await esperar(1100) // Nominatim permite 1 consulta por segundo
  const d=await geocode(destino)

  // Puntos intermedios para forzar el camino. Se pueden escribir ciudades o nombres de casetas, separados por ;
  const vias=[]
  const viaTxt=(document.getElementById("via")||{value:""}).value
  for(const v of viaTxt.split(";").map(x=>x.trim()).filter(Boolean)){
   const pc=puntoCaseta(v)
   if(pc){vias.push(pc);continue}
   if(requiereBusqueda(v)) await esperar(1100)
   vias.push(await geocode(v))
  }
  // Desde CDMX hacia el norte se va por la autopista México-Querétaro (Palmillas y Chichimequillas),
  // no por el Arco Norte, que solo se usa viniendo de Puebla. Solo si el usuario no puso sus propios puntos.
  let viaAuto=false
  if(!vias.length && norteDesdeCdmx(o,d)){
   const a=puntoCaseta("Palmillas"), b=puntoCaseta("Chichimequillas")
   if(a&&b){vias.push(a,b);viaAuto=true}
  }else if(!vias.length && bajaYJuarez(o,d)){
   const v=viasBajaJuarez()
   if(v){vias.push(...(bajaYJuarez(o,d)>0?v:v.slice().reverse()));viaAuto="juarez"}
  }else if(!vias.length && guadalajaraDesdeCdmx(o,d)){
   // CDMX-Guadalajara: 57D hasta Apaseo el Grande (por libre), Salamanca, La Piedad y La Barca
   const a=puntoCaseta("Palmillas")
   if(a){vias.push(a,[-100.689,20.547],[-101.195,20.573]);viaAuto=true}
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

  const aviso=rutaCruzaFrontera(currentRoute,o,d)?" ⚠ La ruta cruza a EE.UU. Agrega ciudades mexicanas en «Pasar por» para evitarlo.":""
  setEstado("Ruta calculada: "+km+" km"+(viaAuto==="juarez"?" (ruta forzada por México, sin cruzar la frontera)":(viaAuto?" (ruta forzada por la autopista México–Querétaro)":""))+aviso)

 }catch(e){

  setEstado("Error: "+e)

 }

}
