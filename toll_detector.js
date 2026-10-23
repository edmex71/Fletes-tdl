// Detección de casetas sobre la ruta.
// Mide la distancia de cada caseta al SEGMENTO más cercano de la ruta (no a los vértices).

const RADIO_KM=0.35 // una caseta cuenta si está a menos de 350 m de la ruta

// Solo aplica a plazas de OpenStreetMap sin tarifa en la base (las que se estiman).
const EXCLUIR_PLAZAS_SIN_TARIFA=["CHALCO","VIA ATLIXCAYOTL","POLOTITLAN","JOROBAS"]

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
 return {c:coords,grid,largos}
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

// Devuelve null si no hay ruta. Si hay: {con:[casetas con tarifa], est:[casetas sin tarifa]}
function detectarCasetas(ejes){
 if(!currentRoute||currentRoute.length<2) return null
 const R=prepararRuta(currentRoute)
 const con=[], est=[]

 CASETAS_TARIFA.forEach(c=>{
  let mejor=null
  c.pts.forEach(p=>{
   const r=cercaDeRuta(R,p[0],p[1],RADIO_KM)
   if(r && (mejor===null||r.pos<mejor.pos)) mejor=r
  })
  if(!mejor) return
  const t=tarifaCaseta(c,ejes)
  if(t) con.push({nombre:c.n,monto:t.monto,tramo:t.tramo,desde:t.desde,multi:t.multi,pos:mejor.pos})
  else est.push({nombre:c.n,pos:mejor.pos,motivo:"sin tarifa para "+ejes+" ejes"})
 })

 PLAZAS_SIN_TARIFA.forEach(pl=>{
  const nom=normalizarNombre(pl.n)
  if(EXCLUIR_PLAZAS_SIN_TARIFA.some(x=>nom.includes(x))) return
  const r=cercaDeRuta(R,pl.p[0],pl.p[1],RADIO_KM)
  if(r) est.push({nombre:pl.n,pos:r.pos,motivo:"sin tarifa en la base"})
 })

 con.sort((a,b)=>a.pos-b.pos)
 est.sort((a,b)=>a.pos-b.pos)
 return {con,est}
}
