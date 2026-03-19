
let map;

function calcularRuta(){
  if(!map){
    map = L.map('map').setView([19.43,-99.13],6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© OpenStreetMap'
    }).addTo(map);
  }
}
