function escapar(s){
 return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}

function precioPorKm(km){
 let tarifa=22
 if(km>300) tarifa=32
 if(km>700) tarifa=38
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

function calcularTiempo(km){
 const h=km/60
 const red=Math.ceil(h*2)/2
 const horas=Math.floor(red)
 const mins=(red-horas)*60
 return horas+" h"+(mins?" 30 min":"")
}

function setEstado(t){
 document.getElementById("estado").innerText=t
}

function calcularPrecios(costo,km){
 document.getElementById("precio_bajo").innerText=formatoDinero(costo*1.15)
 document.getElementById("precio_medio").innerText=formatoDinero(costo*1.30)
 document.getElementById("precio_alto").innerText=formatoDinero(costo*1.45)
 document.getElementById("precio_km").innerText=formatoDinero(precioPorKm(km))
 try{
  localStorage.setItem("ultimaCotizacion",JSON.stringify({fecha:new Date().toISOString(),costo}))
 }catch(e){}
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
 const costoTotal=dieselCosto+totalCasetas+adicional

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const tiempo=calcularTiempo(km)

 const desgloseCasetas=usoEstimadoPorKm
  ? `Casetas (est. por km): ${pesos(totalCasetas)}`
  : `Casetas con tarifa: ${pesos(totalTarifa)} (${nTarifa})<br>`+
    `Casetas estimadas: ${pesos(totalEst)} (${nEst})`

 const html=`
 <h3>RUTA</h3>
 ${escapar(origen)} → ${escapar(destino)}<br>
 Tiempo estimado: ${tiempo}<br>

 <h3>COSTO OPERATIVO</h3>
 Km: ${km}<br>
 Ejes: ${ejes}<br>
 Rendimiento: ${rend} km/L<br>
 Litros: ${litros.toFixed(0)}<br>
 Diesel: ${pesos(dieselCosto)}<br>
 ${desgloseCasetas}<br>
 Costo adicional: ${pesos(adicional)}<br>
 <b>Costo total: ${pesos(costoTotal)}</b>

 <h3>CASETAS EN RUTA</h3>
 ${lista||"No se detectaron casetas en la ruta.<br>"}
 <small>Tarifas de la red FONADIN vigentes a ene-2025 para camión de ${ejes} ejes; pueden haber subido. Las marcadas (est.) son aproximadas.</small>
 `

 document.getElementById("resultado").innerHTML=html
 setEstado(usoEstimadoPorKm?"Calculado sin ruta (casetas por km)":`Casetas detectadas: ${nTarifa} con tarifa, ${nEst} estimadas`)
 calcularPrecios(costoTotal,km)
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

function entregarImagen(canvas){
 canvas.toBlob(async blob=>{
  if(!blob){setEstado("No se pudo generar la imagen");return}
  const file=new File([blob],"cotizacion.jpg",{type:"image/jpeg"})
  try{
   if(navigator.canShare&&navigator.canShare({files:[file]})){
    await navigator.share({files:[file],title:"Cotización"})
    return
   }
  }catch(e){
   if(e&&e.name==="AbortError") return
  }
  const a=document.createElement("a")
  a.href=URL.createObjectURL(blob)
  a.download="cotizacion.jpg"
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
