const casetas=[
  {
    "name": "Tepotzotlan",
    "lat": 19.706,
    "lon": -99.223,
    "e5": 280
  },
  {
    "name": "Palmillas",
    "lat": 20.515,
    "lon": -99.866,
    "e5": 310
  },
  {
    "name": "San Juan del Rio",
    "lat": 20.39,
    "lon": -99.98,
    "e5": 295
  },
  {
    "name": "Queretaro",
    "lat": 20.588,
    "lon": -100.389,
    "e5": 280
  },
  {
    "name": "Celaya",
    "lat": 20.52,
    "lon": -100.81,
    "e5": 260
  },
  {
    "name": "Irapuato",
    "lat": 20.68,
    "lon": -101.35,
    "e5": 270
  },
  {
    "name": "Lagos de Moreno",
    "lat": 21.35,
    "lon": -101.93,
    "e5": 300
  },
  {
    "name": "Guadalajara",
    "lat": 20.67,
    "lon": -103.35,
    "e5": 280
  },
  {
    "name": "Saltillo",
    "lat": 25.42,
    "lon": -100.99,
    "e5": 300
  },
  {
    "name": "Monterrey Norte",
    "lat": 25.78,
    "lon": -100.3,
    "e5": 320
  },
  {
    "name": "La Venta",
    "lat": 19.37,
    "lon": -99.29,
    "e5": 150
  },
  {
    "name": "La Marquesa",
    "lat": 19.285,
    "lon": -99.366,
    "e5": 160
  },
  {
    "name": "Toluca",
    "lat": 19.282,
    "lon": -99.655,
    "e5": 170
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

if(d<2){

if(!usadas.find(u=>u.name===c.name)){

usadas.push(c)
total+=c.e5

}

}

})

})

window.casetasLista=usadas
window.casetasTotal=total

let html="<h3>Casetas detectadas</h3>"

usadas.forEach(c=>{

html+=c.name+" $"+c.e5+"<br>"

})

html+="<b>Total casetas: $"+total+"</b>"

document.getElementById("casetas").innerHTML=html

}
