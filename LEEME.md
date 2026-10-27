# Flete TDL – versión con tarifas reales

## Cómo instalarla
1. En tu repo, reemplaza: `index.html`, `app.js`, `style.css`, `router.js`, `geocoder.js`, `tariffs.js`, `toll_detector.js`.
2. Agrega el archivo nuevo `casetas_data.js`.
3. Deja `logo.png` y `manifest.json` como están.
4. `dataset_tolls.js` ya no se carga (pesaba 316 KB). Puedes borrarlo o guardarlo solo para regenerar los datos.
5. Si la app ya estaba instalada en el teléfono, ábrela y recárgala una vez para que no use archivos viejos en caché.

## Cómo funciona el costo de casetas
- Detecta las casetas a menos de 150 m de la ruta (más lejos suelen ser ramales o incorporaciones) (mide contra el trazo, no contra puntos sueltos).
- Con tarifa: 104 casetas de la red FONADIN y Fideicomiso 358 (CAPUFE), camión de 2 a 9 ejes, vigentes desde 13-abr-2026. 61 tienen ubicación en el mapa y se detectan; las demás (ver lista en la PR) aún no.
- Extras de Traza tu ruta (`tarifas_extra.json`): casetas de las rutas México–Tijuana por el Pacífico y México–Cd. Juárez (consulta 24-oct-2026, solo 5 ejes). Para los demás ejes el precio se estima con la proporción mediana de CAPUFE y se marca "precio estimado". Para agregar más, se añade la caseta al JSON (nombre, tramo, precio de 5 ejes y, para ubicarla, `osm`+`cerca` o una coordenada `xy`).
- No incluida: Red Concesionada (tarifas de jul-2023), autopistas privadas y estatales: salen como estimadas si OpenStreetMap las tiene.
- Sin tarifa: plazas de OpenStreetMap que cruza la ruta. Se estiman con la mediana de las tarifas conocidas para esos ejes y se marcan "(est.)".
- En "Casetas en ruta" cada caseta tiene una casilla: desmarca las que no correspondan (ramal, repetida) y el costo y los precios se recalculan; la imagen de costos solo incluye las marcadas.
- Las estimadas a menos de 3 km de otra caseta detectada, o con el mismo nombre, se descartan por repetidas.
- "Pasar por (opcional)": ciudades intermedias separadas por `;` para obligar a la ruta a seguir otro camino (ej. `Acayucan` para ir por Veracruz en vez de Oaxaca).
- Desde CDMX a la zona de Guadalajara la ruta se fuerza por Palmillas, Apaseo el Grande y Salamanca (como Traza tu ruta); la lógica está en `guadalajaraDesdeCdmx()` de `router.js`.
- Origen, destino y "Pasar por" aceptan coordenadas copiadas de Google Maps, ej. `29.4387748, -106.4221653` (latitud, longitud), sin buscar la dirección.
- En "Pasar por" también puedes escribir nombres de casetas de la base (ej. `Palmillas; Chichimequillas`).
- Desde CDMX hacia el norte (Bajío, SLP, Monterrey, Reynosa, Torreón, Chihuahua, Juárez) la ruta se fuerza por la autopista México–Querétaro, pasando por Palmillas y Chichimequillas; el Arco Norte solo se usa viniendo de Puebla. Si escribes tus propios puntos en "Pasar por", no se agrega nada automático. La regla está en `norteDesdeCdmx()` de `router.js`.
- Solo se cobran casetas con tarifa en la base. Las plazas de OpenStreetMap sin tarifa ya no se estiman (daban falsos positivos); si falta una caseta, se agrega a `tarifas_extra.json`.
- Atlacomulco/Querétaro no se cobra saliendo de CDMX (es una incorporación a la 57D); sí viniendo de Toluca. Pendiente: revisar la ruta CDMX–Tijuana por el Pacífico, que según el usuario sigue la 57D hasta Apaseo el Grande.
- Agualeguas y Vallecitos (Mex 85D) no se suman: el cobro de Sabinas ya es el de toda la autopista.
- Fortín (sin ubicación en el mapa) se cobra siempre que la ruta pase por Esperanza (Puebla) y Cuitláhuac; la regla está en `IMPLICITAS` de `toll_detector.js`.
- Redes cerradas con boleto (Los Cabos: San José del Cabo, Aeropuerto, El Mangle, San Lucas; y la Chamapa–Lechería (La Venta (Huixquilucan), Interlomas, Huixquilucan, Chamapa, Cipreses, San Mateo Nopala, Lomas Verdes, Madín, Atizapán, Lago de Guadalupe, Lechería): red cerrada con boleto. Se cobra una sola vez la tarifa del par entrada–salida (primer y último nodo que toca la ruta); con un solo nodo no se cobra. Lista en `REDES` de `toll_detector.js`.
- Incorporaciones y anexos (Jorobas, Polotitlán, Huachichil) no se cobran en ruta por la autopista principal. Tres Marías, Xochitepec y Alpuyeca (tramos parciales de la México–Acapulco) también son incorporaciones. Ixtapaluca (misma plaza que Chalco) nunca se cobra aparte. Ciudad Valles–Tamuín (tramos de enlace de $221 y $154) nunca se cobra: en La Calera se cobra una sola vez, la de Ent. San Juan–Ent. la Pitahaya ($375). Jorobas, Polotitlán, Huachichil, Tres Marías, Xochitepec y Alpuyeca solo cuentan si el viaje sale o llega a menos de 10 km de ellas. Se cambia en `INCORPORACIONES` de `toll_detector.js`.
- San Marcos (México–San Martín Texmelucan) ya incluye Chalco e Ixtapaluca: si pasa por San Marcos no se suman aparte, igual que en Traza tu ruta.
- Si una caseta cobra por varios tramos, usa el tramo de mayor precio y lo muestra en pantalla para que lo revises.
- Sin ruta calculada (km escritos a mano) usa el estimado por km de antes.
- "Costo adicional" se suma al costo total antes de los márgenes de 15, 30 y 45 %.

## Tiempo, chofer y precios
- Velocidad promedio según ejes: 2 a 3 ejes, 90 km/h; 4 a 6 ejes, 65 km/h; 7 o más, 45 km/h. Se cambia en `velocidadPromedio()` de `app.js`.
- Gastos de viaje y chofer: $1,800 por cada 12 h de viaje. Un bloque iniciado cuenta completo (12.1 h = 2 bloques = $3,600). Se suman al costo antes de los márgenes de 15, 30 y 45 %. Se cambian en `GASTO_CHOFER_POR_BLOQUE` y `HORAS_POR_BLOQUE`.
- Precio por km: $32 hasta 300 km, $38 hasta 700 km y $42 arriba de 700 km.
- Aviso de casetas: solo aplica a las marcadas (est.), que son aproximadas y pueden costar hasta 9 % más. Se muestra en pantalla y en la imagen de costos, sin sumarse al total. Se cambia en `AJUSTE_CASETAS_MAX` de `app.js`.
- Botón "Generar imagen de costos (uso interno)": imagen con el costo operativo, cada caseta con tarifa, una sola línea con la suma de las estimadas, y los precios sugeridos. No es para el cliente.

## Cómo actualizar tarifas
Cuando salga un PDF nuevo de CAPUFE:
1. `python3 parse_pdf.py` lee el PDF y genera `rows.json` (ajusta las rutas dentro del script).
2. `python3 pdf_a_csv.py rows.json tarifas.csv` lo convierte al CSV (nombres de plazas en `NOMBRES`).
3. `python3 build_casetas.py tarifas.csv dataset_tolls.js casetas_data.js` genera los datos de la app (`dataset_tolls.js` es la base de OpenStreetMap).

- Palmillas Bis, Querétaro Bis y San Marcos Bis (casetas complementarias que se abren para desahogar tráfico), Chamapa–Lechería (nombre de la autopista) y Lechería Retorno no están en la base: se excluyen en `EXCLUIR` de `build_casetas.py`.

- Las imágenes (costos y cotización) incluyen un mapa de la ruta con fondo de calles de OpenStreetMap (`mapa_imagen.js`). Los mosaicos se bajan en el momento; si no cargan, el mapa sale con fondo liso. En la imagen de costos las casetas cobradas van numeradas en el mapa y en la lista.

- Aeropuerto y Central de Abastos (Cuernavaca) son ramales junto a la 95D: solo cuentan si el viaje sale o llega a menos de 5 km de ellas. Las claves de `INCORPORACIONES` que empiezan con `=` buscan el nombre exacto (para no confundir Aeropuerto con Aeropuerto Los Cabos).

- La caseta de $222 que CAPUFE llama Ing. Francisco Velasco Durán se muestra como "Alpuyeca (95D)" (así la llama Traza tu ruta); `RENOMBRAR` en `build_casetas.py`. "Alpuyeca" a secas (tramos de $153 y $50) es la incorporación.

- Origen, Destino y "Pasar por" aceptan Plus Codes de Google: completos (`76F2GP97+MG`, sin buscar nada) o cortos con la localidad que muestra Google (`H25W+RH6 Chihuahua`; la localidad se busca en el mapa y se calcula el punto exacto). Un código corto sin localidad da un aviso. Código en `geocoder.js`.

- Rutas sin cruzar a EE.UU.: entre Baja California/noroeste de Sonora y Ciudad Juárez la ruta se fuerza por México (Mexicali, San Luis Río Colorado, Santa Ana, Magdalena, Cananea, Agua Prieta, Janos y Ascensión), como Traza tu ruta. Además, si origen y destino están en México y el trazo entra a EE.UU., el estado avisa "La ruta cruza a EE.UU." (frontera aproximada de Tijuana a Cd. Juárez). Código en `router.js`.

## No cruzar a EE.UU. (PR 33)
Si origen y destino están en México y el trazo de OSRM entra a EE.UU. (se compara contra la frontera completa, Tijuana–Matamoros, con margen de 12 km), la app agrega como puntos de paso las ciudades fronterizas/de enlace cercanas al tramo (lista `CIUDADES_FRONTERA` en router.js) y recalcula, hasta 3 intentos, conservando la ruta con menos puntos en EE.UU. Si aun así cruza, muestra la advertencia. Los puntos de «Pasar por» del usuario se respetan. La frontera es aproximada.

## Baja California → noreste/Chihuahua (PR 34)
Ensenada/Tijuana/Mexicali → Chihuahua, Torreón, Monterrey, Tamaulipas (y al revés) se fuerzan por México como Traza tu ruta: Mexicali, San Luis Río Colorado, Santa Ana, Magdalena, Cananea, Agua Prieta, Janos, Galeana, Ojo Laguna, Sacramento (`bajaYNoreste`). Se agregaron las casetas Galeana ($232) y Nuevo Progreso ($293), que faltaban.

## Tapachula → Tijuana (PR 36)
- Con puntos en «Pasar por» (ej. Villahermosa, Matamoros) y destino al noroeste, si el trazo entra a EE.UU. se combinan esos puntos con el corredor por México (ordenados por distancia al origen) y se recalcula.
- Casetas agregadas (precios 5 ejes de Traza): Jiquipilas $95, Ocozocuautla $184 (antes iba mezclada con Ocuilapa $264), La Antigua $314, Nautla $93, Tecolutla $89, Puente Tampico $140. «Tampico» ($127) pasó a ser el Libramiento Poniente de Tampico.
- Malpasito: solo el tramo Raudales–Malpasito ($125). Paso del Toro: $243 si el viaje sigue al norte por Cardel; $288 solo si llega a Veracruz.
- Arriaga $173 y Tuxpam $273 agregadas con Plus Code (744F+VR, QG38+6W). Falta ubicar Tierra y Libertad $331.
