// Detección de casetas sobre la ruta.
// Mide la distancia de cada caseta al SEGMENTO más cercano de la ruta (no a los vértices).

const RADIO_KM=0.15 // una caseta cuenta si está a menos de 150 m de la ruta (más lejos suelen ser ramales o incorporaciones)
const DIST_MIN_ENTRE_ESTIMADAS_KM=3 // una estimada a menos de esto de otra caseta detectada se considera la misma

// Solo aplica a plazas de OpenStreetMap sin tarifa en la base (las que se estiman).
const EXCLUIR_PLAZAS_SIN_TARIFA=["CHALCO","VIA ATLIXCAYOTL","POLOTITLAN","JOROBAS","JILOTEPEC"]

// Plazas que son incorporaciones o anexos de otra carretera: no se cobran si vas en ruta por la autopista principal.
// Solo cuentan si el viaje empieza o termina cerca de ellas (ej. sales de Huehuetoca y te incorporas a la 57 por Jorobas).
// null = nunca se cobran (anexos de otra caseta).
const INCORPORACIONES={"JOROBAS":10,"POLOTITLAN":10,"HUACHICHIL":10,"QUERETARO BIS":null,"AGUALEGUAS":null,"VALLECITOS":null,"TRES MARIAS":10,"XOCHITEPEC":10,"ALPUYECA":10,"CIUDAD VALLES-TAMUIN":null,"IXTAPALUCA":null}

function normalizarNombre(n){
 return (n||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
}

const CELDA=0.05 // grados (~5 km): rejilla para no recorrer toda la ruta por cada caseta
const MARGEN=0.01 // ~1 km

function prepararRuta(coords){
 const grid=new Map(), largos=[]
 for(let i=0;i<coords.length-1;i++){
  const a=coords[i], b=coords[i+1]
  const x0=Math.floor((Math.min(a[0],b[0])-MARGEN)/CELDA), x1=Math.floor((Math.max(a[0],b[0])+MARGEN)/CELDA)
  const y0=Math.floor((Math.min(a[1],b[1])-MARGEN)/CELDA), y1=Math.floor((Math.max(a[1],b[1])+MARGEN)/CELDA)
  if((x1-x0+1)*(y1-y0+1)>400){largos.push(i);continue}
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
   const k=x+","+y
   let l=grid.get(k)
   if(!l){l=[];grid.set(k,l)}
   l.push(i)
  }
 }
 const cum=[0]
 for(let i=0;i<coords.length-1;i++){
  const a=coords[i], b=coords[i+1]
  const kx=111.32*Math.cos(a[1]*Math.PI/180)
  cum.push(cum[i]+Math.hypot((b[0]-a[0])*kx,(b[1]-a[1])*110.57))
 }
 return {c:coords,grid,largos,cum}
}

// Distancia en km del punto (px,py) al segmento a-b, con proyección local plana.
function distKmASegmento(px,py,ax,ay,bx,by){
 const kx=111.32*Math.cos(py*Math.PI/180)
 const ky=110.57
 const x1=(ax-px)*kx, y1=(ay-py)*ky
 const x2=(bx-px)*kx, y2=(by-py)*ky
 const dx=x2-x1, dy=y2-y1
 const l2=dx*dx+dy*dy
 let t=l2?Math.max(0,Math.min(1,-(x1*dx+y1*dy)/l2)):0
 const cx=x1+t*dx, cy=y1+t*dy
 return {d:Math.hypot(cx,cy),t}
}

// Kilómetro sobre la ruta para una posición fraccionaria (índice+t).
function kmEnRuta(R,pos){
 const i=Math.min(Math.floor(pos),R.cum.length-2)
 return R.cum[i]+(pos-i)*(R.cum[i+1]-R.cum[i])
}

// Devuelve {d,pos} si el punto está a <= radioKm de la ruta; pos = avance a lo largo de la ruta.
function cercaDeRuta(R,lon,lat,radioKm){
 const c=R.c
 const cand=(R.grid.get(Math.floor(lon/CELDA)+","+Math.floor(lat/CELDA))||[]).concat(R.largos)
 let mejor=null
 for(let j=0;j<cand.length;j++){
  const i=cand[j]
  const a=c[i], b=c[i+1]
  const r=distKmASegmento(lon,lat,a[0],a[1],b[0],b[1])
  if(r.d<=radioKm && (mejor===null||r.d<mejor.d)) mejor={d:r.d,pos:i+r.t}
 }
 return mejor
}

function coords0(c){return [c[0],c[1]]}

// Devuelve null si no hay ruta. Si hay: {con:[casetas con tarifa], est:[casetas sin tarifa]}
function detectarCasetas(ejes){
 if(!currentRoute||currentRoute.length<2) return null
 const R=prepararRuta(currentRoute)
 const con=[], est=[]
 const extremos=[coords0(R.c[0]), coords0(R.c[R.c.length-1])]
 function incorporacionOk(nombre,pts){
  const nom=normalizarNombre(nombre)
  const k=Object.keys(INCORPORACIONES).find(x=>nom.includes(x))
  if(!k) return true
  const r=INCORPORACIONES[k]
  if(r===null) return false
  return extremos.some(e=>pts.some(p=>distKmASegmento(p[0],p[1],e[0],e[1],e[0],e[1]).d<=r))
 }

 CASETAS_TARIFA.forEach(c=>{
  if(!incorporacionOk(c.n,c.pts)) return
  let mejor=null
  c.pts.forEach(p=>{
   const r=cercaDeRuta(R,p[0],p[1],RADIO_KM)
   if(r && (mejor===null||r.pos<mejor.pos)) mejor=r
  })
  if(!mejor) return
  const t=tarifaCaseta(c,ejes)
  if(t) con.push({nombre:c.n,monto:t.monto,tramo:t.tramo,desde:t.desde,multi:t.multi,aprox:t.aprox,pos:mejor.pos})
  else est.push({nombre:c.n,pos:mejor.pos,motivo:"sin tarifa para "+ejes+" ejes"})
 })

 // Plazas de OpenStreetMap sin tarifa en la base: ya no se estiman (daban falsos positivos). Solo cuentan casetas con tarifa.

 // Redes cerradas con boleto (Chamapa–La Venta–Lechería y Los Cabos): se cobra UNA sola vez la tarifa del par
 // entrada–salida (primer y último nodo que toca la ruta); las casetas intermedias no se suman.
 // Con un solo nodo no se cobra nada (evita falsos positivos).
 const REDES=[
  {nombre:"Chamapa–Lechería",nodos:["La Venta (Huixquilucan)","Interlomas","Huixquilucan","Chamapa","Cipreses","San Mateo Nopala","Lomas Verdes","Madin","Atizapan","Lago de Guadalupe","Lecheria"],alias:{}},
  {nombre:"Los Cabos",nodos:["San Jose del Cabo","Aeropuerto los Cabos","El Mangle","San Lucas"],alias:{"Cabo San Lucas":"San Lucas","Sn. Jose del Cabo":"San Jose del Cabo","San José del Cabo":"San Jose del Cabo"}}
 ]
 REDES.forEach(red=>{
  const nodosRed=con.filter(c=>red.nodos.includes(c.nombre)).sort((a,b)=>a.pos-b.pos)
  if(!nodosRed.length) return
  for(let i=con.length-1;i>=0;i--) if(red.nodos.includes(con[i].nombre)) con.splice(i,1)
  if(nodosRed.length<2) return
  const a=nodosRed[0], b=nodosRed[nodosRed.length-1]
  let v=null,tr=null
  CASETAS_TARIFA.forEach(r=>{
   if(!red.nodos.includes(r.n)) return
   r.tr.forEach(t=>{
    const m=t.tramo.split("-"); if(m.length!==2) return
    const p=red.alias[m[0].trim()]||m[0].trim(), q=red.alias[m[1].trim()]||m[1].trim()
    if(((p===a.nombre&&q===b.nombre)||(p===b.nombre&&q===a.nombre)) && t.t[ejes]!=null && (v===null||t.t[ejes]>v)){v=t.t[ejes];tr=t}
   })
  })
  if(v!==null) con.push({nombre:red.nombre+": "+a.nombre+" → "+b.nombre,monto:v,tramo:tr.tramo,desde:tr.desde,multi:false,aprox:!!tr.a&&ejes!==5,pos:a.pos})
 })

 // Casetas sin ubicación en el mapa que se cobran seguro si la ruta pasa por las dos de sus lados
 // (ej. Fortín está entre Esperanza y Cuitláhuac en la 150D).
 const IMPLICITAS=[{n:"Fortin",entre:["Esperanza (Puebla)","Cuitlahuac"]}]
 IMPLICITAS.forEach(r=>{
  const a=con.find(c=>c.nombre===r.entre[0]), b=con.find(c=>c.nombre===r.entre[1])
  const rec=CASETAS_TARIFA.find(c=>c.n===r.n)
  if(!a||!b||!rec||con.some(c=>c.nombre===r.n)) return
  const tf=tarifaCaseta(rec,ejes)
  if(tf) con.push({nombre:rec.n,monto:tf.monto,tramo:tf.tramo,desde:tf.desde,multi:tf.multi,aprox:tf.aprox,pos:(a.pos+b.pos)/2})
 })

 // Casetas cuyo cobro ya va incluido en el tramo directo de otra (Traza tu ruta no las suma aparte).
 const INCLUIDAS={"San Marcos":["Chalco","Ixtapaluca"]}
 const hay=n=>con.some(c=>c.nombre===n)
 const incl=Object.keys(INCLUIDAS).filter(hay).flatMap(k=>INCLUIDAS[k].map(normalizarNombre))
 for(let i=con.length-1;i>=0;i--) if(incl.includes(normalizarNombre(con[i].nombre))) con.splice(i,1)
 for(let i=est.length-1;i>=0;i--) if(incl.some(x=>normalizarNombre(est[i].nombre).includes(x))) est.splice(i,1)

 // Saliendo de CDMX, Atlacomulco/Querétaro es una incorporación a la 57D y no se cobra (viniendo de Toluca sí).
 const sale=extremos[0][0]>-99.45&&extremos[0][0]<-98.9&&extremos[0][1]>19.15&&extremos[0][1]<19.75
 if(sale){
  for(let i=con.length-1;i>=0;i--) if(normalizarNombre(con[i].nombre).includes('ATLACOMULCO')) con.splice(i,1)
 }

 con.sort((a,b)=>a.pos-b.pos)
 est.sort((a,b)=>a.pos-b.pos)

 // Quitar estimadas repetidas: mismo nombre, o muy cerca (a lo largo de la ruta) de otra caseta ya detectada.
 const kms=con.map(c=>kmEnRuta(R,c.pos))
 const est2=[]
 est.forEach(e=>{
  const k=kmEnRuta(R,e.pos)
  const nom=normalizarNombre(e.nombre)
  const rep=(nom&&!/SIN NOMBRE/.test(nom)&&est2.some(x=>normalizarNombre(x.nombre)===nom))
  const cerca=kms.some(x=>Math.abs(x-k)<DIST_MIN_ENTRE_ESTIMADAS_KM)
  if(rep||cerca) return
  kms.push(k); est2.push(e)
 })
 return {con,est:est2}
}
