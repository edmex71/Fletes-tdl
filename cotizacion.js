

function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)||0
let diesel=parseFloat(document.getElementById("diesel").value)||0
let rendimiento=parseFloat(document.getElementById("camion").value)||1
let viaje=parseFloat(document.getElementById("viaje").value)||1
let retorno=parseFloat(document.getElementById("retornoVacio").value||0)/100

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

Km cargado: ${c.kmTotal}
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
canvas.height=700
let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,700)

let logo=new Image()
logo.src="logo.png"

logo.onload=function(){

ctx.drawImage(logo,350,20,200,200)

ctx.fillStyle="black"
ctx.font="30px Arial"
ctx.fillText("Cotización Transportes D'Leon",180,260)

ctx.font="22px Arial"
ctx.fillText("Km: "+c.kmTotal,100,340)
ctx.fillText("Diesel: $"+Math.round(c.dieselCosto),100,380)
ctx.fillText("Casetas: $"+c.casetas,100,420)
ctx.fillText("Precio alto: $"+c.alto,100,480)

let link=document.createElement("a")
link.download="cotizacion.jpg"
link.href=canvas.toDataURL("image/jpeg")
link.click()

}

}

function generarPDF(){

if(!window.cotizacion){alert("Primero calcula el flete");return}

const {jsPDF}=window.jspdf

let c=window.cotizacion

let doc=new jsPDF()

doc.setFontSize(16)
doc.text("Cotización Transportes D'Leon",20,20)

doc.setFontSize(12)
doc.text("Km: "+c.kmTotal,20,40)
doc.text("Diesel: $"+Math.round(c.dieselCosto),20,50)
doc.text("Casetas: $"+c.casetas,20,60)
doc.text("Precio alto: $"+c.alto,20,80)

doc.save("cotizacion.pdf")

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

function reiniciarApp(){
location.reload()
}
