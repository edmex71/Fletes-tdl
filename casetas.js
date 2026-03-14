const casetas=[
  {
    "name": "Tepotzotlan",
    "lat": 19.706,
    "lon": -99.223,
    "auto": 95,
    "e5": 280,
    "e6": 340
  },
  {
    "name": "Palmillas",
    "lat": 20.515,
    "lon": -99.866,
    "auto": 110,
    "e5": 310,
    "e6": 380
  },
  {
    "name": "San Juan del Rio",
    "lat": 20.39,
    "lon": -99.98,
    "auto": 105,
    "e5": 295,
    "e6": 360
  },
  {
    "name": "Queretaro",
    "lat": 20.588,
    "lon": -100.389,
    "auto": 100,
    "e5": 280,
    "e6": 340
  },
  {
    "name": "Saucillo",
    "lat": 25.1,
    "lon": -100.3,
    "auto": 120,
    "e5": 350,
    "e6": 420
  },
  {
    "name": "Lagos de Moreno",
    "lat": 21.35,
    "lon": -101.93,
    "auto": 115,
    "e5": 300,
    "e6": 360
  },
  {
    "name": "Irapuato",
    "lat": 20.68,
    "lon": -101.35,
    "auto": 100,
    "e5": 270,
    "e6": 330
  },
  {
    "name": "Celaya",
    "lat": 20.52,
    "lon": -100.81,
    "auto": 100,
    "e5": 260,
    "e6": 320
  },
  {
    "name": "Guadalajara",
    "lat": 20.67,
    "lon": -103.35,
    "auto": 120,
    "e5": 280,
    "e6": 340
  },
  {
    "name": "Saltillo",
    "lat": 25.42,
    "lon": -100.99,
    "auto": 120,
    "e5": 300,
    "e6": 360
  },
  {
    "name": "Monterrey Norte",
    "lat": 25.78,
    "lon": -100.3,
    "auto": 130,
    "e5": 320,
    "e6": 390
  }
];
function distancia(lat1,lon1,lat2,lon2){
const R=6371
let dLat=(lat2-lat1)*Math.PI/180
let dLon=(lon2-lon1)*Math.PI/180
let a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
return R*c
}

function detectarCasetas(){

let usadas=[]
let total=0

casetas.forEach(c=>{

rutaCoords.forEach(r=>{

let d=distancia(r[1],r[0],c.lat,c.lon)

if(d<1){
if(!usadas.includes(c)){
usadas.push(c)

let tipo=document.getElementById("camion").value
let costo=c.auto
if(tipo==="t5") costo=c.e5
if(tipo==="t6"||tipo==="full") costo=c.e6

total+=costo
}
}

})

})

window.casetasTotal=total

let html="<h3>Casetas detectadas</h3>"
usadas.forEach(c=>{html+=c.name+"<br>"})
html+="<b>Total casetas: $"+total+"</b>"

document.getElementById("casetas").innerHTML=html
}
