let map=L.map('map').setView([23,-102],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let rutaLayer;

const CASETAS=[
{nombre:"San Marcos",lat:19.36,lon:-98.9},
{nombre:"San Martin",lat:19.28,lon:-98.43},
{nombre:"Tepotzotlan",lat:19.72,lon:-99.22}
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
let set=new Set();

CASETAS.forEach(c=>{
coords.forEach(p=>{
let dist=getDistance(p[1],p[0],c.lat,c.lon);
if(dist<10){set.add(c.nombre);}
});
});

set.forEach(n=>{
let li=document.createElement("li");
li.innerText=n;
lista.appendChild(li);
});

document.getElementById('count').innerText=set.size;
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
alert("$"+Math.round((km/r)*d));
}