
function normalizarNombre(nombre){
 if(!nombre) return "";
 let n = nombre.toUpperCase();
 n = n.replace(/AUX.*/g,"");
 n = n.replace(/AUXILIAR.*/g,"");
 n = n.replace(/CASETA/g,"");
 n = n.replace(/\s+/g," ").trim();
 return n;
}

function buscarPrecio(nombre, tarifas){
 const base = normalizarNombre(nombre);
 for(const k in tarifas){
   if(normalizarNombre(k)===base){
      return tarifas[k];
   }
 }
 return 0;
}


async function cargarCasetas(){
 const res = await fetch('dataset_capufe_nacional.json');
 return await res.json();
}

function distanciaKm(lat1,lon1,lat2,lon2){
 const R=6371;
 const dLat=(lat2-lat1)*Math.PI/180;
 const dLon=(lon2-lon1)*Math.PI/180;
 const a=Math.sin(dLat/2)**2 +
 Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
 Math.sin(dLon/2)**2;
 return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function detectarCasetasRuta(ruta,casetas){
 let lista=[];
 ruta.forEach(p=>{
  casetas.forEach(c=>{
   const d=distanciaKm(p.lat,p.lon,c.lat,c.lon);
   if(d<3){
     if(!lista.find(x=>x.id===c.id)){
        lista.push(c);
     }
   }
  });
 });
 return lista.sort((a,b)=>a.km-b.km);
}
