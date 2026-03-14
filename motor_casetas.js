
async function cargarCasetas(){
 const res = await fetch('casetas_mexico.json');
 return await res.json();
}

function distanciaKm(lat1,lon1,lat2,lon2){
 const R=6371;
 const dLat=(lat2-lat1)*Math.PI/180;
 const dLon=(lon2-lon1)*Math.PI/180;
 const a=Math.sin(dLat/2)*Math.sin(dLat/2)+
 Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
 Math.sin(dLon/2)*Math.sin(dLon/2);
 return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function detectarCasetasRuta(ruta, casetas){
 let encontradas=[];
 ruta.forEach(p=>{
  casetas.forEach(c=>{
   const d=distanciaKm(p.lat,p.lon,c.lat,c.lon);
   if(d<3){
    if(!encontradas.find(e=>e.id===c.id)){
      encontradas.push(c);
    }
   }
  });
 });
 return encontradas;
}
