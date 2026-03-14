
function estado(txt){
 const el=document.getElementById('estadoMotor');
 if(el){el.innerHTML=txt;}
}

function inicioAnalisis(){
 estado("🔍 Analizando casetas...");
}

function finAnalisis(c){
 estado("✅ Casetas detectadas: "+c);
}

function sinCasetas(){
 estado("⚠️ No se detectaron casetas");
}


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
