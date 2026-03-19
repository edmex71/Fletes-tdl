function calcularRuta(){
  alert("Ruta simulada (estructura profesional)");
}

function calcularFlete(){
  let km = document.getElementById('km').value;
  let rendimiento = document.getElementById('rendimiento').value;
  let diesel = document.getElementById('diesel').value;

  if(km && rendimiento && diesel){
    let litros = km / rendimiento;
    let costo = litros * diesel;
    alert("Costo estimado: $" + Math.round(costo));
  } else {
    alert("Completa los datos");
  }
}

function limpiar(){
  document.getElementById('km').value="";
}
