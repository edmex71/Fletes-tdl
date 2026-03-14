
function redondear100(n){return Math.ceil(n/100)*100}

function calcularCotizacion(){

let km=parseFloat(document.getElementById("km").value)
let viaje=parseFloat(document.getElementById("viaje").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("rendimiento").value)
let operativo=parseFloat(document.getElementById("operativo").value)
let minimo=parseFloat(document.getElementById("minimo").value)

km=km*viaje

let dieselCosto=(km/rendimiento)*diesel
let casetas=detectarCasetas()

let costoOperativo=dieselCosto+casetas+operativo

let bajo=redondear100(km*22+costoOperativo)
let medio=redondear100(km*32+costoOperativo)
let alto=redondear100(km*38+costoOperativo)

if(bajo<minimo)bajo=minimo
if(medio<minimo)medio=minimo
if(alto<minimo)alto=minimo

document.getElementById("precios").innerHTML=`
Precio bajo: $${bajo.toLocaleString()}<br>
Precio medio: $${medio.toLocaleString()}<br>
Precio alto: $${alto.toLocaleString()}<br>
Casetas detectadas: $${casetas}`

window.cotizacion={km,bajo,medio,alto,casetas}
}
