
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
lista+=c.name+" $"+c.costo+"<br>"
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
${lista}
`

window.precioAlto=alto
}

function enviarCotizacion(){

let texto="Cotización Transporte: $"+window.precioAlto

let url="https://wa.me/?text="+encodeURIComponent(texto)

window.open(url)
}
