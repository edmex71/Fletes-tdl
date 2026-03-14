
function redondear100(n){
 return Math.ceil(n/100)*100
}

function formatoDinero(n){
 const v=redondear100(n)
 return "$"+v.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})
}

function calcularTiempo(km){
 const h=km/60
 const red=Math.ceil(h*2)/2
 const horas=Math.floor(red)
 const mins=(red-horas)*60
 return horas+" h "+(mins? "30 min":"")
}

function calcularPrecios(costo,km){

 const bajo=redondear100(costo*1.15)
 const medio=redondear100(costo*1.30)
 const alto=redondear100(costo*1.45)

 document.getElementById("precio_bajo").innerText=formatoDinero(bajo)
 document.getElementById("precio_medio").innerText=formatoDinero(medio)
 document.getElementById("precio_alto").innerText=formatoDinero(alto)

 let tarifa=22
 if(km>300) tarifa=32
 if(km>700) tarifa=38

 const precioKm=redondear100(km*tarifa)
 document.getElementById("precio_km").innerText=formatoDinero(precioKm)
}

function generarImagen(){

 const origen=document.getElementById("origen").value
 const destino=document.getElementById("destino").value
 const km=document.getElementById("km").value

 const precioSel=document.querySelector('input[name="precio"]:checked')
 if(!precioSel){
  alert("Selecciona un precio")
  return
 }

 const valor=document.getElementById("precio_"+precioSel.value).innerText

 const canvas=document.createElement("canvas")
 canvas.width=800
 canvas.height=600
 const ctx=canvas.getContext("2d")

 ctx.fillStyle="#ffffff"
 ctx.fillRect(0,0,800,600)

 const logo=new Image()
 logo.src="logo.png"

 logo.onload=function(){

 ctx.drawImage(logo,300,40,200,200)

 ctx.fillStyle="#000"
 ctx.font="30px Arial"
 ctx.fillText("Transporte D’Leon",240,300)

 ctx.font="24px Arial"
 ctx.fillText("Ruta:",100,380)
 ctx.fillText(origen+" → "+destino,100,410)

 ctx.fillText("Distancia:",100,460)
 ctx.fillText(km+" km",100,490)

 ctx.fillText("Precio:",100,540)
 ctx.fillText(valor,100,570)

 const img=canvas.toDataURL("image/jpeg")
 const a=document.createElement("a")
 a.href=img
 a.download="cotizacion.jpg"
 a.click()
 }
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
 calcularPrecios(costoTotal,km)
 document.getElementById("estado").innerText="Casetas detectadas "+casetas.length
}

function borrar(){
 document.getElementById("origen").value=""
 document.getElementById("destino").value=""
 document.getElementById("km").value=""
 document.getElementById("resultado").innerHTML=""
 document.getElementById("estado").innerText="Sistema listo"
}
