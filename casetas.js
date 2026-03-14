
let CASSETAS=null

async function cargarCasetas(){
let r=await fetch("casetas_mexico_real.json")
CASSETAS=(await r.json()).plazas
}

function distancia(lat1,lon1,lat2,lon2){
let R=6371
let dLat=(lat2-lat1)*Math.PI/180
let dLon=(lon2-lon1)*Math.PI/180
let a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2)
let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
return R*c
}

function detectarCasetas(){

if(!window.routeCoords||!CASSETAS) return 0

let tipo=document.getElementById("ejes").value
let total=0

CASSETAS.forEach(p=>{

for(let i=0;i<window.routeCoords.length;i+=10){

let coord=window.routeCoords[i]
let d=distancia(coord[1],coord[0],p.lat,p.lon)

if(d<2){
total+=p.tarifas[tipo]
break
}

}

})

return total
}

cargarCasetas()
