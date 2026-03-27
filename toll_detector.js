
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
   return {
      total:0,
      lista:[]
   }
}
)

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


function calcularCasetasEstimadas(km){

 let factor = 2.6;

 if(km < 200) factor = 2.2;
 else if(km < 500) factor = 2.5;
 else if(km < 900) factor = 2.8;
 else if(km < 1400) factor = 3.1;
 else factor = 3.4;

 return km * factor;

}
