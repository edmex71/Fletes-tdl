
function detectarCasetas(origen,destino){

 let casetas=[]

 if(origen.toLowerCase().includes("cdmx") && destino.toLowerCase().includes("queretaro")){
   casetas=["TEPOTZOTLAN","PALMILLAS","SAN JUAN DEL RIO"]
 }

 if(origen.toLowerCase().includes("cdmx") && destino.toLowerCase().includes("puebla")){
   casetas=["SAN MARCOS"]
 }

 return casetas
}
