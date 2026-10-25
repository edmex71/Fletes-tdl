// Acepta coordenadas copiadas de Google Maps: "29.4387748, -106.4221653" (latitud, longitud).
function leerCoordenadas(texto){
 const m=/^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(texto||"")
 if(!m) return null
 const lat=parseFloat(m[1]), lon=parseFloat(m[2])
 if(Math.abs(lat)>90||Math.abs(lon)>180) return null
 return [lon,lat]
}

async function geocode(lugar){
 const c=leerCoordenadas(lugar)
 if(c) return c
 const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q="+encodeURIComponent(lugar)
 const r=await fetch(url)
 if(!r.ok) throw "No se pudo buscar \""+lugar+"\" (error "+r.status+")"
 const data=await r.json()
 if(!data.length) throw "Lugar no encontrado: "+lugar
 return [parseFloat(data[0].lon),parseFloat(data[0].lat)]
}
