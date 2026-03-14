
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
 lista+=c+" $"+precio+"<br>"

 })

 const litros=km/rend
 const dieselCosto=litros*diesel

 const html=`
 <h3>COSTO OPERATIVO</h3>
 Km: ${km}<br>
 Rendimiento: ${rend} km/L<br>
 Litros: ${litros.toFixed(0)}<br>
 Diesel: $${dieselCosto.toFixed(0)}<br>
 Casetas: $${totalCasetas}<br><br>
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
