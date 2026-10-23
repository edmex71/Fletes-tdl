// Lógica de tarifas. Los datos viven en casetas_data.js (generado por build_casetas.py).

// Tarifa de una caseta para N ejes (camión). Si la caseta cobra por varios tramos,
// se toma el tramo de mayor precio (tramo completo) y se devuelve su nombre para revisarlo.
function tarifaCaseta(c, ejes){
 let mejor=null
 c.tr.forEach(t=>{
  const v=t.t[ejes]
  if(v!=null && (mejor===null || v>mejor.monto)){
   mejor={monto:v,tramo:t.tramo,desde:t.desde,multi:c.tr.length>1}
  }
 })
 return mejor
}

// Estimado para plazas detectadas sin tarifa: mediana de todas las tarifas conocidas para esos ejes.
const _medianaCache={}
function estimarPlaza(ejes){
 if(_medianaCache[ejes]!=null) return _medianaCache[ejes]
 const v=CASETAS_TARIFA
  .map(c=>tarifaCaseta(c,ejes))
  .filter(Boolean)
  .map(t=>t.monto)
  .sort((a,b)=>a-b)
 let m=250
 if(v.length){
  m=v.length%2 ? v[(v.length-1)/2] : (v[v.length/2-1]+v[v.length/2])/2
 }
 return _medianaCache[ejes]=Math.round(m)
}

// Respaldo cuando no hay ruta calculada (km escritos a mano): $ por km, solo orientativo.
function calcularCasetasEstimadas(km){
 let factor
 if(km<200) factor=2.2
 else if(km<500) factor=2.5
 else if(km<900) factor=2.8
 else if(km<1400) factor=3.1
 else factor=3.4
 return km*factor
}
