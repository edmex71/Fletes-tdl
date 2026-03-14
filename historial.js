
function guardarHistorial(data){
let historial = JSON.parse(localStorage.getItem("historial")||"[]");
historial.push(data);
localStorage.setItem("historial",JSON.stringify(historial));
}
