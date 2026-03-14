
function dist(a,b){

 const R=6371
 const dLat=(b[1]-a[1])*Math.PI/180
 const dLon=(b[0]-a[0])*Math.PI/180

 const lat1=a[1]*Math.PI/180
 const lat2=b[1]*Math.PI/180

 const x=Math.sin(dLat/2)**2+Math.sin(dLon/2)**2*Math.cos(lat1)*Math.cos(lat2)

 return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))

}

function limpiar(n){

 if(!n) return null

 n=n.toUpperCase()

 n=n.replace(/CASETA DE COBRO/g,"")
 n=n.replace(/PLAZA DE COBRO/g,"")
 n=n.replace(/NRO/g,"")
 n=n.replace(/[0-9]/g,"")

 n=n.replace(/\s+/g," ").trim()

 return n

}

function detectarCasetas(){

 const casetas=new Set()

 dataset_tolls.features.forEach(c=>{

 const coord=c.geometry.coordinates
 const nombre=limpiar(c.properties?.name)

 if(!nombre) return

 currentRoute.forEach(p=>{

 if(dist(p,coord)<2){

 casetas.add(nombre)

 }

 })

 })

 return [...casetas]

}
