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
- Extras de Traza tu ruta (`tarifas_extra.json`): casetas de la ruta México–Tijuana por el Pacífico (consulta 24-oct-2026, solo 5 ejes). Para los demás ejes el precio se estima con la proporción mediana de CAPUFE y se marca "precio estimado". Para agregar más, se añade la caseta al JSON (nombre, tramo, precio de 5 ejes, nombre en OpenStreetMap y coordenada aproximada).
- No incluida: Red Concesionada (tarifas de jul-2023), autopistas privadas y estatales: salen como estimadas si OpenStreetMap las tiene.
- Sin tarifa: plazas de OpenStreetMap que cruza la ruta. Se estiman con la mediana de las tarifas conocidas para esos ejes y se marcan "(est.)".
- En "Casetas en ruta" cada caseta tiene una casilla: desmarca las que no correspondan (ramal, repetida) y el costo y los precios se recalculan; la imagen de costos solo incluye las marcadas.
- Las estimadas a menos de 3 km de otra caseta detectada, o con el mismo nombre, se descartan por repetidas.
- "Pasar por (opcional)": ciudades intermedias separadas por `;` para obligar a la ruta a seguir otro camino (ej. `Acayucan` para ir por Veracruz en vez de Oaxaca).
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
