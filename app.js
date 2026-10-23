function escapar(s){
 return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}

// ---- Parámetros que se pueden ajustar ----
const GASTO_CHOFER_POR_BLOQUE=1800 // gastos de viaje y chofer por cada bloque de horas
const HORAS_POR_BLOQUE=12          // cada bloque, completo o iniciado, cuesta GASTO_CHOFER_POR_BLOQUE

// Las tarifas de casetas son de ene-2025. En 2026 subieron entre 4.7 % y 9 %.
// Solo se muestra como aviso; NO se suma al costo hasta tener una base actualizada.
const AJUSTE_CASETAS_MIN=0.047
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

function calcularPrecios(costo,km){
 const p={
  bajo:Math.ceil(costo*1.15/100)*100,
  medio:Math.ceil(costo*1.30/100)*100,
  alto:Math.ceil(costo*1.45/100)*100,
  km:precioPorKm(km)
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

 if(!(km>0)){setEstado("Falta calcular la ruta o escribir los kilómetros");return}
 if(!(rend>0)){setEstado("El rendimiento debe ser mayor a 0");return}
 if(!(diesel>0)){setEstado("Escribe el precio del diésel");return}

 const det=detectarCasetas(ejes)

 let totalTarifa=0, totalEst=0, lista=""
 let nTarifa=0, nEst=0
 let totalCasetas, usoEstimadoPorKm=false

 if(det){
  const montoEst=estimarPlaza(ejes)

  det.con.forEach(c=>{
   totalTarifa+=c.monto
   const extra=c.multi?` <small>(tramo: ${escapar(c.tramo)})</small>`:""
   lista+=`${escapar(c.nombre)}: ${pesos(c.monto)}${extra}<br>`
  })
  det.est.forEach(c=>{
   totalEst+=montoEst
   lista+=`<span class="est">${escapar(c.nombre)}: ~${pesos(montoEst)} (est., ${escapar(c.motivo)})</span><br>`
  })
  nTarifa=det.con.length
  nEst=det.est.length
  totalCasetas=totalTarifa+totalEst
 }else{
  usoEstimadoPorKm=true
  totalCasetas=calcularCasetasEstimadas(km)
  lista='<span class="est">Sin ruta calculada: casetas estimadas por km (orientativo).</span><br>'
 }

 const litros=km/rend
 const dieselCosto=litros*diesel

 const vel=velocidadPromedio(ejes)
 const horas=km/vel
 const chofer=gastosChofer(horas)

 // Todo esto se suma ANTES de aplicar los porcentajes de Bajo, Medio y Alto
 const costoTotal=dieselCosto+totalCasetas+adicional+chofer.monto

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const tiempo=calcularTiempo(km,ejes)

 // Aviso: cuánto representaría el aumento de 2026 sobre las casetas que salen de la base ene-2025
 let avisoCasetas="", avisoCorto=""
 const baseCasetas=totalTarifa+totalEst
 if(!usoEstimadoPorKm && baseCasetas>0){
  const sube1=baseCasetas*AJUSTE_CASETAS_MIN
  const sube2=baseCasetas*AJUSTE_CASETAS_MAX
  avisoCasetas=`⚠ Las tarifas de casetas son de ene-2025 y en 2026 subieron entre ${porcentaje(AJUSTE_CASETAS_MIN)}% y ${porcentaje(AJUSTE_CASETAS_MAX)}%: `+
   `pueden costar de +${pesos(sube1)} hasta +${pesos(sube2)} más (hasta ${pesos(baseCasetas+sube2)} en casetas). No está sumado al costo total.`
  avisoCorto=`Casetas: en 2026 pueden costar de +${porcentaje(AJUSTE_CASETAS_MIN)}% a +${porcentaje(AJUSTE_CASETAS_MAX)}% (+${pesos(sube1)} a +${pesos(sube2)}) sobre tarifas ene-2025.`
 }

 const desgloseCasetas=usoEstimadoPorKm
  ? `Casetas (est. por km): ${pesos(totalCasetas)}`
  : `Casetas con tarifa: ${pesos(totalTarifa)} (${nTarifa})<br>`+
    `Casetas estimadas: ${pesos(totalEst)} (${nEst})`

 const html=`
 <h3>RUTA</h3>
 ${escapar(origen)} → ${escapar(destino)}<br>
 Tiempo estimado: ${tiempo} (a ${vel} km/h)<br>

 <h3>COSTO OPERATIVO</h3>
 Km: ${km}<br>
 Ejes: ${ejes}<br>
 Rendimiento: ${rend} km/L<br>
 Litros: ${litros.toFixed(0)}<br>
 Diesel: ${pesos(dieselCosto)}<br>
 ${desgloseCasetas}<br>
 ${avisoCasetas?`<span class="est">${avisoCasetas}</span><br>`:""}
 Gastos de viaje y chofer: ${pesos(chofer.monto)} (${chofer.bloques} × ${pesos(GASTO_CHOFER_POR_BLOQUE)} por ${HORAS_POR_BLOQUE} h)<br>
 Costo adicional: ${pesos(adicional)}<br>
 <b>Costo total: ${pesos(costoTotal)}</b>

 <h3>CASETAS EN RUTA</h3>
 ${lista||"No se detectaron casetas en la ruta.<br>"}
 <small>Tarifas de la red FONADIN vigentes a ene-2025 para camión de ${ejes} ejes; pueden haber subido. Las marcadas (est.) son aproximadas.</small>
 `

 document.getElementById("resultado").innerHTML=html
 setEstado(usoEstimadoPorKm?"Calculado sin ruta (casetas por km)":`Casetas detectadas: ${nTarifa} con tarifa, ${nEst} estimadas`)
 const precios=calcularPrecios(costoTotal,km)

 ultimoCalculo={
  origen,destino,km,ejes,vel,tiempo,rend,litros,dieselCosto,
  casetasTarifa:det?det.con.map(c=>({nombre:c.nombre,monto:c.monto})):[],
  totalTarifa,nTarifa,totalEst,nEst,
  usoEstimadoPorKm,totalCasetasKm:usoEstimadoPorKm?totalCasetas:0,
  chofer,adicional,costoTotal,precios,avisoCorto
 }

 guardarHistorial(origen,destino,precioSeleccionado())

}

function generarImagen(){

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const km=document.getElementById("km").value
 if(!km){setEstado("Primero calcula el flete");return}
 const ruta=origen+" → "+destino
 const precio=precioSeleccionado()

 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=520
 const ctx=canvas.getContext("2d")

 function dibujar(logo){

  ctx.fillStyle="#ffffff"
  ctx.fillRect(0,0,800,520)

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

  entregarImagen(canvas)
 }

 const logo=new Image()
 logo.onload=()=>dibujar(logo)
 logo.onerror=()=>dibujar(null)
 logo.src="logo.png"
}

// Imagen con el desglose de costos y precios sugeridos (uso interno, no para el cliente)
function generarImagenCostos(){

 const c=ultimoCalculo
 if(!c){setEstado("Primero calcula el flete");return}

 // Filas: [etiqueta, monto] normales; {t:"..."} encabezado de sección; {n:"..."} nota
 const filas=[
  {t:"COSTO OPERATIVO"},
  ["Diésel ("+c.litros.toFixed(0)+" L a "+c.rend+" km/L)",pesos(c.dieselCosto)]
 ]
 if(c.usoEstimadoPorKm){
  filas.push(["Casetas (est. por km)",pesos(c.totalCasetasKm)])
 }else{
  if(!c.casetasTarifa.length) filas.push(["Casetas con tarifa","$0"])
  c.casetasTarifa.forEach(x=>filas.push([x.nombre,pesos(x.monto)]))
  filas.push(["Casetas estimadas ("+c.nEst+")",pesos(c.totalEst)])
 }
 filas.push(["Gastos de viaje y chofer ("+c.chofer.bloques+" × "+pesos(GASTO_CHOFER_POR_BLOQUE)+")",pesos(c.chofer.monto)])
 if(c.adicional) filas.push(["Costo adicional",pesos(c.adicional)])
 filas.push(["COSTO TOTAL",pesos(c.costoTotal),true])
 filas.push({t:"PRECIOS SUGERIDOS"})
 filas.push(["Bajo (+15%)",formatoDinero(c.precios.bajo)])
 filas.push(["Medio (+30%)",formatoDinero(c.precios.medio)])
 filas.push(["Alto (+45%)",formatoDinero(c.precios.alto)])
 filas.push(["Por km",formatoDinero(c.precios.km)])

 const alto=Math.max(520,230+filas.length*34+60)+(c.avisoCorto?26:0)
 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=alto
 const ctx=canvas.getContext("2d")

 ctx.fillStyle="#ffffff"
 ctx.fillRect(0,0,800,alto)
 ctx.fillStyle="#0b1f3a"
 ctx.fillRect(0,0,800,70)
 ctx.fillStyle="#fff"
 ctx.font="bold 28px Arial"
 ctx.fillText("Transporte D’Leon – Costos (uso interno)",30,45)

 ctx.fillStyle="#000"
 ctx.font="22px Arial"
 ctx.fillText(c.origen+" → "+c.destino,30,110,740)
 ctx.font="20px Arial"
 ctx.fillText(c.km+" km · "+c.ejes+" ejes · "+c.tiempo+" a "+c.vel+" km/h",30,142,740)

 let y=190
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
 ctx.fillText("Tarifas red FONADIN ene-2025 (camión de "+c.ejes+" ejes). Las estimadas son aproximadas.",30,alto-20,740)

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
 document.getElementById("origen").value=""
 document.getElementById("destino").value=""
 document.getElementById("km").value=""
 document.getElementById("adicional").value="0"
 document.getElementById("resultado").innerHTML=""
 ultimoCalculo=null
 limpiarRuta()
 setEstado("Sistema listo")
}

function guardarHistorial(origen,destino,precio){
 try{
  let h=JSON.parse(localStorage.getItem("historial")||"[]")
  h.unshift({fecha:new Date().toISOString(),origen,destino,precio})
  h=h.slice(0,10)
  localStorage.setItem("historial",JSON.stringify(h))
 }catch(e){}
}

window.onload=()=>initMap()
