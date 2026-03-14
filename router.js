
function calcularRuta(){
 setEstado("Calculando ruta...");
 const o=document.getElementById("origen").value;
 const d=document.getElementById("destino").value;

 let km=0;

 if(o.toLowerCase().includes("cdmx") && d.toLowerCase().includes("queretaro")){
   km=234;
 }

 if(o.toLowerCase().includes("cdmx") && d.toLowerCase().includes("puebla")){
   km=130;
 }

 if(km===0) km=200;

 document.getElementById("km").value=km;
 setEstado("Ruta calculada");
}
