

function redondear100(n){
return Math.ceil(n/100)*100
}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)

let diesel=km*7
let casetas=window.casetasCosto||0

let bajo=redondear100(diesel+casetas+km*22)
let medio=redondear100(diesel+casetas+km*32)
let alto=redondear100(diesel+casetas+km*38)

let lista=""

if(window.casetasDetectadas){
window.casetasDetectadas.forEach(c=>{
lista+=c.name+" $"+c.costo+"\n"
})
}

document.getElementById("precios").innerHTML=`
<b>--- COSTO OPERATIVO ---</b><br>
Km: ${km}<br>
Diesel estimado: $${diesel}<br>
Casetas: $${casetas}<br><br>

<b>Precio bajo:</b> $${bajo.toLocaleString()}<br>
Precio medio: $${medio.toLocaleString()}<br>
Precio alto: $${alto.toLocaleString()}<br><br>

<b>--- CASETAS DETECTADAS ---</b><br>
${lista.replaceAll("\n","<br>")}
`

window.precioAlto=alto
window.detalleCasetas=lista
window.kmRuta=km
window.dieselCosto=diesel
window.casetasTotal=casetas

}

function generarJPG(){

let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=900

let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,900)

ctx.fillStyle="black"
ctx.font="28px Arial"

let y=80

ctx.fillText("Cotización Transporte",300,y)
y+=60

ctx.fillText("Km: "+window.kmRuta,80,y)
y+=40

ctx.fillText("Diesel: $"+window.dieselCosto,80,y)
y+=40

ctx.fillText("Casetas: $"+window.casetasTotal,80,y)
y+=60

ctx.fillText("Precio alto: $"+window.precioAlto,80,y)
y+=60

ctx.font="20px Arial"

ctx.fillText("Casetas:",80,y)
y+=40

if(window.detalleCasetas){

window.detalleCasetas.split("\n").forEach(l=>{

if(l.trim()!=""){
ctx.fillText(l,100,y)
y+=30
}

})

}

let link=document.createElement("a")
link.download="cotizacion.jpg"
link.href=canvas.toDataURL("image/jpeg")

link.click()

}

function generarPDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("Cotización Transporte",20,20)

doc.text("Km: "+window.kmRuta,20,40)
doc.text("Diesel: $"+window.dieselCosto,20,50)
doc.text("Casetas: $"+window.casetasTotal,20,60)

doc.text("Precio alto: $"+window.precioAlto,20,80)

let y=100

if(window.detalleCasetas){

window.detalleCasetas.split("\n").forEach(l=>{

if(l.trim()!=""){
doc.text(l,20,y)
y+=10
}

})

}

doc.save("cotizacion.pdf")

}

function enviarCotizacion(){

let texto=`
🚚 Cotización Transporte

Km: ${window.kmRuta}
Diesel: $${window.dieselCosto}
Casetas: $${window.casetasTotal}

Precio alto: $${window.precioAlto}

Casetas:
${window.detalleCasetas}
`

let url="https://wa.me/?text="+encodeURIComponent(texto)

window.open(url)

}

