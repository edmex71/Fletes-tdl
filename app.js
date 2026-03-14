
window.onload=()=>{initMap();}

function setEstado(t){
 document.getElementById("estado").innerText=t;
}

function calcularFlete(){

 setEstado("Analizando casetas...");

 const km=parseFloat(document.getElementById("km").value);
 const diesel=parseFloat(document.getElementById("diesel").value);

 const casetas=detectarCasetas();

 let total=0;
 let lista="";

 casetas.forEach(c=>{

 const precio=TARIFAS[c]||0;

 total+=precio;

 lista+=c+" $"+precio+"<br>";

 });

 const dieselCosto=km*0.35*diesel;

 const html=`
 <h3>COSTO OPERATIVO</h3>
 Km: ${km}<br>
 Diesel: $${Math.round(dieselCosto)}<br>
 Casetas: $${total}<br><br>
 <b>Casetas</b><br>
 ${lista}
 `;

 document.getElementById("resultado").innerHTML=html;

 setEstado("Casetas detectadas: "+casetas.length);

}

function borrar(){

 document.getElementById("origen").value="";
 document.getElementById("destino").value="";
 document.getElementById("km").value="";
 document.getElementById("resultado").innerHTML="";

 setEstado("Sistema listo");

}
