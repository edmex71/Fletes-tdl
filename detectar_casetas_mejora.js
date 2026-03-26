
function detectarCasetas(ruta, listadoCasetas){
let casetasDetectadas = [];
listadoCasetas.forEach(caseta=>{
if(ruta.includes(caseta.carretera)||ruta.includes(caseta.tramo)){
casetasDetectadas.push(caseta);
}
});
return casetasDetectadas;
}
