
function dist(a,b){

 const R=6371;
 const dLat=(b[1]-a[1])*Math.PI/180;
 const dLon=(b[0]-a[0])*Math.PI/180;

 const lat1=a[1]*Math.PI/180;
 const lat2=b[1]*Math.PI/180;

 const x=Math.sin(dLat/2)**2+Math.sin(dLon/2)**2*Math.cos(lat1)*Math.cos(lat2);

 return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

function limpiarNombre(nombre){

 if(!nombre) return null;

 nombre=nombre.toUpperCase();

 nombre=nombre.replace("CASETA DE COBRO","");
 nombre=nombre.replace("PLAZA DE COBRO","");
 nombre=nombre.replace("NRO","");
 nombre=nombre.replace(/[0-9]/g,"");

 nombre=nombre.replace("KM","");

 nombre=nombre.trim();

 const partes=nombre.split(" ");
 return partes[partes.length-1];
}

function detectarCasetas(){

 const casetas=new Set();

 dataset_tolls.features.forEach(c=>{

 const coord=c.geometry.coordinates;
 const raw=c.properties?.name;

 const limpio=limpiarNombre(raw);

 if(!limpio) return;

 currentRoute.forEach(p=>{

 if(dist(p,coord)<2){
 casetas.add(limpio);
 }

 });

 });

 return [...casetas];
}
