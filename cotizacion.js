
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("camion").value)
let operativo=parseFloat(document.getElementById("operativo").value)

let dieselCosto=(km/rendimiento)*diesel
let casetas=window.casetasTotal||0

let costoBase=dieselCosto+casetas+operativo

let bajo=redondear100(costoBase+km*22)
let medio=redondear100(costoBase+km*32)
let alto=redondear100(costoBase+km*38)

document.getElementById("precios").innerHTML=`
Precio bajo: $${bajo.toLocaleString()}<br>
Precio medio: $${medio.toLocaleString()}<br>
Precio alto: $${alto.toLocaleString()}<br>
<br>
Diesel: $${dieselCosto.toFixed(0)}<br>
Casetas: $${casetas}<br>
Operativo: $${operativo}
`

window.precio=alto

guardarHistorial()

}

function guardarHistorial(){

let cliente=document.getElementById("cliente").value
let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let h=JSON.parse(localStorage.getItem("historial")||"[]")

h.unshift({cliente,origen,destino,precio:window.precio})

localStorage.setItem("historial",JSON.stringify(h))

mostrarHistorial()

}

function mostrarHistorial(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")

let html=""

h.forEach(i=>{
html+=i.cliente+" "+i.origen+"-"+i.destino+" $"+i.precio+"<br>"
})

document.getElementById("historial").innerHTML=html

}

mostrarHistorial()

function generarJPG(){

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=600

let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,600)

let img=new Image()
img.src="logo.png"

img.onload=function(){

ctx.drawImage(img,380,40,140,140)

ctx.fillStyle="black"
ctx.font="28px Arial"

ctx.fillText("Cotizacion TDL",330,240)
ctx.fillText("$"+window.precio.toLocaleString(),380,320)

let a=document.createElement("a")
a.href=canvas.toDataURL("image/jpeg")
a.download="cotizacion.jpg"
a.click()

}

}

function generarPDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("Cotizacion TDL",20,20)

doc.text("Precio: $"+window.precio.toLocaleString(),20,40)

doc.text("Detalle de costos:",20,70)

doc.save("cotizacion.pdf")

}
