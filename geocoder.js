
async function geocode(city){
 const url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
 const r=await fetch(url)
 const data=await r.json()
 if(!data.length) throw "Ciudad no encontrada"
 return [parseFloat(data[0].lon),parseFloat(data[0].lat)]
}


function estimarCasetas(km){

 let factor = 2.3

 if(km>250) factor = 2.5
 if(km>600) factor = 2.8
 if(km>900) factor = 3.1
 if(km>1200) factor = 3.4

 return km * factor

}
