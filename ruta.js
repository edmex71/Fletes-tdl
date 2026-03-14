
let map
let routeLayer
let routeCoords=[]
let tollMarkers=[]

function initMap(){
if(map)return
map=L.map('map').setView([23,-102],5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map)
}

async function calcularRuta(){

initMap()

let origen=document.getElementById("origen").value
let destino=document.getElementById("destino").value

let o=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(origen))
let od=await o.json()

let d=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(destino))
let dd=await d.json()

let oLat=od[0].lat
let oLon=od[0].lon
let dLat=dd[0].lat
let dLon=dd[0].lon

let route=await fetch("https://router.project-osrm.org/route/v1/driving/"+oLon+","+oLat+";"+dLon+","+dLat+"?overview=full&geometries=geojson")
let r=await route.json()

routeCoords=r.routes[0].geometry.coordinates

let km=r.routes[0].distance/1000
document.getElementById("km").value=km.toFixed(0)

if(routeLayer)map.removeLayer(routeLayer)
routeLayer=L.geoJSON(r.routes[0].geometry).addTo(map)
map.fitBounds(routeLayer.getBounds())

detectarCasetas()

}

function segDist(px,py,x1,y1,x2,y2){

let A=px-x1
let B=py-y1
let C=x2-x1
let D=y2-y1

let dot=A*C+B*D
let len=C*C+D*D
let param=len!=0?dot/len:-1

let xx,yy

if(param<0){xx=x1;yy=y1}
else if(param>1){xx=x2;yy=y2}
else{xx=x1+param*C;yy=y1+param*D}

let dx=px-xx
let dy=py-yy

return Math.sqrt(dx*dx+dy*dy)*111
}

function limpiarCasetas(){
tollMarkers.forEach(m=>map.removeLayer(m))
tollMarkers=[]
}

function detectarCasetas(){

limpiarCasetas()

let usadas=[]
let total=0

CAPUFE_CASETAS.forEach(c=>{

let min=999

for(let i=0;i<routeCoords.length-1;i++){
let p1=routeCoords[i]
let p2=routeCoords[i+1]
let d=segDist(c.lon,c.lat,p1[0],p1[1],p2[0],p2[1])
if(d<min)min=d
}

if(min<6){

usadas.push(c)

let m=L.marker([c.lat,c.lon]).addTo(map)
m.bindPopup(c.n+" $"+c.c)
tollMarkers.push(m)

total+=c.c

}

})

window.casetasDetectadas=usadas.map(x=>({name:x.n,costo:x.c}))
window.casetasCosto=total

}
