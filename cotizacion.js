
function redondear100(n){
return Math.ceil(n/100)*100
}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)
let bajo=redondear100(km*22)
let medio=redondear100(km*32)
let alto=redondear100(km*38)

document.getElementById("precios").innerHTML=`
Precio bajo: $${bajo.toLocaleString()}<br>
Precio medio: $${medio.toLocaleString()}<br>
Precio alto: $${alto.toLocaleString()}
`

window.precioAlto=alto
}

function enviarCotizacion(){

let texto="Cotización Transporte: $"+window.precioAlto

let url="https://wa.me/?text="+encodeURIComponent(texto)

window.open(url)
}
