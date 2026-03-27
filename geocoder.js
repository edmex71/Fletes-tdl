
async function geocode(city){
 const url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
 const r=await fetch(url)
 const data=await r.json()
 if(!data.length) throw "Ciudad no encontrada"
 return [parseFloat(data[0].lon),parseFloat(data[0].lat)]
}


function calcularCasetasEstimadas(km){

 let factor = 2.6;

 if(km < 200) factor = 2.2;
 else if(km < 500) factor = 2.5;
 else if(km < 900) factor = 2.8;
 else if(km < 1400) factor = 3.1;
 else factor = 3.4;

 return km * factor;

}
