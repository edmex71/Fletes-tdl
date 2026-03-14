
function redondear100(n){return Math.ceil(n/100)*100}

function calcularCotizacion(){

let km=parseFloat(document.getElementById("km").value)
let rendimiento=parseFloat(document.getElementById("camion").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let operativo=parseFloat(document.getElementById("operativo").value)

let dieselCosto=(km/rendimiento)*diesel

let casetas=window.casetasTotal||0

let costo=dieselCosto+casetas+operativo

let bajo=redondear100(km*22+costo)
let medio=redondear100(km*32+costo)
let alto=redondear100(km*38+costo)

document.getElementById("resultado").innerHTML=`
Precio bajo: $${bajo.toLocaleString()}<br>
Precio medio: $${medio.toLocaleString()}<br>
Precio alto: $${alto.toLocaleString()}<br>
Casetas estimadas: $${casetas}
`

window.precio=alto
}

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
ctx.font="32px Arial"
ctx.fillText("Transportes D' Leon",300,240)

ctx.font="28px Arial"
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

doc.text("Transportes D' Leon",20,20)
doc.text("Precio: $"+window.precio.toLocaleString(),20,40)

doc.save("cotizacion.pdf")
}
