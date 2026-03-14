
function calcular(){

let km = parseFloat(document.getElementById("km").value)
let rendimiento = parseFloat(document.getElementById("rendimiento").value)
let diesel = parseFloat(document.getElementById("diesel").value)

let litros = km / rendimiento
let costoDiesel = litros * diesel

let tiempo = calcularTiempo(km)

document.getElementById("resultado").innerHTML = `
<h3>COSTO OPERATIVO</h3>
Km: ${km}<br>
Tiempo estimado: ${tiempo}<br>
Litros: ${litros.toFixed(0)}<br>
Diesel: ${formatoDinero(costoDiesel)}
`
}
