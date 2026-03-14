
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("camion").value)

let dieselCosto=(km/rendimiento)*diesel

let casetas=window.casetasCosto||0

let bajo=redondear100(dieselCosto+casetas+km*22)
let medio=redondear100(dieselCosto+casetas+km*32)
let alto=redondear100(dieselCosto+casetas+km*38)

window.cotizacion={km,dieselCosto,casetas,bajo,medio,alto}

let lista=""
if(window.casetasDetectadas){
window.casetasDetectadas.forEach(c=>{
lista+=c.name+" $"+c.costo+"<br>"
})
}

document.getElementById("precios").innerHTML=`
<b>--- COSTO OPERATIVO ---</b><br>
Km: ${km}<br>
Diesel: $${dieselCosto.toFixed(0)}<br>
Casetas: $${casetas}<br><br>

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
km:window.cotizacion.km,
precio:window.cotizacion.alto
})

localStorage.setItem("tdl_historial",JSON.stringify(hist.slice(0,20)))

}

function generarJPG(){

let c=window.cotizacion
let canvas=document.createElement("canvas")
canvas.width=900
canvas.height=700
let ctx=canvas.getContext("2d")

ctx.fillStyle="white"
ctx.fillRect(0,0,900,700)

ctx.fillStyle="black"
ctx.font="30px Arial"
ctx.fillText("Cotización Transportes D'Leon",180,80)

ctx.font="22px Arial"
ctx.fillText("Km: "+c.km,80,160)
ctx.fillText("Diesel: $"+Math.round(c.dieselCosto),80,200)
ctx.fillText("Casetas: $"+c.casetas,80,240)
ctx.fillText("Precio alto: $"+c.alto,80,300)

let link=document.createElement("a")
link.download="cotizacion.jpg"
link.href=canvas.toDataURL()
link.click()

}

function generarPDF(){

const {jsPDF}=window.jspdf
let c=window.cotizacion

let doc=new jsPDF()
doc.text("Cotización Transportes D'Leon",20,20)
doc.text("Km: "+c.km,20,40)
doc.text("Diesel: $"+Math.round(c.dieselCosto),20,50)
doc.text("Casetas: $"+c.casetas,20,60)
doc.text("Precio alto: $"+c.alto,20,80)
doc.save("cotizacion.pdf")

}

function enviarCotizacion(){

let c=window.cotizacion

let msg=`🚚 Cotización Transporte

Km: ${c.km}
Diesel: $${Math.round(c.dieselCosto)}
Casetas: $${c.casetas}

Precio alto: $${c.alto}
`

window.open("https://wa.me/?text="+encodeURIComponent(msg))

}
