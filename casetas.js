const casetas=[
  {
    "name": "Tepotzotlan",
    "lat": 19.706,
    "lon": -99.223,
    "costo": 280
  },
  {
    "name": "Palmillas",
    "lat": 20.515,
    "lon": -99.866,
    "costo": 310
  },
  {
    "name": "San Juan del Rio",
    "lat": 20.39,
    "lon": -99.98,
    "costo": 295
  },
  {
    "name": "Queretaro",
    "lat": 20.588,
    "lon": -100.389,
    "costo": 280
  },
  {
    "name": "Celaya",
    "lat": 20.52,
    "lon": -100.81,
    "costo": 260
  },
  {
    "name": "Irapuato",
    "lat": 20.68,
    "lon": -101.35,
    "costo": 270
  },
  {
    "name": "Lagos de Moreno",
    "lat": 21.35,
    "lon": -101.93,
    "costo": 300
  },
  {
    "name": "Guadalajara",
    "lat": 20.67,
    "lon": -103.35,
    "costo": 280
  },
  {
    "name": "Saltillo",
    "lat": 25.42,
    "lon": -100.99,
    "costo": 300
  },
  {
    "name": "Monterrey Norte",
    "lat": 25.78,
    "lon": -100.3,
    "costo": 320
  },
  {
    "name": "La Venta",
    "lat": 19.37,
    "lon": -99.29,
    "costo": 150
  },
  {
    "name": "La Marquesa",
    "lat": 19.285,
    "lon": -99.366,
    "costo": 160
  },
  {
    "name": "Toluca",
    "lat": 19.282,
    "lon": -99.655,
    "costo": 170
  },
  {
    "name": "Cuernavaca",
    "lat": 18.921,
    "lon": -99.234,
    "costo": 200
  },
  {
    "name": "Cuapiaxtla",
    "lat": 19.43,
    "lon": -97.79,
    "costo": 210
  },
  {
    "name": "Esperanza",
    "lat": 18.86,
    "lon": -97.4,
    "costo": 220
  }
];
function distancia(a,b,c,d){
const R=6371
let dLat=(c-a)*Math.PI/180
let dLon=(d-b)*Math.PI/180
let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2
let y=2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
return R*y
}

function detectarCasetas(){

let usadas=[]
let total=0

casetas.forEach(c=>{
rutaCoords.forEach(r=>{

let d=distancia(r[1],r[0],c.lat,c.lon)

if(d<3){

if(!usadas.find(u=>u.name===c.name)){
usadas.push(c)
total+=c.costo
}

}

})
})

window.casetasLista=usadas
window.casetasTotal=total

}
