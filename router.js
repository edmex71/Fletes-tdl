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

// Frontera norte completa (aprox.), de Tijuana al Golfo, en el sentido oeste→este. EE.UU. queda siempre a la IZQUIERDA.
const FRONTERA_NORTE=[[-117.125,32.535],[-114.72,32.718],[-114.72,32.495],[-111.07,31.33],[-108.21,31.33],[-108.21,31.78],
 [-106.53,31.78],[-106.33,31.65],[-105.80,31.25],[-105.0,30.65],[-104.68,30.12],[-104.37,29.56],[-103.78,29.26],[-103.2,29.0],
 [-102.95,29.18],[-102.35,29.75],[-101.55,29.80],[-101.0,29.37],[-100.92,29.32],[-100.50,28.71],[-100.30,28.20],[-99.55,27.55],
 [-99.45,27.20],[-99.15,26.65],[-98.82,26.35],[-98.25,26.05],[-97.50,25.87],[-97.15,25.96]]
const MARGEN_FRONTERA_KM=8 // la frontera dibujada es aproximada: dentro de este margen se considera México

// Distancia con signo (km) del punto [lon,lat] a la frontera: positiva = lado de EE.UU., negativa = México.
function distanciaFrontera(p){
 const f=FRONTERA_NORTE, kx=111.32*Math.cos(p[1]*Math.PI/180), ky=110.57
 let mejor=null
 for(let i=0;i<f.length-1;i++){
  const ax=(f[i][0]-p[0])*kx, ay=(f[i][1]-p[1])*ky, bx=(f[i+1][0]-p[0])*kx, by=(f[i+1][1]-p[1])*ky
  const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy
  const t=l2?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/l2)):0
  const cx=ax+t*dx, cy=ay+t*dy, dist=Math.hypot(cx,cy)
  if(mejor===null||dist<mejor.dist){
   const cruz=dx*(-ay)-dy*(-ax) // >0: el punto queda a la izquierda del segmento
   mejor={dist,lado:cruz>0?1:-1,fuera:(t===0&&i===0)||(t===1&&i===f.length-2)}
  }
 }
 return mejor.lado*mejor.dist
}
// ¿Está el punto del lado de EE.UU. (más allá del margen)?
function enEstadosUnidos(p){
 return distanciaFrontera(p)>MARGEN_FRONTERA_KM
}
function rutaCruzaFrontera(coords,o,d){
 if(enEstadosUnidos(o)||enEstadosUnidos(d)) return false // el viaje mismo es hacia/desde EE.UU.
 return coords.some(enEstadosUnidos)
}
function puntosEnEE(coords){let n=0;coords.forEach(p=>{if(enEstadosUnidos(p))n++});return n}

// Ciudades mexicanas de la frontera (con pasos a EE.UU.) y poblaciones de enlace en carretera. Sirven como puntos de
// paso para que el servicio de rutas no se meta a EE.UU. Se evitan lugares remotos (terracerías) que desvían el trazo.
const CIUDADES_FRONTERA=[
 ["Tijuana",-117.04,32.53],["Tecate",-116.63,32.57],["Mexicali",-115.47,32.62],["San Luis Río Colorado",-114.78,32.46],
 ["Sonoyta",-112.85,31.86],["Nogales",-110.94,31.30],["Naco",-109.94,31.33],["Agua Prieta",-109.55,31.32],
 ["Cananea",-110.30,31.00],["Janos",-108.19,30.89],["Ascensión",-107.99,31.10],["Ciudad Juárez",-106.49,31.69],
 ["Ojinaga",-104.42,29.56],["Ciudad Acuña",-100.93,29.32],["Piedras Negras",-100.52,28.70],["Guerrero (Coah.)",-100.40,28.31],
 ["Colombia",-99.75,27.70],["Nuevo Laredo",-99.51,27.48],["Ciudad Miguel Alemán",-99.03,26.40],["Ciudad Camargo",-98.83,26.31],
 ["Reynosa",-98.28,26.08],["Río Bravo",-98.09,25.99],["Matamoros",-97.50,25.87]
]

function kmEntre(a,b){
 const kx=111.32*Math.cos(((a[1]+b[1])/2)*Math.PI/180)
 return Math.hypot((a[0]-b[0])*kx,(a[1]-b[1])*110.57)
}

// Índice del vértice de la ruta más cercano al punto
function indiceCercano(coords,p){
 let mej=0,md=Infinity
 for(let i=0;i<coords.length;i+=Math.max(1,Math.floor(coords.length/4000))){
  const d=(coords[i][0]-p[0])**2+(coords[i][1]-p[1])**2
  if(d<md){md=d;mej=i}
 }
 return mej
}

// Si el trazo entra a EE.UU., devuelve la lista de puntos de paso (los del usuario + ciudades mexicanas de la frontera
// cercanas al tramo que sale de México), ordenados a lo largo de la ruta. null si no hay nada que agregar.
function viasParaEvitarEE(coords,o,d,vias){
 const idx=[]
 coords.forEach((p,i)=>{if(enEstadosUnidos(p))idx.push(i)})
 if(!idx.length) return null
 // tramos: runs de índices separados por menos de 40 km de ruta
 const tramos=[]
 let ini=idx[0],ult=idx[0]
 for(let k=1;k<idx.length;k++){
  if(kmEntre(coords[ult],coords[idx[k]])>40){tramos.push([ini,ult]);ini=idx[k]}
  ult=idx[k]
 }
 tramos.push([ini,ult])
 const elegidas=[]
 tramos.forEach(([i0,i1])=>{
  const a=Math.max(0,i0-1), b=Math.min(coords.length-1,i1+1)
  const sub=[]
  const paso=Math.max(1,Math.floor((b-a)/300))
  for(let i=a;i<=b;i+=paso) sub.push(coords[i])
  CIUDADES_FRONTERA.forEach(c=>{
   const p=[c[1],c[2]]
   if(kmEntre(p,o)<25||kmEntre(p,d)<25) return // ya son origen o destino
   if(sub.some(q=>kmEntre(p,q)<90)){
    const i=indiceCercano(coords,p)
    if(i>=a-200&&i<=b+200) elegidas.push({p,i,n:c[0]})
   }
  })
 })
 if(!elegidas.length) return null
 const todas=vias.map(p=>({p,i:indiceCercano(coords,p),u:true}))
 elegidas.forEach(e=>{
  if(!todas.some(t=>kmEntre(t.p,e.p)<20)) todas.push(e)
 })
 if(todas.length===vias.length) return null
 todas.sort((x,y)=>x.i-y.i)
 return todas.map(t=>t.p)
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
  const pedirRuta=async vs=>{
   const puntos=[o,...vs,d].map(p=>p[0]+","+p[1]).join(";")
   const url=`https://router.project-osrm.org/route/v1/driving/${puntos}?overview=full&geometries=geojson${vs.length?"&continue_straight=true":""}`
   const r=await fetch(url)
   if(!r.ok) throw "El servicio de rutas no respondió ("+r.status+")"
   const data=await r.json()
   if(data.code!=="Ok"||!data.routes||!data.routes.length) throw "No se encontró ruta entre esos lugares"
   return data.routes[0]
  }

  let route=await pedirRuta(vias)

  // Si el viaje es dentro de México y el trazo se mete a EE.UU., se agregan ciudades mexicanas de la frontera
  // como puntos de paso y se recalcula (hasta 3 intentos); se conserva la ruta con menos puntos en EE.UU.
  let corregida=false
  if(!enEstadosUnidos(o)&&!enEstadosUnidos(d)){
   let viasAct=vias.slice(), mejorN=puntosEnEE(route.geometry.coordinates)
   for(let it=0;it<3&&mejorN>0;it++){
    const nv=viasParaEvitarEE(route.geometry.coordinates,o,d,viasAct)
    if(!nv) break
    let nr
    try{nr=await pedirRuta(nv)}catch(e){break}
    const n=puntosEnEE(nr.geometry.coordinates)
    if(n<mejorN){route=nr;mejorN=n;viasAct=nv;corregida=true}else break
   }
  }

  const km=(route.distance/1000).toFixed(0)
  document.getElementById("km").value=km

  limpiarRuta()
  currentRoute=route.geometry.coordinates
  if(typeof ignoradas!=="undefined") ignoradas=new Set()

  if(map){
   routeLayer=L.geoJSON(route.geometry).addTo(map)
   map.fitBounds(routeLayer.getBounds())
  }

  const cruza=rutaCruzaFrontera(currentRoute,o,d)
  const aviso=cruza?" ⚠ La ruta cruza a EE.UU. Agrega ciudades mexicanas en «Pasar por» para evitarlo.":(corregida?" (ruta ajustada para no cruzar a EE.UU.)":"")
  setEstado("Ruta calculada: "+km+" km"+(viaAuto==="juarez"?" (ruta forzada por México, sin cruzar la frontera)":(viaAuto?" (ruta forzada por la autopista México–Querétaro)":""))+aviso)

 }catch(e){

  setEstado("Error: "+e)

 }

}
