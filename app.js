let map = L.map('map').setView([23,-102],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let rutaLayer;

async function geocode(q){
 let r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
 let j = await r.json();
 return [j[0].lon, j[0].lat];
}

async function calcularRuta(){
 let o=document.getElementById('origen').value;
 let d=document.getElementById('destino').value;

 let c1=await geocode(o);
 let c2=await geocode(d);

 let url=`https://router.project-osrm.org/route/v1/driving/${c1[0]},${c1[1]};${c2[0]},${c2[1]}?overview=full&geometries=geojson`;

 let res=await fetch(url);
 let data=await res.json();

 let km=data.routes[0].distance/1000;
 document.getElementById('km').value=Math.round(km);

 if(rutaLayer) map.removeLayer(rutaLayer);

 rutaLayer=L.geoJSON(data.routes[0].geometry).addTo(map);
 map.fitBounds(rutaLayer.getBounds());
}

function calcularFlete(){
 let km=document.getElementById('km').value;
 let r=document.getElementById('rendimiento').value;
 let d=document.getElementById('diesel').value;
 let costo=(km/r)*d;
 alert("Costo: $"+Math.round(costo));
}
