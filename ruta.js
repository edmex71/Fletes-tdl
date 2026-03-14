
let map
let routeLayer
let routeCoords=[]
let autopistasDetectadas=[]
let tollMarkers=[]

function initMap(){
 if(map) return
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

 if(routeLayer) map.removeLayer(routeLayer)
 routeLayer=L.geoJSON(r.routes[0].geometry).addTo(map)
 map.fitBounds(routeLayer.getBounds())

 detectarAutopistas()
 buscarCasetas()

}

async function detectarAutopistas(){

 let lats=routeCoords.map(p=>p[1])
 let lons=routeCoords.map(p=>p[0])

 let south=Math.min(...lats)
 let north=Math.max(...lats)
 let west=Math.min(...lons)
 let east=Math.max(...lons)

 let query=`
 [out:json];
 way["highway"="motorway"](${south},${west},${north},${east});
 out tags;
 `

 let url="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(query)
 let res=await fetch(url)
 let data=await res.json()

 autopistasDetectadas=[]

 data.elements.forEach(w=>{
   if(w.tags?.ref){
     if(!autopistasDetectadas.includes(w.tags.ref)){
        autopistasDetectadas.push(w.tags.ref)
     }
   }
 })

}

function distanciaSegmento(px,py,x1,y1,x2,y2){

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

async function buscarCasetas(){

 document.getElementById("precios").innerHTML="⏳ Buscando casetas..."

 let lats=routeCoords.map(p=>p[1])
 let lons=routeCoords.map(p=>p[0])

 let south=Math.min(...lats)
 let north=Math.max(...lats)
 let west=Math.min(...lons)
 let east=Math.max(...lons)

 let query=`
 [out:json];
 node["barrier"="toll_booth"](${south},${west},${north},${east});
 out;
 `

 let url="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(query)
 let res=await fetch(url)
 let data=await res.json()

 let usadas=[]
 let total=0

 data.elements.forEach(n=>{

   let min=999

   for(let i=0;i<routeCoords.length-1;i++){
     let p1=routeCoords[i]
     let p2=routeCoords[i+1]
     let d=distanciaSegmento(n.lon,n.lat,p1[0],p1[1],p2[0],p2[1])
     if(d<min) min=d
   }

   if(min<5){

     let nombre=n.tags?.name || "Caseta"
     let tarifa=window.obtenerTarifa(nombre)

     usadas.push({name:nombre,costo:tarifa})

     let m=L.marker([n.lat,n.lon]).addTo(map)
     m.bindPopup(nombre+" $"+tarifa)
     tollMarkers.push(m)

     total+=tarifa
   }

 })

 window.casetasDetectadas=usadas
 window.casetasCosto=total

 document.getElementById("precios").innerHTML="Casetas detectadas: "+usadas.length

}
