async function geocode(lugar){
 const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q="+encodeURIComponent(lugar)
 const r=await fetch(url)
 if(!r.ok) throw "No se pudo buscar \""+lugar+"\" (error "+r.status+")"
 const data=await r.json()
 if(!data.length) throw "Lugar no encontrado: "+lugar
 return [parseFloat(data[0].lon),parseFloat(data[0].lat)]
}
