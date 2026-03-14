
let map;
let routeLayer;
let currentRoute=[];

function initMap(){
 map=L.map('map').setView([23,-102],5);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);
}

async function calcularRuta(){

 try{

 setEstado("Buscando coordenadas origen...");
 const origen=document.getElementById("origen").value;
 const destino=document.getElementById("destino").value;

 const o=await geocode(origen);

 setEstado("Buscando coordenadas destino...");
 const d=await geocode(destino);

 setEstado("Calculando ruta...");

 const url=`https://router.project-osrm.org/route/v1/driving/${o[0]},${o[1]};${d[0]},${d[1]}?overview=full&geometries=geojson`;

 const r=await fetch(url);
 const data=await r.json();

 const route=data.routes[0];

 const km=(route.distance/1000).toFixed(0);

 document.getElementById("km").value=km;

 if(routeLayer) map.removeLayer(routeLayer);

 routeLayer=L.geoJSON(route.geometry).addTo(map);

 map.fitBounds(routeLayer.getBounds());

 currentRoute=route.geometry.coordinates;

 setEstado("Ruta lista");

 }catch(e){

 setEstado("Error: "+e);

 }

}
