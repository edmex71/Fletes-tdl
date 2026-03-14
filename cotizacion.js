
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("camion").value)
let viaje=parseFloat(document.getElementById("viaje").value)
let retorno=parseFloat(document.getElementById("retornoVacio").value)/100

let kmTotal=km*viaje
let kmRetorno=km*retorno

let dieselCosto=((kmTotal+kmRetorno)/rendimiento)*diesel
let casetas=(window.casetasCosto||0)*viaje

let minimo=dieselCosto+casetas

let bajo=redondear100(minimo+kmTotal*18)
let medio=redondear100(minimo+kmTotal*28)
let alto=redondear100(minimo+kmTotal*38)

window.cotizacion={kmTotal,dieselCosto,casetas,bajo,medio,alto,minimo}

let lista=""
if(window.casetasDetectadas){
window.casetasDetectadas.forEach(c=>{
lista+=c.name+" $"+c.costo+"<br>"
})
}

document.getElementById("precios").innerHTML=`
<b>--- COSTO OPERATIVO ---</b><br>
Km cargado: ${kmTotal}<br>
Km retorno: ${kmRetorno}<br>
Diesel: $${dieselCosto.toFixed(0)}<br>
Casetas: $${casetas}<br><br>

<b>Precio mínimo sugerido:</b> $${minimo.toFixed(0)}<br><br>

<b>Precio bajo:</b> $${bajo}<br>
Precio medio: $${medio}<br>
Precio alto: $${alto}<br><br>

<b>--- CASETAS ---</b><br>
${lista}
`

guardarHistorial()
}


function guardarHistorial(){

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let hist=JSON.parse(localStorage.getItem("tdl_historial")||"[]")

hist.unshift({
fecha:new Date().toLocaleString(),
origen:origen,
destino:destino,
km:window.cotizacion.kmTotal,
precio:window.cotizacion.alto
})

localStorage.setItem("tdl_historial",JSON.stringify(hist.slice(0,30)))
}

function mostrarHistorial(){

let hist=JSON.parse(localStorage.getItem("tdl_historial")||"[]")

let html="<h3>Historial de Cotizaciones</h3>"

hist.forEach((h,i)=>{

html+=`
<div style="border-bottom:1px solid #ccc;padding:6px">
<b>${h.origen}</b> → <b>${h.destino}</b><br>
${h.fecha} | ${h.km} km | $${h.precio}
<button onclick="eliminarHistorial(${i})">Eliminar</button>
</div>
`

})

document.getElementById("historial").innerHTML=html
document.getElementById("historial").style.display="block"
}

function eliminarHistorial(i){

let hist=JSON.parse(localStorage.getItem("tdl_historial")||"[]")

hist.splice(i,1)

localStorage.setItem("tdl_historial",JSON.stringify(hist))

mostrarHistorial()

}

function reiniciarApp(){
location.reload()
}
