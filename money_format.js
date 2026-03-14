
function formatoDinero(valor){
valor = Math.ceil(valor/100)*100;
return "$" + valor.toLocaleString("en-US",{minimumFractionDigits:2});
}
