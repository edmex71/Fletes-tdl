async function calcularRuta(){
  let o = document.getElementById('origen').value;
  let d = document.getElementById('destino').value;

  if(!o || !d){alert("Falta origen/destino"); return;}

  try{
    let r1 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${o}`);
    let r2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${d}`);
    let j1 = await r1.json();
    let j2 = await r2.json();

    if(!j1.length || !j2.length){alert("No encontrado"); return;}

    let lat1=j1[0].lat, lon1=j1[0].lon;
    let lat2=j2[0].lat, lon2=j2[0].lon;

    let km = getDistance(lat1,lon1,lat2,lon2);
    document.getElementById('km').value = Math.round(km);

  }catch(e){
    alert("Error ruta");
  }
}

function getDistance(lat1, lon1, lat2, lon2){
  let R=6371;
  let dLat=(lat2-lat1)*Math.PI/180;
  let dLon=(lon2-lon1)*Math.PI/180;
  let a=Math.sin(dLat/2)**2+
        Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
        Math.sin(dLon/2)**2;
  let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return R*c;
}

function calcularFlete(){
  let km = document.getElementById('km').value;
  let rendimiento = document.getElementById('rendimiento').value;
  let diesel = document.getElementById('diesel').value;

  if(km){
    let litros = km / rendimiento;
    let costo = litros * diesel;
    alert("Costo estimado: $" + Math.round(costo));
  }
}
