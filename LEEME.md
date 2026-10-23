# Flete TDL – versión con tarifas reales

## Cómo instalarla
1. En tu repo, reemplaza: `index.html`, `app.js`, `style.css`, `router.js`, `geocoder.js`, `tariffs.js`, `toll_detector.js`.
2. Agrega el archivo nuevo `casetas_data.js`.
3. Deja `logo.png` y `manifest.json` como están.
4. `dataset_tolls.js` ya no se carga (pesaba 316 KB). Puedes borrarlo o guardarlo solo para regenerar los datos.
5. Si la app ya estaba instalada en el teléfono, ábrela y recárgala una vez para que no use archivos viejos en caché.

## Cómo funciona el costo de casetas
- Detecta las casetas a menos de 350 m de la ruta (mide contra el trazo, no contra puntos sueltos).
- Con tarifa: 91 casetas de la red FONADIN, camión de 2 a 9 ejes, vigencia ene-2025. 62 tienen ubicación en el mapa y se detectan.
- Sin tarifa: plazas de OpenStreetMap que cruza la ruta. Se estiman con la mediana de las tarifas conocidas para esos ejes y se marcan "(est.)".
- Si una caseta cobra por varios tramos, usa el tramo de mayor precio y lo muestra en pantalla para que lo revises.
- Sin ruta calculada (km escritos a mano) usa el estimado por km de antes.
- "Costo adicional" se suma al costo total antes de los márgenes de 15, 30 y 45 %.

## Cómo actualizar tarifas
Cuando salga un CSV nuevo:
`python3 build_casetas.py tarifas.csv dataset_tolls.js casetas_data.js`
