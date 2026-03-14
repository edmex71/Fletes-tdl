
function redondear100(n){return Math.ceil(n/100)*100}

function calcularFlete(){

let km=parseFloat(document.getElementById("km").value)
let diesel=parseFloat(document.getElementById("diesel").value)
let rendimiento=parseFloat(document.getElementById("rendimiento").value)

let dieselCosto=(km/rendimiento)*diesel
let casetas=window.casetasTotal||0

let bajo=redondear100(dieselCosto+casetas+km*22)
let medio=redondear100(dieselCosto+casetas+km*32)
let alto=redondear100(dieselCosto+casetas+km*38)

let html=`
<b>--- COSTO OPERATIVO ---</b><br>
Km: ${km}<br>
Diesel: $${dieselCosto.toFixed(0)}<br>
Casetas estimadas: $${casetas}<br><br>

<b>Precio bajo:</b> $${bajo}<br>
Precio medio: $${medio}<br>
Precio alto: $${alto}<br><br>

<b>--- TARIFA POR KM ---</b><br>
Bajo (22/km): $${(km*22).toFixed(0)}<br>
Medio (32/km): $${(km*32).toFixed(0)}<br>
<b>Alto (38/km): $${(km*38).toFixed(0)}</b><br><br>

<b>--- CASETAS DETECTADAS ---</b><br>
`

if(window.casetasLista){
window.casetasLista.forEach(c=>{
html+=c.name+" $"+c.costo+"<br>"
})
}

document.getElementById("resultado").innerHTML=html

}
