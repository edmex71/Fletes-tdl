
async function cargarTarifas(){

 try{
  let r=await fetch("tarifas_capufe.json")
  window.tarifasCAPUFE=await r.json()
 }catch(e){
  window.tarifasCAPUFE={}
 }

}

cargarTarifas()
