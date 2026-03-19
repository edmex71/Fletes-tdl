let map;

function initMap(){
  map = L.map('map').setView([19.4326,-99.1332],6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);
}

function calcularRuta(){
  console.log("RUTA EJECUTADA");

  if(!map){
    initMap();
  }
}
