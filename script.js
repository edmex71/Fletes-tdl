
async function iniciarMotor(ruta){
 const casetas = await cargarCasetas();
 const detectadas = detectarCasetasRuta(ruta, casetas);
 console.log(detectadas);
 return detectadas;
}


function mostrarAnalisis(){
 const el=document.getElementById('analizando');
 if(el){ el.innerHTML='Analizando casetas...'; }
}
