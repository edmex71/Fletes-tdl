function escapar(s){
 return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}

// ---- Parámetros que se pueden ajustar ----
const GASTO_CHOFER_POR_BLOQUE=1800 // gastos de viaje y chofer por cada bloque de horas
const HORAS_POR_BLOQUE=12          // cada bloque, completo o iniciado, cuesta GASTO_CHOFER_POR_BLOQUE

// Tarifas de casetas: CAPUFE vigentes desde 13-abr-2026. Las estimadas pueden variar hasta este %.
// Solo se muestra como aviso; NO se suma al costo hasta tener una base actualizada.
const AJUSTE_CASETAS_MAX=0.09

function porcentaje(x){ return +(x*100).toFixed(1) }

// Velocidad promedio (km/h) según ejes
function velocidadPromedio(ejes){
 if(ejes<=3) return 90 // 2 ejes: 90
 if(ejes<=6) return 65 // 5 ejes: 65
 return 45             // 7 ejes o más: 45
}

// Gastos de viaje y chofer: $1,800 por cada 12 h de viaje (bloque iniciado cuenta completo)
function gastosChofer(horas){
 const bloques=Math.max(1,Math.ceil(horas/HORAS_POR_BLOQUE-1e-9))
 return {bloques,monto:bloques*GASTO_CHOFER_POR_BLOQUE}
}

function precioPorKm(km){
 let tarifa=32
 if(km>300) tarifa=38
 if(km>700) tarifa=42
 return Math.ceil((km*tarifa)/100)*100
}

// Pesos sin redondear (para casetas y desglose)
function pesos(n){
 return "$"+Math.round(n).toLocaleString("en-US")
}

// Precios sugeridos: se redondean hacia arriba a $100
function formatoDinero(n){
 const v=Math.ceil(n/100)*100
 return "$"+v.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})
}

function calcularTiempo(km,ejes){
 const h=km/velocidadPromedio(ejes)
 const red=Math.ceil(h*2)/2
 const horas=Math.floor(red)
 const mins=(red-horas)*60
 return horas+" h"+(mins?" 30 min":"")
}

function setEstado(t){
 document.getElementById("estado").innerText=t
}

// extraKm: monto que se suma solo al precio «Por km» (ferry + 30% del ferry)
function calcularPrecios(costo,km,extraKm=0){
 const p={
  bajo:Math.ceil(costo*1.15/100)*100,
  medio:Math.ceil(costo*1.30/100)*100,
  alto:Math.ceil(costo*1.45/100)*100,
  km:Math.ceil((precioPorKm(km)+extraKm)/100)*100
 }
 document.getElementById("precio_bajo").innerText=formatoDinero(p.bajo)
 document.getElementById("precio_medio").innerText=formatoDinero(p.medio)
 document.getElementById("precio_alto").innerText=formatoDinero(p.alto)
 document.getElementById("precio_km").innerText=formatoDinero(p.km)
 try{
  localStorage.setItem("ultimaCotizacion",JSON.stringify({fecha:new Date().toISOString(),costo}))
 }catch(e){}
 return p
}

// Último cálculo, para generar la imagen de costos internos
let ultimoCalculo=null
// Casetas que el usuario desmarcó (falsas o ramales); se reinicia al calcular otra ruta
let ignoradas=new Set() // casetas cuyo estado el usuario invirtió respecto al predeterminado
function alternarCaseta(k){
 if(ignoradas.has(k)) ignoradas.delete(k); else ignoradas.add(k)
 calcularFlete()
}
function filaCaseta(k,html,activa){
 return `<label style="display:block${activa?"":";opacity:.5;text-decoration:line-through"}"><input type="checkbox" style="width:auto;margin:0 6px 0 0"${activa?" checked":""} onchange="alternarCaseta('${k.replace(/'/g,"")}')">${html}</label>`
}

// ---- Ferry (Baja Ferries, tarifas de vehículos de carga con IVA vigentes desde el 15-oct-2026, viaje sencillo) ----
const FERRY_TARIFAS={
 topolobampo:{tractor:11400,thorton:16300,caja137:23150,caja169:25200},
 mazatlan:{tractor:15600,thorton:22300,caja137:29400,caja169:33100}
}
// Menos de 5 ejes: Thorton. 5 y 6 ejes: tractor + 1 caja. 7 o más: tractor + 2 cajas.
// Transcaribe (Punta Venado ↔ Cozumel): tarifa por unidad completa, viaje sencillo (el redondo es el doble).
// Hasta 4 ejes: Torton. 5 y 6 ejes: tráiler según la caja. 7 o más: Full extra largo.
// 53 pies no está en la tabla: se cobra como Tráiler extralargo (nivel 20, hasta 25 m).
const TRANSCARIBE={torton:7500,p40:14150,p45:16030,p48:21000,extralargo:26010,fullExtra:29000}
function costoFerryCozumel(ejes,redondo){
 const t=TRANSCARIBE
 const caja=(document.getElementById("cozumel_caja")||{value:"p45"}).value
 const ivSel=(document.getElementById("ferry_iv")||{checked:true}).checked
 const veces=(ivSel||redondo)?2:1
 let base,partes
 if(ejes<=4){base=t.torton;partes="Torton "+pesos(base)}
 else if(ejes<=6){
  if(caja==="p53"){base=t.extralargo;partes="tráiler extralargo (caja de 53 pies) "+pesos(base)}
  else{base=t[caja]||t.p45;partes="tráiler con caja de "+caja.slice(1)+" pies "+pesos(base)}
 }else{base=t.fullExtra;partes="Full extra largo "+pesos(base)}
 return {monto:base*veces,base,veces,partes,nombre:"Cozumel",
  texto:"Ferry Punta Venado ↔ Cozumel"+(veces===2?" (ida y vuelta)":" (sencillo)")}
}
function costoFerry(info,ejes,redondo){
 if(info.puerto==="cozumel") return costoFerryCozumel(ejes,redondo)
 const t=FERRY_TARIFAS[info.puerto]; if(!t) return null
 const cajaSel=(document.getElementById("ferry_caja")||{value:"caja137"}).value
 const caja=t[cajaSel]||t.caja137
 const ivSel=(document.getElementById("ferry_iv")||{checked:true}).checked
 const veces=(ivSel||redondo)?2:1
 let partes, base
 if(ejes<=4){base=t.thorton;partes="Thorton "+pesos(t.thorton)}
 else if(ejes<=6){base=t.tractor+caja;partes="tractor "+pesos(t.tractor)+" + caja "+pesos(caja)}
 else{base=t.tractor+2*caja;partes="tractor "+pesos(t.tractor)+" + 2 cajas "+pesos(2*caja)}
 return {monto:base*veces,base,veces,partes,nombre:info.nombre,
  texto:"Ferry "+info.nombre+" ↔ La Paz"+(veces===2?" (ida y vuelta)":" (sencillo)")}
}

function precioSeleccionado(){
 const sel=document.getElementById("precio_envio").value
 return document.getElementById("precio_"+sel).innerText
}

function calcularFlete(){

 const km=parseFloat(document.getElementById("km").value)
 const diesel=parseFloat(document.getElementById("diesel").value)
 const rend=parseFloat(document.getElementById("rend").value)
 const ejes=parseInt(document.getElementById("ejes").value,10)
 const adicional=parseFloat(document.getElementById("adicional").value)||0
 const redondo=document.getElementById("redondo").checked
 const f=redondo?2:1 // ida y vuelta: todo se duplica (misma ruta de regreso)

 if(!(km>0)){setEstado("Falta calcular la ruta o escribir los kilómetros");return}
 if(!(rend>0)){setEstado("El rendimiento debe ser mayor a 0");return}
 if(!(diesel>0)){setEstado("Escribe el precio del diésel");return}

 const det=detectarCasetas(ejes)

 let totalTarifa=0, totalEst=0, lista=""
 let nTarifa=0, nEst=0
 let totalCasetas, usoEstimadoPorKm=false

 if(det){
  const montoEst=estimarPlaza(ejes)

  const conOk=[]
  det.con.forEach(c=>{
   const k=c.nombre+"@"+Math.round(c.pos), act=!ignoradas.has(k)
   if(act){totalTarifa+=c.monto*f;conOk.push(c)}
   const extra=(redondo?` <small>(×2 ida y vuelta)</small>`:"")+(c.multi?` <small>(tramo: ${escapar(c.tramo)})</small>`:"")+(c.aprox?` <small>(precio estimado para ${ejes} ejes)</small>`:"")
   lista+=filaCaseta(k,`${escapar(c.nombre)}: ${pesos(c.monto*f)}${extra}`,act)
  })
  det.est.forEach(c=>{
   const k=c.nombre+"@"+Math.round(c.pos), act=!ignoradas.has(k)
   if(act){totalEst+=montoEst*f;nEst++}
   lista+=filaCaseta(k,`<span class="est">${escapar(c.nombre)}: ~${pesos(montoEst*f)} (est., ${escapar(c.motivo)})</span>`,act)
  })
  det.con=conOk
  nTarifa=conOk.length
  totalCasetas=totalTarifa+totalEst
 }else{
  usoEstimadoPorKm=true
  totalCasetas=calcularCasetasEstimadas(km)*f
  lista='<span class="est">Sin ruta calculada: casetas estimadas por km (orientativo).</span><br>'
 }

 const kmTotal=km*f
 const litros=kmTotal/rend
 const dieselCosto=litros*diesel

 const vel=velocidadPromedio(ejes)
 const horas=kmTotal/vel
 const chofer=gastosChofer(horas)

 // Todo esto se suma ANTES de aplicar los porcentajes de Bajo, Medio y Alto
 const ferry=ferryInfo?costoFerry(ferryInfo,ejes,redondo):null
 const costoTotal=dieselCosto+totalCasetas+adicional+chofer.monto+(ferry?ferry.monto:0)

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const tiempo=calcularTiempo(kmTotal,ejes)

 // Aviso: las casetas con tarifa son de abr-2026 (CAPUFE). Solo las estimadas pueden estar desactualizadas.
 let avisoCasetas="", avisoCorto=""
 if(!usoEstimadoPorKm && totalEst>0){
  const sube2=totalEst*AJUSTE_CASETAS_MAX
  avisoCasetas=`⚠ Las casetas marcadas (est.) son aproximadas (no hay tarifa en la base) y pueden costar hasta ${porcentaje(AJUSTE_CASETAS_MAX)}% más: hasta +${pesos(sube2)} (${pesos(totalEst+sube2)} en estimadas). No está sumado al costo total.`
  avisoCorto=`Casetas (est.): pueden costar hasta +${porcentaje(AJUSTE_CASETAS_MAX)}% (+${pesos(sube2)}).`
 }

 const desgloseCasetas=usoEstimadoPorKm
  ? `Casetas (est. por km): ${pesos(totalCasetas)}`
  : `Casetas con tarifa: ${pesos(totalTarifa)} (${nTarifa})<br>`+
    `Casetas estimadas: ${pesos(totalEst)} (${nEst})`

 const html=`
 <h3>RUTA</h3>
 ${escapar(origen)} → ${escapar(destino)}<br>
 Tiempo estimado: ${tiempo} (a ${vel} km/h)<br>

 <h3>COSTO OPERATIVO${redondo?" (IDA Y VUELTA)":""}</h3>
 Km: ${kmTotal}${redondo?` (${km} × 2)`:""}<br>
 Ejes: ${ejes}<br>
 Rendimiento: ${rend} km/L<br>
 Litros: ${litros.toFixed(0)}<br>
 Diesel: ${pesos(dieselCosto)}<br>
 ${desgloseCasetas}<br>
 ${avisoCasetas?`<span class="est">${avisoCasetas}</span><br>`:""}
 ${ferry?`${escapar(ferry.texto)}: ${pesos(ferry.monto)} <small>(${ferry.partes}${ferry.veces===2?" × 2":""})</small><br>`:""}
 Gastos de viaje y chofer: ${pesos(chofer.monto)} (${chofer.bloques} × ${pesos(GASTO_CHOFER_POR_BLOQUE)} por ${HORAS_POR_BLOQUE} h)<br>
 Costo adicional: ${pesos(adicional)}<br>
 <b>Costo total: ${pesos(costoTotal)}</b>

 <h3>CASETAS EN RUTA</h3>
 ${det&&(det.con.length||nEst||ignoradas.size)?"<small>Desmarca las que no correspondan a tu ruta y el total se recalcula.</small><br>":""}
 ${lista||"No se detectaron casetas en la ruta.<br>"}
 <small>Tarifas CAPUFE (FONADIN y Fideicomiso 358) vigentes desde abr-2026 para camión de ${ejes} ejes; pueden haber subido. Las marcadas (est.) son aproximadas.</small>
 `

 document.getElementById("resultado").innerHTML=html
 setEstado(usoEstimadoPorKm?"Calculado sin ruta (casetas por km)":`Casetas detectadas: ${nTarifa} con tarifa, ${nEst} estimadas`)
 // Con ferry, el precio «Por km» suma el costo del ferry más 30% de ese costo
 const precios=calcularPrecios(costoTotal,kmTotal,ferry?ferry.monto*1.3:0)

 ultimoCalculo={
  origen,destino,km:kmTotal,kmIda:km,redondo,ejes,vel,tiempo,rend,litros,dieselCosto,
  casetasTarifa:det?det.con.map(c=>({nombre:c.nombre+(redondo?" (×2)":""),monto:c.monto*f})):[],
  ruta:currentRoute,
  casetasMapa:det?det.con.map(c=>{const p=currentRoute[Math.min(currentRoute.length-1,Math.round(c.pos))];return {lon:p[0],lat:p[1]}}):[],
  totalTarifa,nTarifa,totalEst,nEst,
  usoEstimadoPorKm,totalCasetasKm:usoEstimadoPorKm?totalCasetas:0,
  chofer,adicional,costoTotal,precios,avisoCorto,ferry
 }


}

function cargarLogo(){
 return new Promise(res=>{
  const logo=new Image()
  logo.onload=()=>res(logo)
  logo.onerror=()=>res(null) // si el logo no carga, la imagen sale igual
  logo.src="logo.png"
 })
}

// Mapa para las imágenes: null si no hay ruta calculada o si algo falla (la imagen sale igual, sin mapa)
async function mapaParaImagen(ruta,w,h,casetas){
 try{
  if(typeof crearMapaCanvas!=="function") return null
  return await crearMapaCanvas(ruta,w,h,casetas)
 }catch(e){return null}
}

async function generarImagen(){

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const km=ultimoCalculo?String(ultimoCalculo.km):document.getElementById("km").value
 if(!km){setEstado("Primero calcula el flete");return}
 const redondoImg=document.getElementById("redondo").checked
 const ruta=origen+(redondoImg?" ↔ ":" → ")+destino+(redondoImg?" (ida y vuelta)":"")
 const precio=precioSeleccionado()
 guardarCotizacion(false) // lo que se envía al cliente queda en el historial

 setEstado("Generando imagen…")
 const HM=380
 const [logo,mapa]=await Promise.all([cargarLogo(),mapaParaImagen(currentRoute,740,HM,null)])
 const alto=mapa?520+HM+30:520

 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=alto
 const ctx=canvas.getContext("2d")

 ctx.fillStyle="#ffffff"
 ctx.fillRect(0,0,800,alto)

 if(logo) ctx.drawImage(logo,330,20,140,140)

 ctx.fillStyle="#000"
 ctx.font="32px Arial"
 ctx.fillText("Transporte D’Leon",240,200)

 ctx.font="24px Arial"
 ctx.fillText("Ruta:",100,280)
 ctx.fillText(ruta,100,310,600)

 ctx.fillText("Distancia:",100,350)
 ctx.fillText(km+" km",100,380)

 ctx.fillText("Precio:",100,430)
 ctx.fillText(precio,100,460)

 if(mapa) ctx.drawImage(mapa,30,500)

 setEstado("Imagen lista")
 entregarImagen(canvas)
}

// Imagen con el desglose de costos y precios sugeridos (uso interno, no para el cliente)
async function generarImagenCostos(){

 const c=ultimoCalculo
 if(!c){setEstado("Primero calcula el flete");return}

 setEstado("Generando imagen…")
 const HM=360
 const [logo,mapa]=await Promise.all([cargarLogo(),mapaParaImagen(c.ruta,740,HM,c.casetasMapa)])

 // Filas: [etiqueta, monto] normales; {t:"..."} encabezado de sección; {n:"..."} nota
 const filas=[
  {t:"COSTO OPERATIVO"},
  ["Diésel ("+c.litros.toFixed(0)+" L a "+c.rend+" km/L)",pesos(c.dieselCosto)]
 ]
 if(c.usoEstimadoPorKm){
  filas.push(["Casetas (est. por km)",pesos(c.totalCasetasKm)])
 }else{
  if(!c.casetasTarifa.length) filas.push(["Casetas con tarifa","$0"])
  c.casetasTarifa.forEach((x,i)=>filas.push([(mapa?(i+1)+". ":"")+x.nombre,pesos(x.monto)]))
  filas.push(["Casetas estimadas ("+c.nEst+")",pesos(c.totalEst)])
 }
 if(c.ferry) filas.push([c.ferry.texto+" · "+c.ferry.partes+(c.ferry.veces===2?" × 2":""),pesos(c.ferry.monto)])
 filas.push(["Gastos de viaje y chofer ("+c.chofer.bloques+" × "+pesos(GASTO_CHOFER_POR_BLOQUE)+")",pesos(c.chofer.monto)])
 if(c.adicional) filas.push(["Costo adicional",pesos(c.adicional)])
 filas.push(["COSTO TOTAL",pesos(c.costoTotal),true])
 filas.push({t:"PRECIOS SUGERIDOS"})
 filas.push(["Bajo (+15%)",formatoDinero(c.precios.bajo)])
 filas.push(["Medio (+30%)",formatoDinero(c.precios.medio)])
 filas.push(["Alto (+45%)",formatoDinero(c.precios.alto)])
 filas.push([c.ferry?"Por km + ferry (ferry +30%)":"Por km",formatoDinero(c.precios.km)])

 const dMapa=mapa?HM+20:0
 const alto=Math.max(520,280+filas.length*34+60)+(c.avisoCorto?26:0)+dMapa
 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=alto
 const ctx=canvas.getContext("2d")

 ctx.fillStyle="#ffffff"
 ctx.fillRect(0,0,800,alto)

 // Encabezado con logo
 if(logo) ctx.drawImage(logo,30,12,96,96)
 const xTitulo=logo?145:30
 ctx.fillStyle="#0b1f3a"
 ctx.font="bold 30px Arial"
 ctx.fillText("Transporte D’Leon",xTitulo,58)
 ctx.fillStyle="#555"
 ctx.font="20px Arial"
 ctx.fillText("Costos del flete (uso interno)",xTitulo,90)
 ctx.fillStyle="#0b1f3a"
 ctx.fillRect(0,118,800,5)

 ctx.fillStyle="#000"
 ctx.font="22px Arial"
 ctx.fillText(c.origen+(c.redondo?" ↔ ":" → ")+c.destino+(c.redondo?" (ida y vuelta)":""),30,162,740)
 ctx.font="20px Arial"
 ctx.fillText(c.km+" km · "+c.ejes+" ejes · "+c.tiempo+" a "+c.vel+" km/h",30,194,740)

 if(mapa) ctx.drawImage(mapa,30,210)

 let y=240+dMapa
 filas.forEach(f=>{
  if(f.t){
   y+=10
   ctx.fillStyle="#0b1f3a"
   ctx.font="bold 22px Arial"
   ctx.fillText(f.t,30,y)
   ctx.fillRect(30,y+6,740,2)
   y+=34
   return
  }
  ctx.fillStyle="#000"
  ctx.font=(f[2]?"bold ":"")+"21px Arial"
  ctx.textAlign="left"
  ctx.fillText(f[0],30,y,560)
  ctx.textAlign="right"
  ctx.fillText(f[1],770,y)
  ctx.textAlign="left"
  y+=34
 })

 ctx.fillStyle="#666"
 ctx.font="15px Arial"
 if(c.avisoCorto) ctx.fillText(c.avisoCorto,30,alto-46,740)
 ctx.fillText("Tarifas CAPUFE abr-2026 (camión de "+c.ejes+" ejes). Las estimadas son aproximadas.",30,alto-20,740)

 setEstado("Imagen lista")
 entregarImagen(canvas,"costos.jpg","Costos del flete")
}

function entregarImagen(canvas,nombre="cotizacion.jpg",titulo="Cotización"){
 canvas.toBlob(async blob=>{
  if(!blob){setEstado("No se pudo generar la imagen");return}
  const file=new File([blob],nombre,{type:"image/jpeg"})
  try{
   if(navigator.canShare&&navigator.canShare({files:[file]})){
    await navigator.share({files:[file],title:titulo})
    return
   }
  }catch(e){
   if(e&&e.name==="AbortError") return
  }
  const a=document.createElement("a")
  a.href=URL.createObjectURL(blob)
  a.download=nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(()=>URL.revokeObjectURL(a.href),5000)
 },"image/jpeg",0.92)
}

function borrar(){
 ignoradas=new Set()
 document.getElementById("origen").value=""
 document.getElementById("destino").value=""
 document.getElementById("via").value=""
 document.getElementById("km").value=""
 document.getElementById("adicional").value="0"
 document.getElementById("cliente").value=""
 document.getElementById("redondo").checked=false
 ferryInfo=null
 if(typeof mostrarFerry==="function") mostrarFerry(false)
 document.getElementById("resultado").innerHTML=""
 ultimoCalculo=null
 limpiarRuta()
 setEstado("Sistema listo")
}

// ---- Historial de cotizaciones (se guarda solo en este teléfono) ----
const HISTORIAL_MAX=50
function leerHistorial(){
 try{return JSON.parse(localStorage.getItem("historial")||"[]").filter(x=>x&&typeof x==="object"&&x.id)}catch(e){return []}
}
function escribirHistorial(h){
 try{localStorage.setItem("historial",JSON.stringify(h.slice(0,HISTORIAL_MAX)))}catch(e){}
}
// manual=true: avisa en pantalla. La imagen para el cliente guarda sola (sin duplicar si es la misma cotización).
function guardarCotizacion(manual){
 const c=ultimoCalculo
 if(!c){if(manual) setEstado("Primero calcula el flete");return}
 const sel=document.getElementById("precio_envio").value
 const reg={
  id:Date.now(),fecha:new Date().toISOString(),
  cliente:document.getElementById("cliente").value.trim(),
  origen:c.origen,destino:c.destino,via:document.getElementById("via").value.trim(),
  km:c.kmIda,ejes:c.ejes,redondo:c.redondo,rend:c.rend,
  diesel:parseFloat(document.getElementById("diesel").value)||0,
  adicional:c.adicional,costo:Math.round(c.costoTotal),
  tipo:sel,precio:precioSeleccionado(),
  ferry:ferryInfo?ferryInfo.puerto:"",ferryCaja:(document.getElementById("ferry_caja")||{}).value||"",cozumelCaja:(document.getElementById("cozumel_caja")||{}).value||"",ferryIv:(document.getElementById("ferry_iv")||{checked:true}).checked
 }
 const h=leerHistorial()
 const igual=h.findIndex(x=>x.origen===reg.origen&&x.destino===reg.destino&&x.via===reg.via&&x.km===reg.km&&x.redondo===reg.redondo&&x.ejes===reg.ejes&&x.tipo===reg.tipo&&x.precio===reg.precio&&x.cliente===reg.cliente&&x.diesel===reg.diesel&&x.adicional===reg.adicional&&(x.ferry||"")===reg.ferry&&(x.ferryCaja||"")===reg.ferryCaja&&(x.cozumelCaja||"")===reg.cozumelCaja&&x.ferryIv===reg.ferryIv)
 if(igual>=0){
  if(manual) setEstado("Esta cotización ya está en el historial")
  return
 }
 h.unshift(reg)
 escribirHistorial(h)
 mostrarHistorial()
 if(manual) setEstado("Cotización guardada en el historial")
}
function mostrarHistorial(){
 const cont=document.getElementById("historial")
 if(!cont) return
 const h=leerHistorial()
 if(!h.length){cont.innerHTML='<small>Aún no hay cotizaciones guardadas. Se guardan al generar la imagen para el cliente o con «Guardar en historial».</small>';return}
 const nombres={bajo:"Bajo",medio:"Medio",alto:"Alto",km:"Por km"}
 cont.innerHTML=h.map(x=>{
  const f=new Date(x.fecha)
  const fecha=isNaN(f)?"":f.toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"})
  return `<div style="background:white;border-radius:8px;padding:10px;margin:8px 0;line-height:1.4">
   <b>${escapar(x.origen)} ${x.redondo?"↔":"→"} ${escapar(x.destino)}</b>${x.redondo?" <small>(ida y vuelta)</small>":""}${x.ferry?" <small>(ferry "+(x.ferry==="mazatlan"?"Mazatlán":(x.ferry==="cozumel"?"Cozumel":"Topolobampo"))+")</small>":""}<br>
   <small>${fecha}${x.cliente?" · "+escapar(x.cliente):""} · ${escapar(x.km||"")} km${x.redondo?" × 2":""} · ${x.ejes} ejes</small><br>
   Enviado (${nombres[x.tipo]||""}): <b>${escapar(x.precio||"")}</b> <small>· costo ${pesos(x.costo||0)}</small>
   <div style="display:flex;gap:8px"><button style="margin:6px 0 0" onclick="abrirCotizacion(${x.id})">Abrir</button><button class="sec" style="margin:6px 0 0" onclick="borrarCotizacion(${x.id})">Borrar</button></div>
  </div>`
 }).join("")+'<button class="sec" onclick="borrarHistorial()">Borrar todo el historial</button>'
}
// Vuelve a cargar los datos de una cotización y recalcula (la ruta y las tarifas se calculan de nuevo con los datos de hoy)
async function abrirCotizacion(id){
 const x=leerHistorial().find(r=>r.id===id)
 if(!x) return
 const set=(i,v)=>{document.getElementById(i).value=v}
 set("origen",x.origen);set("destino",x.destino);set("via",x.via||"");set("ejes",x.ejes)
 set("rend",x.rend);set("diesel",x.diesel||29);set("adicional",x.adicional||0);set("cliente",x.cliente||"")
 document.getElementById("redondo").checked=!!x.redondo
 set("precio_envio",x.tipo||"medio")
 set("ferry_puerto",(x.ferry==="topolobampo"||x.ferry==="mazatlan")?x.ferry:"");set("ferry_caja",x.ferryCaja||"caja137");set("cozumel_caja",x.cozumelCaja||"p45");document.getElementById("ferry_iv").checked=x.ferryIv!==false
 window.scrollTo({top:0,behavior:"smooth"})
 await calcularRuta()
 if(document.getElementById("km").value) calcularFlete()
}
function borrarCotizacion(id){
 escribirHistorial(leerHistorial().filter(r=>r.id!==id))
 mostrarHistorial()
}
function borrarHistorial(){
 if(!confirm("¿Borrar todo el historial de cotizaciones?")) return
 escribirHistorial([])
 mostrarHistorial()
}

window.onload=()=>{initMap();mostrarHistorial()}
