const CASETAS = typeof CASETAS_NACIONALES !== 'undefined' ? CASETAS_NACIONALES : [];

function dist(a,b){

 const R=6371
 const dLat=(b[1]-a[1])*Math.PI/180
 const dLon=(b[0]-a[0])*Math.PI/180

 const lat1=a[1]*Math.PI/180
 const lat2=b[1]*Math.PI/180

 const x=Math.sin(dLat/2)**2+Math.sin(dLon/2)**2*Math.cos(lat1)*Math.cos(lat2)

 return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))

}

function normalizar(n){

 if(!n) return null

 n=n.toUpperCase()

 n=n.replace(/CASETA DE COBRO/g,"")
 n=n.replace(/CASETA COBRO/g,"")
 n=n.replace(/PLAZA DE COBRO/g,"")
 n=n.replace(/NRO/g,"")
 n=n.replace(/[0-9]/g,"")

 n=n.replace(/\s+/g," ").trim()

 if(n.includes("SAN MARTIN")) return "SAN MARTIN TEXMELUCAN"
 if(n.includes("LIBRAMIENTO ORIENTE") && n.includes("SAN LUIS")) return "LIBRAMIENTO ORIENTE SAN LUIS POTOSI"

 return n

}

const EXCLUIR=[
"CHALCO",
"VIA ATLIXCAYOTL",
"POLOTITLAN",
"JOROBAS"
]

function detectarCasetas(){

 const detectadas=[]

 dataset_tolls.features.forEach(c=>{

 const coord=c.geometry.coordinates
 const nombre=normalizar(c.properties?.name)

 if(!nombre) return
 if(EXCLUIR.includes(nombre)) return

 currentRoute.forEach((p,i)=>{

 if(dist(p,coord)<2){

 detectadas.push({nombre:nombre,pos:i})

 }

 })

 })

 const mapUnique={}

 detectadas.forEach(c=>{

 if(!mapUnique[c.nombre] || mapUnique[c.nombre].pos>c.pos)
   mapUnique[c.nombre]=c

 })

 const arr=Object.values(mapUnique)

 arr.sort((a,b)=>a.pos-b.pos)

 return arr.map(x=>x.nombre)

}
