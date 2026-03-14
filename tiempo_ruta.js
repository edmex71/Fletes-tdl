
function calcularTiempo(km){
let horas = km/60;
let h = Math.floor(horas);
let m = (horas-h)*60;

if(m<=30){m=30;}
else{h+=1;m=0;}

if(m===0){return h+" h";}
return h+" h "+m+" min";
}
