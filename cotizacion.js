
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)||0
let diesel=parseFloat(document.getElementById("diesel").value)||0
let rendimiento=parseFloat(document.getElementById("camion").value)||1

// SOLO IDA (sin retorno)
let kmTotal = km

let dieselCosto=(kmTotal/rendimiento)*diesel
let casetas=(window.casetasCosto||0)

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

function enviarCotizacion(){

if(!window.cotizacion){alert("Primero calcula el flete");return}

let c=window.cotizacion

let msg=`🚚 Cotización Transporte

Km: ${c.kmTotal}
Diesel: $${Math.round(c.dieselCosto)}
Casetas: $${c.casetas}

Precio alto: $${c.alto}
`

window.open("https://wa.me/?text="+encodeURIComponent(msg))

}

function generarJPG(){

if(!window.cotizacion){alert("Primero calcula el flete");return}

let c=window.cotizacion

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=650
let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,650)

let logo=new Image()
logo.src="logo.png"

logo.onload=function(){

ctx.drawImage(logo,380,20,140,140)

ctx.fillStyle="black"
ctx.font="28px Arial"
ctx.fillText("Cotización Transporte",300,200)

ctx.font="22px Arial"
ctx.fillText("Km: "+c.kmTotal,100,260)
ctx.fillText("Diesel: $"+Math.round(c.dieselCosto),100,300)
ctx.fillText("Casetas: $"+c.casetas,100,340)

ctx.fillText("Precio alto: $"+c.alto,100,420)

let link=document.createElement("a")
link.download="cotizacion.jpg"
link.href=canvas.toDataURL()
link.click()

}

}
