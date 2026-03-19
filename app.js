let map=L.map('map').setView([23,-102],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let rutaLayer;

const CASETAS=[
{nombre:"San Marcos",lat:19.36,lon:-98.9,costo:92},
{nombre:"San Martin Texmelucan",lat:19.28,lon:-98.43,costo:65},
{nombre:"Tepotzotlan",lat:19.72,lon:-99.22,costo:102},
{nombre:"Palmillas",lat:20.6,lon:-99.9,costo:310}
];

async function geocode(q){
let r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
let j=await r.json();
return [j[0].lon,j[0].lat];
}

async function calcularRuta(){
let o=document.getElementById('origen').value;
let d=document.getElementById('destino').value;

let c1=await geocode(o);
let c2=await geocode(d);

let res=await fetch(`https://router.project-osrm.org/route/v1/driving/${c1[0]},${c1[1]};${c2[0]},${c2[1]}?overview=full&geometries=geojson`);
let data=await res.json();

let coords=data.routes[0].geometry.coordinates;
let km=data.routes[0].distance/1000;
document.getElementById('km').value=Math.round(km);

if(rutaLayer) map.removeLayer(rutaLayer);
rutaLayer=L.geoJSON(data.routes[0].geometry).addTo(map);
map.fitBounds(rutaLayer.getBounds());

detectarCasetas(coords);
}

function detectarCasetas(coords){
let lista=document.getElementById('casetas');
lista.innerHTML="";
let set=new Map();

CASETAS.forEach(c=>{
coords.forEach(p=>{
let dist=getDistance(p[1],p[0],c.lat,c.lon);
if(dist<10){
set.set(c.nombre,c.costo);
}
});
});

let total=0;

set.forEach((costo,nombre)=>{
let li=document.createElement("li");
li.innerText=nombre+" → $"+costo;
lista.appendChild(li);
total+=costo;
});

document.getElementById('count').innerText=set.size;
document.getElementById('totalCasetas').innerText=total;
}

function getDistance(a,b,c,d){
let R=6371;
let dLat=(c-a)*Math.PI/180;
let dLon=(d-b)*Math.PI/180;
let x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;
return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

function calcularFlete(){
let km=document.getElementById('km').value;
let r=document.getElementById('rendimiento').value;
let d=document.getElementById('diesel').value;
let casetas=parseFloat(document.getElementById('totalCasetas').innerText);

let diesel=(km/r)*d;
let total=diesel+casetas;

alert("Diesel: $"+Math.round(diesel)+"\nCasetas: $"+casetas+"\nTotal: $"+Math.round(total));
}
