
let eje=5

async function cargarTarifas(){
 try{
  let r=await fetch("tarifas_capufe.json")
  window.tarifasCAPUFE=await r.json()
 }catch{
  window.tarifasCAPUFE={}
 }
}

function obtenerTarifa(nombre){

 let datos=window.tarifasCAPUFE[nombre]

 if(!datos) return 0

 return datos["eje_"+eje] || datos["eje_5"] || 0

}

cargarTarifas()
