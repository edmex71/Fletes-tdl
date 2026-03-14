
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let operativo=parseFloat(document.getElementById("operativo").value)

let rendimiento=2.8

let dieselCosto=(km/rendimiento)*diesel

let casetas=window.casetasTotal||0

let total=redondear100(dieselCosto+casetas+operativo+km*32)

window.total=total

document.getElementById("precios").innerHTML=`
Diesel: $${dieselCosto.toFixed(0)}<br>
Casetas: $${casetas}<br>
Operativo: $${operativo}<br><br>
<b>Total cotización: $${total.toLocaleString()}</b>
`

guardarHistorial()

}

function guardarHistorial(){

let cliente=document.getElementById("cliente").value
let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let h=JSON.parse(localStorage.getItem("historial")||"[]")

h.unshift({cliente,origen,destino,precio:window.total})

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
canvas.height=700

let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,700)

let img=new Image()
img.src="logo.png"

img.onload=function(){

ctx.drawImage(img,380,40,140,140)

ctx.fillStyle="black"
ctx.font="28px Arial"

let y=240

ctx.fillText("Transportes D' Leon",300,y)

y+=60

ctx.fillText("Cliente: "+document.getElementById("cliente").value,80,y)
y+=40
ctx.fillText("Origen: "+document.getElementById("origen").value,80,y)
y+=40
ctx.fillText("Destino: "+document.getElementById("destino").value,80,y)
y+=40
ctx.fillText("Km: "+document.getElementById("km").value,80,y)

y+=60

ctx.fillText("Casetas:",80,y)

y+=40

window.casetasLista.forEach(c=>{

ctx.fillText(c.name+" $"+c.e5,100,y)
y+=30

})

y+=30

ctx.fillText("TOTAL: $"+window.total.toLocaleString(),320,y+40)

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
doc.text("Precio: $"+window.total,20,40)

doc.save("cotizacion.pdf")

}
