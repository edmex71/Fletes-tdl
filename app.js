let map;

// Crear mapa
function crearMapa(){
  alert("Mapa inicializando");

  if(map){
    map.remove();
  }

  map = L.map('map').setView([19.4326, -99.1332], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

// Función principal
function calcularRuta(){
  console.log("CLICK FUNCIONANDO");
  crearMapa();
}
