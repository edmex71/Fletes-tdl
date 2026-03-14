
async function detectarCasetas(){

let bbox="-117,14,-86,33"

let query=`
[out:json];
node["amenity"="toll_booth"](${bbox});
out;
`

let r=await fetch("https://overpass-api.de/api/interpreter",{
method:"POST",
body:query
})

let data=await r.json()

let casetas=data.elements

let total=0
let lista=[]

casetas.forEach(c=>{

window.routeCoords.forEach(coord=>{

let lat=coord[1]
let lon=coord[0]

let d=Math.sqrt((lat-c.lat)**2+(lon-c.lon)**2)

if(d<0.02){
lista.push(c)
total+=550
}

})

})

window.casetasTotal=total
window.casetasLista=lista
}
