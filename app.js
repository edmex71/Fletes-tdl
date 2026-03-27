
function precioPorKm(km){
 let tarifa=22
 if(km>300) tarifa=32
 if(km>700) tarifa=38
 return Math.ceil((km*tarifa)/100)*100
}


function filtrarCasetas(lista,ejes){
 const unicas={}
 lista.forEach(c=>{
  const precio=TARIFAS[c]?.[ejes]||0
  if(precio>0 && !c.includes("KM")){
   unicas[c]=precio
  }
 })
 return Object.keys(unicas)
}


function formatoDinero(v){
 return "$"+Math.ceil(v/100)*100 .toLocaleString ? "$"+(Math.ceil(v/100)*100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}) : "$"+Math.ceil(v/100)*100;
}

function calcularPrecios(costo,km){
 const bajo=costo*1.15
 const medio=costo*1.30
 const alto=costo*1.45
 document.getElementById("precio_bajo").innerText=formatoDinero(bajo)
 document.getElementById("precio_medio").innerText=formatoDinero(medio)
 
document.getElementById("precio_alto").innerText=formatoDinero(alto)
document.getElementById("precio_km").innerText=formatoDinero(precioPorKm(km))

 localStorage.setItem("ultimaCotizacion",JSON.stringify({fecha:new Date().toISOString(),costo}))
}



function generarImagen(){

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const ruta=origen+" → "+destino
 const km=document.getElementById("km").value

 const precioSel=document.getElementById("precio_envio").value
 
let precio=""

if(precioSel==="bajo") precio=document.getElementById("precio_bajo").innerText
if(precioSel==="medio") precio=document.getElementById("precio_medio").innerText
if(precioSel==="alto") precio=document.getElementById("precio_alto").innerText
if(precioSel==="km") precio=document.getElementById("precio_km").innerText


 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=520
 const ctx=canvas.getContext("2d")

 ctx.fillStyle="#ffffff"
 ctx.fillRect(0,0,800,520)

 const logo=new Image()
 logo.src="logo.png"

 logo.onload=function(){

 ctx.drawImage(logo,330,20,140,140)

 ctx.fillStyle="#000"
 ctx.font="32px Arial"
 ctx.fillText("Transporte D’Leon",240,200)

 ctx.font="24px Arial"
 ctx.fillText("Ruta:",100,280)
 ctx.fillText(ruta,100,310)

 ctx.fillText("Distancia:",100,350)
 ctx.fillText(km+" km",100,380)

 ctx.fillText("Precio:",100,430)
 ctx.fillText(precio,100,460)

 const img=canvas.toDataURL("image/jpeg")
 const a=document.createElement("a")
 a.href=img
 a.download="cotizacion.jpg"
 a.click()

 }
}




function formatoDinero(n){
 const v=Math.ceil(n/100)*100
 return "$"+v.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})
}

function calcularTiempo(km){
 const h=km/60
 const red=Math.ceil(h*2)/2
 const horas=Math.floor(red)
 const mins=(red-horas)*60
 return horas+" h "+(mins? "30 min":"")
}

window.onload=()=>initMap()

function setEstado(t){
 document.getElementById("estado").innerText=t
}

function calcularFlete(){

 const km=parseFloat(document.getElementById("km").value)
 const diesel=parseFloat(document.getElementById("diesel").value)
 const rend=parseFloat(document.getElementById("rend").value)
 const ejes=document.getElementById("ejes").value

 let casetas=detectarCasetas(); casetas=filtrarCasetas(casetas,ejes)

 let totalCasetas=0
 let lista=""

 casetas.forEach(c=>{

 const precio=TARIFAS[c]?.[ejes]||0
 totalCasetas+=precio
 lista+=c+" "+formatoDinero(precio)+"<br>"

 })

 const litros=km/rend
 const dieselCosto=litros*diesel
 const extra=parseFloat(document.getElementById('extra')?.value||0)
const costoTotal = dieselCosto + totalCasetas + extra

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const tiempo=calcularTiempo(km)

 const html=`
 <h3>COSTO OPERATIVO</h3>
 Ruta: ${origen} → ${destino}<br>
 Tiempo estimado: ${tiempo}<br><br>

 <h3>COSTO OPERATIVO</h3>
 Km: ${km}<br>
 Rendimiento: ${rend} km/L<br>
 Litros: ${litros.toFixed(0)}<br>
 Diesel: ${formatoDinero(dieselCosto)}<br>
 Casetas: ${formatoDinero(totalCasetas)}<br><br>
 <b>Casetas</b><br>
 ${lista}
 `

 document.getElementById("resultado").innerHTML=html
 setEstado("Casetas detectadas "+casetas.length)
 calcularPrecios(costoTotal,km)

}

function borrar(){

 document.getElementById("origen").value=""
 document.getElementById("destino").value=""
 document.getElementById("km").value=""
 document.getElementById("resultado").innerHTML=""
 setEstado("Sistema listo")

}

function guardarHistorial(origen,destino,precio){
 let h=JSON.parse(localStorage.getItem("historial")||"[]")
 h.unshift({fecha:new Date().toISOString(),origen,destino,precio})
 h=h.slice(0,10)
 localStorage.setItem("historial",JSON.stringify(h))
}


function estimarCasetas(km){

 let factor = 2.3

 if(km>250) factor = 2.5
 if(km>600) factor = 2.8
 if(km>900) factor = 3.1
 if(km>1200) factor = 3.4

 return km * factor

}
