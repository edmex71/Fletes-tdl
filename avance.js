// Botón "Avance": desde donde va el camión y las horas que lleva avanzando, marca en el mapa dónde estará.
// Usa la velocidad promedio de la cotización (5 ejes = 65 km/h, por lo que 3 h = 195 km).
let avanceMarca=null
function quitarAvance(){
 if(map&&avanceMarca){map.removeLayer(avanceMarca);avanceMarca=null}
 const i=document.getElementById("avance_info"); if(i){i.style.display="none";i.innerHTML=""}
}
// Lo que falta (km y horas) desde el punto marcado hasta cada «Pasar por» del usuario
function faltantesPasarPor(ruta,sActual,vel,vias){
 const ac=_acumulada(ruta)
 return (vias||[]).map(v=>{
  const s=_proyectar(ruta,ac,v.punto).s
  return {nombre:v.nombre,km:s-sActual,horas:(s-sActual)/vel,pasado:s<=sActual}
 })
}
function _hhmm(h){const m=Math.round(h*60);return Math.floor(m/60)+" h "+String(m%60).padStart(2,"0")+" min"}
function _kmEntre(a,b){
 const R=6371,r=Math.PI/180
 const dLat=(b[1]-a[1])*r,dLon=(b[0]-a[0])*r
 const h=Math.sin(dLat/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLon/2)**2
 return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))
}
// Distancia acumulada (km) de cada vértice de la ruta
function _acumulada(ruta){
 const ac=[0]
 for(let i=1;i<ruta.length;i++) ac.push(ac[i-1]+_kmEntre(ruta[i-1],ruta[i]))
 return ac
}
// Punto de la ruta más cercano a p: {s: km recorridos desde el origen, d: km de separación}
function _proyectar(ruta,ac,p){
 let mejor={s:0,d:Infinity}
 const kx=Math.cos(p[1]*Math.PI/180)
 for(let i=0;i<ruta.length-1;i++){
  const a=ruta[i],b=ruta[i+1]
  const ax=(a[0]-p[0])*kx,ay=a[1]-p[1],bx=(b[0]-p[0])*kx,by=b[1]-p[1]
  const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy
  let t=l2?-(ax*dx+ay*dy)/l2:0
  t=Math.max(0,Math.min(1,t))
  const q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]
  const d=_kmEntre(p,q)
  if(d<mejor.d) mejor={s:ac[i]+(ac[i+1]-ac[i])*t,d}
 }
 return mejor
}
// Punto [lon,lat] a s km del origen
function _puntoEn(ruta,ac,s){
 if(s<=0) return ruta[0]
 const n=ruta.length-1
 if(s>=ac[n]) return ruta[n]
 let i=1
 while(i<n&&ac[i]<s) i++
 const t=(s-ac[i-1])/((ac[i]-ac[i-1])||1)
 return [ruta[i-1][0]+(ruta[i][0]-ruta[i-1][0])*t,ruta[i-1][1]+(ruta[i][1]-ruta[i-1][1])*t]
}
// Busca el lugar SOLO dentro del área de la ruta y elige el resultado más cercano a ella
// (así "Puerto San Luis" encuentra el de la ruta y no otro del mismo nombre en otra parte del país)
async function buscarCercaDeRuta(lugar,ruta){
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9
 for(const p of ruta){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
 const m=0.3
 const url="https://nominatim.openstreetmap.org/search?format=json&limit=10&countrycodes=mx&bounded=1&viewbox="+
  (x0-m)+","+(y1+m)+","+(x1+m)+","+(y0-m)+"&q="+encodeURIComponent(lugar)
 const r=await fetch(url)
 if(!r.ok) return null
 const data=await r.json()
 const ac=_acumulada(ruta)
 let mejor=null
 for(const d of data){
  const p=[parseFloat(d.lon),parseFloat(d.lat)]
  if(!isFinite(p[0])||!isFinite(p[1])) continue
  const dist=_proyectar(ruta,ac,p).d
  if(!mejor||dist<mejor.dist) mejor={p,dist}
 }
 return mejor&&mejor.dist<=60?mejor.p:null
}

// Plus Code corto (ej. H384+P5): se recupera usando puntos de la propia ruta como referencia,
// y se acepta el que quede sobre la ruta. Devuelve [lon,lat] o null.
function plusCodeEnRuta(texto,ruta){
 const pc=leerPlusCode(texto)
 if(!pc||pc.completo) return null
 const ac=_acumulada(ruta)
 const paso=Math.max(1,Math.floor(ruta.length/400))
 let mejor=null
 for(let i=0;i<ruta.length;i+=paso){
  let p
  try{p=recuperarOLC(pc.codigo,ruta[i])}catch(e){continue}
  if(!p||!isFinite(p[0])||!isFinite(p[1])) continue
  const d=_proyectar(ruta,ac,p).d
  if(!mejor||d<mejor.d) mejor={p,d}
 }
 return mejor&&mejor.d<=8?mejor.p:null
}

// Busca el lugar escrito dando preferencia a los que quedan sobre la ruta calculada
// (varios pueblos comparten nombre; el buscador normal elige uno cualquiera del país).
async function ubicarEnRuta(texto,ruta){
 const pc=plusCodeEnRuta(texto,ruta)
 if(pc) return pc
 const cas=puntoCaseta(texto)
 if(cas&&_proyectar(ruta,_acumulada(ruta),cas).d<=15) return cas
 if(!leerCoordenadas(texto)&&!leerPlusCode(texto)){
  try{
   let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9
   for(const c of ruta){x0=Math.min(x0,c[0]);x1=Math.max(x1,c[0]);y0=Math.min(y0,c[1]);y1=Math.max(y1,c[1])}
   const vb=[x0-0.5,y1+0.5,x1+0.5,y0-0.5].join(",")
   const url="https://nominatim.openstreetmap.org/search?format=json&limit=15&countrycodes=mx&viewbox="+vb+"&bounded=1&q="+encodeURIComponent(texto)
   const r=await fetch(url)
   if(r.ok){
    const data=await r.json(),ac=_acumulada(ruta)
    let mejor=null
    for(const it of data){
     const p=[parseFloat(it.lon),parseFloat(it.lat)],d=_proyectar(ruta,ac,p).d
     if(!mejor||d<mejor.d) mejor={p,d}
    }
    if(mejor&&mejor.d<=30) return mejor.p
   }
  }catch(e){}
 }
 return null
}

// Cálculo puro (se puede probar sin pantalla)
function calcularAvance(ruta,posicion,horas,vel){
 const ac=_acumulada(ruta),tot=ac[ac.length-1]
 const pr=_proyectar(ruta,ac,posicion)
 const km=horas*vel
 const s=Math.min(tot,pr.s+km)
 return {punto:_puntoEn(ruta,ac,s),km,kmDesdeOrigen:s,kmRestantes:Math.max(0,tot-s),llegoAlDestino:pr.s+km>=tot,separacion:pr.d,total:tot}
}

function mostrarBotonAvance(v){
 const b=document.getElementById("btn_avance")
 if(b) b.style.display=v?"inline-block":"none"
}
function abrirAvance(){
 if(!currentRoute.length){setEstado("Primero calcula la ruta");return}
 document.getElementById("avance_msg").textContent=""
 document.getElementById("avance_form").style.display="flex"
}
function cerrarAvance(){document.getElementById("avance_form").style.display="none"}
async function calcularAvanceUI(){
 const msg=document.getElementById("avance_msg")
 const lugar=document.getElementById("avance_lugar").value.trim()
 const horas=parseFloat(document.getElementById("avance_horas").value)
 if(!lugar){msg.textContent="Escribe dónde va el camión ahora";return}
 if(!currentRoute.length){msg.textContent="Primero calcula la ruta";return}
 msg.textContent="Buscando..."
 try{
  const pos=(await ubicarEnRuta(lugar,currentRoute))||await geocode(lugar)
  const vel=(ultimoCalculo&&ultimoCalculo.vel)||velocidadPromedio(parseInt(document.getElementById("ejes").value)||5)
  const r=calcularAvance(currentRoute,pos,horas,vel)
  if(r.separacion>60){msg.textContent="\""+lugar+"\" queda a "+r.separacion.toFixed(0)+" km de la ruta. Escribe un punto que esté sobre la ruta.";return}
  quitarAvance()
  const falt=faltantesPasarPor(currentRoute,r.kmDesdeOrigen,vel,typeof viasUsuario!=="undefined"?viasUsuario:[])
  const lineas=falt.map(f=>f.pasado?f.nombre+": ya pasó":f.nombre+": faltan "+f.km.toFixed(0)+" km (≈ "+_hhmm(f.horas)+")")
  const infoDiv=document.getElementById("avance_info")
  if(infoDiv&&lineas.length){
   infoDiv.innerHTML="<b>Faltan desde el punto marcado:</b><br>"+lineas.map(x=>x.replace(/</g,"&lt;")).join("<br>")+"<br>Destino: "+(r.kmRestantes.toFixed(0))+" km (≈ "+_hhmm(r.kmRestantes/vel)+")"
   infoDiv.style.display="block"
  }
  if(map){
   avanceMarca=L.layerGroup([
    L.circleMarker([pos[1],pos[0]],{radius:6,color:"#1b5e20",fillColor:"#66bb6a",fillOpacity:1}).bindTooltip("Avance actual: "+lugar),
    L.marker([r.punto[1],r.punto[0]]).bindPopup((horas===0?"<b>Punto actual: "+lugar+"</b>":"<b>"+horas+" h después</b><br>"+r.km.toFixed(0)+" km de "+lugar)+"<br>Faltan "+r.kmRestantes.toFixed(0)+" km al destino"+(lineas.length?"<br>"+lineas.map(x=>x.replace(/</g,"&lt;")).join("<br>"):""))
   ]).addTo(map)
   map.fitBounds(L.latLngBounds([[pos[1],pos[0]],[r.punto[1],r.punto[0]]]).pad(0.5),{maxZoom:9})
   avanceMarca.eachLayer(l=>{if(l.openPopup)l.openPopup()})
  }
  cerrarAvance()
  setEstado(horas===0?"Desde "+lugar+": faltan "+r.kmRestantes.toFixed(0)+" km al destino (≈ "+_hhmm(r.kmRestantes/vel)+")":r.llegoAlDestino?"Con "+horas+" h desde "+lugar+" ya llega al destino (faltaban menos de "+r.km.toFixed(0)+" km)":"Avance: a "+horas+" h de "+lugar+" (≈"+r.km.toFixed(0)+" km a "+vel+" km/h) · faltan "+r.kmRestantes.toFixed(0)+" km al destino")
 }catch(e){msg.textContent=String(e)}
}
