
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

}

function borrar(){

 document.getElementById("origen").value=""
 document.getElementById("destino").value=""
 document.getElementById("km").value=""
 document.getElementById("resultado").innerHTML=""
 setEstado("Sistema listo")

}
