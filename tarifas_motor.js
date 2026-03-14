
function normalizar(nombre){
 if(!nombre) return "";
 return nombre.toUpperCase()
  .replace(/AUX.*/g,"")
  .replace(/CASETA/g,"")
  .replace(/\s+/g," ")
  .trim();
}

function obtenerTarifa(nombre){
 if(!window.TARIFAS_CAPUFE) return 0;
 const base = normalizar(nombre);

 for(const k in window.TARIFAS_CAPUFE){
   if(normalizar(k)===base){
     const t = window.TARIFAS_CAPUFE[k];
     if(typeof t === "object" && t["5"]){
        return t["5"]; // trailer 5 ejes
     }
     if(typeof t === "number") return t;
   }
 }

 return 0;
}
