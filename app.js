
function formatoDinero(v){
 return "$"+Math.ceil(v/100)*100 .toLocaleString ? "$"+(Math.ceil(v/100)*100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}) : "$"+Math.ceil(v/100)*100;
}

function calcularPrecios(costo){
 const bajo=costo*1.15
 const medio=costo*1.30
 const alto=costo*1.45
 document.getElementById("precio_bajo").innerText=formatoDinero(bajo)
 document.getElementById("precio_medio").innerText=formatoDinero(medio)
 document.getElementById("precio_alto").innerText=formatoDinero(alto)
 localStorage.setItem("ultimaCotizacion",JSON.stringify({fecha:new Date().toISOString(),costo}))
}


function generarImagen(){

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const ruta=origen+" → "+destino
 const precio=document.getElementById("precio_medio").innerText

 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=500
 const ctx=canvas.getContext("2d")

 ctx.fillStyle="#ffffff"
 ctx.fillRect(0,0,800,500)

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

 ctx.fillText("Precio:",100,360)
 ctx.fillText(precio,100,390)

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

 const casetas=detectarCasetas()

 let totalCasetas=0
 let lista=""

 casetas.forEach(c=>{

 const precio=TARIFAS[c]?.[ejes]||0
 totalCasetas+=precio
 lista+=c+" "+formatoDinero(precio)+"<br>"

 })

 const litros=km/rend
 const dieselCosto=litros*diesel
 const costoTotal=dieselCosto+totalCasetas

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
 calcularPrecios(costoTotal)

}

function borrar(){

 document.getElementById("origen").value=""
 document.getElementById("destino").value=""
 document.getElementById("km").value=""
 document.getElementById("resultado").innerHTML=""
 setEstado("Sistema listo")

}
