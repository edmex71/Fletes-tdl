
// corredor CDMX - Guadalajara
TARIFAS["TEPOTZOTLAN"]={5:178,6:210}
TARIFAS["PALMILLAS"]={5:92,6:110}
TARIFAS["QUERETARO"]={5:185,6:220}
TARIFAS["CELAYA"]={5:145,6:175}
TARIFAS["SALAMANCA"]={5:170,6:205}
TARIFAS["IRAPUATO"]={5:178,6:215}
TARIFAS["LA BARCA"]={5:165,6:195}
TARIFAS["OCOTLAN"]={5:110,6:135}



function calcularCasetasEstimadas(km){

 let factor = 2.6;

 if(km < 200) factor = 2.2;
 else if(km < 500) factor = 2.5;
 else if(km < 900) factor = 2.8;
 else if(km < 1400) factor = 3.1;
 else factor = 3.4;

 return km * factor;

}
