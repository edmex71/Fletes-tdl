

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

let hist=JSON.parse(localStorage.getItem("tdl_historial")||"[]")

hist.unshift({
fecha:new Date().toLocaleString(),
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
<div style="border-bottom:1px solid #ccc;padding:5px">
${h.fecha} - ${h.km} km - $${h.precio}
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

function generarPDF(){

const {jsPDF}=window.jspdf

let c=window.cotizacion

let doc=new jsPDF()

let img=new Image()
img.src="logo.png"

img.onload=function(){

doc.addImage(img,"PNG",80,10,50,50)

doc.setFontSize(16)
doc.text("Cotización Transportes D'Leon",20,80)

doc.setFontSize(11)

doc.text("Km cargado: "+c.kmTotal,20,100)
doc.text("Diesel: $"+Math.round(c.dieselCosto),20,110)
doc.text("Casetas: $"+c.casetas,20,120)

doc.text("Precio mínimo: $"+Math.round(c.minimo),20,140)

doc.text("Precio bajo: $"+c.bajo,20,160)
doc.text("Precio medio: $"+c.medio,20,170)
doc.text("Precio alto: $"+c.alto,20,180)

doc.save("cotizacion.pdf")

}

}

function generarJPG(){

let c=window.cotizacion

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=800
let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,800)

let logo=new Image()
logo.src="logo.png"

logo.onload=function(){

ctx.drawImage(logo,350,20,200,200)

ctx.fillStyle="black"
ctx.font="30px Arial"
ctx.fillText("Cotización Transportes D'Leon",180,260)

ctx.font="22px Arial"

ctx.fillText("Km cargado: "+c.kmTotal,100,340)
ctx.fillText("Diesel: $"+Math.round(c.dieselCosto),100,380)
ctx.fillText("Casetas: $"+c.casetas,100,420)

ctx.fillText("Precio mínimo: $"+c.minimo,100,460)
ctx.fillText("Precio alto: $"+c.alto,100,500)

let link=document.createElement("a")
link.download="cotizacion.jpg"
link.href=canvas.toDataURL("image/jpeg")
link.click()

}

}

function enviarCotizacion(){

let c=window.cotizacion

let msg=`🚚 Cotización Transporte

Km cargado: ${c.kmTotal}
Diesel: $${Math.round(c.dieselCosto)}
Casetas: $${c.casetas}

Precio mínimo: $${c.minimo}
Precio alto: $${c.alto}
`

window.open("https://wa.me/?text="+encodeURIComponent(msg))

}

function reiniciarApp(){

location.reload()

}

