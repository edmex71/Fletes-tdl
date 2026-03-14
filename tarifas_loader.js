
async function cargarTarifas(){
 try{
   const r = await fetch('tarifas_capufe.json');
   const data = await r.json();
   window.TARIFAS_CAPUFE = data;
   console.log("Tarifas cargadas:", Object.keys(data).length);
 }catch(e){
   console.error("Error cargando tarifas",e);
   window.TARIFAS_CAPUFE = {};
 }
}

document.addEventListener("DOMContentLoaded", cargarTarifas);
