
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)||0
let diesel=parseFloat(document.getElementById("diesel").value)||0
let rendimiento=parseFloat(document.getElementById("camion").value)||1

let dieselCosto=(km/rendimiento)*diesel
let casetas=(window.casetasCosto||0)

let minimo=dieselCosto+casetas

let bajo=redondear100(minimo+km*18)
let medio=redondear100(minimo+km*28)
let alto=redondear100(minimo+km*38)

window.cotizacion={km,dieselCosto,casetas,bajo,medio,alto,minimo}

let lista=""
if(window.casetasDetectadas){
window.casetasDetectadas.forEach(c=>{
lista+=c.name+" $"+c.costo+"<br>"
})
}

document.getElementById("precios").innerHTML=`
<b>--- COSTO OPERATIVO ---</b><br>
Km cargado: ${km}<br>
Diesel: $${dieselCosto.toFixed(0)}<br>
Casetas: $${casetas}<br><br>

<b>Precio mínimo:</b> $${minimo.toFixed(0)}<br><br>

<b>Precio bajo:</b> $${bajo}<br>
Precio medio: $${medio}<br>
Precio alto: $${alto}<br><br>

<b>--- CASETAS ---</b><br>
${lista}
`

guardarHistorial()

}

function borrarDatos(){
document.querySelectorAll("input").forEach(i=>i.value="")
document.getElementById("precios").innerHTML=""
window.casetasDetectadas=[]
window.casetasCosto=0
}

function guardarHistorial(){

let hist=JSON.parse(localStorage.getItem("historial")||"[]")
hist.push(window.cotizacion)
localStorage.setItem("historial",JSON.stringify(hist))

}

function verHistorial(){

let hist=JSON.parse(localStorage.getItem("historial")||"[]")

let html="<h3>Historial</h3>"

hist.forEach(h=>{
html+=`Km ${h.km} | $${h.alto}<br>`
})

document.getElementById("precios").innerHTML=html

}

function generarPDF(){

if(!window.cotizacion){alert("Primero calcula el flete");return}

let c=window.cotizacion

let w=window.open("")
w.document.write("<h2>Cotización Transporte</h2>")
w.document.write("Km: "+c.km+"<br>")
w.document.write("Diesel: $"+Math.round(c.dieselCosto)+"<br>")
w.document.write("Casetas: $"+c.casetas+"<br>")
w.document.write("<b>Precio alto: $"+c.alto+"</b>")

w.print()

}
