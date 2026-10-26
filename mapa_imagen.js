// Mapa de la ruta dibujado en un canvas (fondo de calles de OpenStreetMap + trazo + origen/destino + casetas).
// No captura la pantalla: calcula los mosaicos y dibuja encima, así funciona igual en el teléfono.

const TILE_URL="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
const TILE_TIMEOUT_MS=8000

function mercatorPx(lon,lat,z){
 const s=256*Math.pow(2,z)
 const x=(lon+180)/360*s
 const r=Math.max(-85.05,Math.min(85.05,lat))*Math.PI/180
 const y=(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*s
 return [x,y]
}

function cargarMosaico(z,x,y){
 return new Promise(res=>{
  const img=new Image()
  img.crossOrigin="anonymous" // si el servidor no permite CORS el mosaico simplemente no carga (no "mancha" el canvas)
  const t=setTimeout(()=>{img.onload=img.onerror=null;res(null)},TILE_TIMEOUT_MS)
  img.onload=()=>{clearTimeout(t);res(img)}
  img.onerror=()=>{clearTimeout(t);res(null)}
  img.src=TILE_URL.replace("{z}",z).replace("{x}",x).replace("{y}",y)
 })
}

// ruta: [[lon,lat],...]; casetas: [{lon,lat}] (se numeran en orden); devuelve un canvas w×h o null si no hay ruta.
async function crearMapaCanvas(ruta,w,h,casetas){
 if(!ruta||ruta.length<2) return null
 const pad=34
 let minLon=180,maxLon=-180,minLat=90,maxLat=-90
 ruta.forEach(p=>{
  if(p[0]<minLon)minLon=p[0]; if(p[0]>maxLon)maxLon=p[0]
  if(p[1]<minLat)minLat=p[1]; if(p[1]>maxLat)maxLat=p[1]
 })
 // zoom más grande en que todo el trazo cabe en el recuadro
 let z=3
 for(let k=15;k>=3;k--){
  const a=mercatorPx(minLon,maxLat,k), b=mercatorPx(maxLon,minLat,k)
  if(b[0]-a[0]<=w-2*pad && b[1]-a[1]<=h-2*pad){z=k;break}
 }
 const c0=mercatorPx((minLon+maxLon)/2,(minLat+maxLat)/2,z)
 const ox=c0[0]-w/2, oy=c0[1]-h/2 // pixel del mundo que queda en la esquina superior izquierda
 const proj=(lon,lat)=>{const p=mercatorPx(lon,lat,z);return [p[0]-ox,p[1]-oy]}

 const canvas=document.createElement("canvas")
 canvas.width=w; canvas.height=h
 const ctx=canvas.getContext("2d")
 ctx.fillStyle="#e6ecf1"
 ctx.fillRect(0,0,w,h)

 // Mosaicos de fondo
 const n=Math.pow(2,z)
 const tx0=Math.floor(ox/256), tx1=Math.floor((ox+w)/256)
 const ty0=Math.max(0,Math.floor(oy/256)), ty1=Math.min(n-1,Math.floor((oy+h)/256))
 const pedidos=[]
 for(let tx=tx0;tx<=tx1;tx++)for(let ty=ty0;ty<=ty1;ty++){
  const txw=((tx%n)+n)%n
  pedidos.push(cargarMosaico(z,txw,ty).then(img=>({img,x:tx*256-ox,y:ty*256-oy})))
 }
 const res=await Promise.all(pedidos)
 let cargados=0
 res.forEach(t=>{if(t.img){ctx.drawImage(t.img,t.x,t.y,256,256);cargados++}})

 // Trazo de la ruta
 const trazar=()=>{
  ctx.beginPath()
  let ult=null
  ruta.forEach((p,i)=>{
   const q=proj(p[0],p[1])
   if(ult&&Math.abs(q[0]-ult[0])<1&&Math.abs(q[1]-ult[1])<1&&i<ruta.length-1) return // omite puntos casi iguales
   if(!ult) ctx.moveTo(q[0],q[1]); else ctx.lineTo(q[0],q[1])
   ult=q
  })
 }
 ctx.lineJoin="round"; ctx.lineCap="round"
 trazar(); ctx.strokeStyle="#ffffff"; ctx.lineWidth=8; ctx.stroke()
 trazar(); ctx.strokeStyle="#1a56db"; ctx.lineWidth=4.5; ctx.stroke()

 function punto(q,color,txt,r){
  ctx.beginPath(); ctx.arc(q[0],q[1],r,0,Math.PI*2)
  ctx.fillStyle=color; ctx.fill()
  ctx.lineWidth=3; ctx.strokeStyle="#fff"; ctx.stroke()
  ctx.fillStyle="#fff"; ctx.font="bold "+Math.round(r*1.05)+"px Arial"
  ctx.textAlign="center"; ctx.textBaseline="middle"
  ctx.fillText(txt,q[0],q[1]+1)
  ctx.textAlign="left"; ctx.textBaseline="alphabetic"
 }
 ;(casetas||[]).forEach((c,i)=>punto(proj(c.lon,c.lat),"#e8590c",String(i+1),11))
 const ini=ruta[0], fin=ruta[ruta.length-1]
 punto(proj(ini[0],ini[1]),"#2b9348","A",15)
 punto(proj(fin[0],fin[1]),"#c1121f","B",15)

 // Atribución obligatoria de OpenStreetMap
 const txt="© OpenStreetMap contributors"
 ctx.font="13px Arial"
 const tw=ctx.measureText(txt).width
 ctx.fillStyle="rgba(255,255,255,.8)"
 ctx.fillRect(w-tw-12,h-22,tw+12,22)
 ctx.fillStyle="#333"
 ctx.fillText(txt,w-tw-6,h-7)

 ctx.strokeStyle="#9aa5b1"; ctx.lineWidth=2; ctx.strokeRect(1,1,w-2,h-2)
 canvas._mosaicos=cargados
 return canvas
}
