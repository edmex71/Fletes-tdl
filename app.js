
function generarJPG(){

let tipo=document.getElementById("precioElegido").value
let precio=window.cotizacion[tipo]

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
ctx.font="34px Arial"
ctx.fillText("Transportes D' Leon",300,220)

ctx.font="28px Arial"
ctx.fillText("Precio cotizado:",350,340)
ctx.fillText("$"+precio.toLocaleString(),380,390)

let a=document.createElement("a")
a.href=canvas.toDataURL("image/jpeg")
a.download="cotizacion.jpg"
a.click()

}

}

function generarPDF(){

const {jsPDF}=window.jspdf
let doc=new jsPDF()

let tipo=document.getElementById("precioElegido").value
let precio=window.cotizacion[tipo]

doc.addImage("logo.png","PNG",80,10,50,50)
doc.text("Transportes D' Leon",70,80)
doc.text("Precio: $"+precio.toLocaleString(),70,100)
doc.save("cotizacion.pdf")
}

function enviarWhatsApp(){

let tipo=document.getElementById("precioElegido").value
let precio=window.cotizacion[tipo]

let texto=`Cotizacion Transportes D' Leon
Precio: $${precio.toLocaleString()}`

window.open("https://wa.me/?text="+encodeURIComponent(texto))
}

function guardarCotizacion(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")
h.push(window.cotizacion)
localStorage.setItem("historial",JSON.stringify(h))
mostrarHistorial()
}

function mostrarHistorial(){

let h=JSON.parse(localStorage.getItem("historial")||"[]")
let div=document.getElementById("historial")
div.innerHTML=""

h.reverse().forEach(c=>{
div.innerHTML+=`<div>${c.km} km - $${c.alto}</div>`
})
}

function reiniciar(){location.reload()}

mostrarHistorial()
