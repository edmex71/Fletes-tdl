async function geocode(ciudad){
  let url = `https://nominatim.openstreetmap.org/search?format=json&q=${ciudad}`;
  let res = await fetch(url);
  let data = await res.json();
  if(!data.length) throw "No encontrado";
  return [data[0].lon, data[0].lat];
}

async function calcularRuta(){
  let o = document.getElementById('origen').value;
  let d = document.getElementById('destino').value;

  if(!o || !d){ alert("Falta origen/destino"); return; }

  try{
    let c1 = await geocode(o);
    let c2 = await geocode(d);

    let url = `https://router.project-osrm.org/route/v1/driving/${c1[0]},${c1[1]};${c2[0]},${c2[1]}?overview=false`;

    let res = await fetch(url);
    let data = await res.json();

    let km = data.routes[0].distance / 1000;
    document.getElementById('km').value = Math.round(km);

  }catch(e){
    alert("Error obteniendo ruta");
  }
}

function calcularFlete(){
  let km = document.getElementById('km').value;
  let rendimiento = document.getElementById('rendimiento').value;
  let diesel = document.getElementById('diesel').value;

  if(km){
    let litros = km / rendimiento;
    let costo = litros * diesel;
    alert("Costo estimado: $" + Math.round(costo));
  } else {
    alert("Primero calcula la ruta");
  }
}
