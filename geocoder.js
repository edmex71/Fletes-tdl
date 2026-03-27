const CASETAS = typeof CASETAS_NACIONALES !== 'undefined' ? CASETAS_NACIONALES : [];

async function geocode(city){
 const url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
 const r=await fetch(url)
 const data=await r.json()
 if(!data.length) throw "Ciudad no encontrada"
 return [parseFloat(data[0].lon),parseFloat(data[0].lat)]
}
