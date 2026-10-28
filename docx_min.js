// Cotización en Word (.docx real, sin librerías). Usa xlsxZip de xlsx_min.js.
function docxEsc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"")}
function numeroALetras(n){
 const U=["","UN","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE","DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE","VEINTE","VEINTIUNO","VEINTIDÓS","VEINTITRÉS","VEINTICUATRO","VEINTICINCO","VEINTISÉIS","VEINTISIETE","VEINTIOCHO","VEINTINUEVE"]
 const D=["","","","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"]
 const C=["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"]
 function menos1000(n){
  if(n===0) return ""
  if(n===100) return "CIEN"
  let t=""
  if(n>=100){t=C[Math.floor(n/100)]+" ";n%=100}
  if(n<30) t+=U[n]
  else{t+=D[Math.floor(n/10)];if(n%10) t+=" Y "+U[n%10]}
  return t.trim()
 }
 function entero(n){
  if(n===0) return "CERO"
  let t=""
  const mill=Math.floor(n/1000000);n%=1000000
  const mil=Math.floor(n/1000);n%=1000
  if(mill) t+=(mill===1?"UN MILLÓN":menos1000(mill)+" MILLONES")+" "
  if(mil) t+=(mil===1?"MIL":menos1000(mil)+" MIL")+" "
  t+=menos1000(n)
  return t.trim()
 }
 const e=Math.floor(n+1e-9),c=Math.round((n-e)*100)
 return entero(e)+(e>=1000000&&e%1000000===0?" DE":"")+" PESOS "+String(c).padStart(2,"0")+"/100 MONEDA NACIONAL"
}
// d: {ciudad, fechaTexto, atencion, asunto, origen, destino, fechaCarga, unidad, mercancia[], precio(number), incluye, vigencia, pago, noIncluye, redondo}
function crearDocxCotizacion(d,logoBytes){
 const F='<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>'
 const run=(t,o={})=>'<w:r><w:rPr>'+F+(o.b?'<w:b/>':'')+(o.i?'<w:i/>':'')+'<w:sz w:val="'+(o.sz||22)+'"/>'+(o.color?'<w:color w:val="'+o.color+'"/>':'')+'</w:rPr><w:t xml:space="preserve">'+docxEsc(t)+'</w:t></w:r>'
 const par=(runs,o={})=>'<w:p><w:pPr><w:spacing w:before="'+(o.antes||0)+'" w:after="'+(o.despues===undefined?80:o.despues)+'"/>'+(o.jc?'<w:jc w:val="'+o.jc+'"/>':'')+(o.ind?'<w:ind w:left="'+o.ind+'" w:hanging="'+(o.cuelga||0)+'"/>':'')+'</w:pPr>'+runs+'</w:p>'
 const vineta=(runs)=>par(run("•\t")+runs,{ind:720,cuelga:360,despues:40}).replace('<w:pPr>','<w:pPr><w:tabs><w:tab w:val="left" w:pos="720"/></w:tabs>')
 const titulo=t=>par(run(t,{b:1}),{antes:200,despues:80})
 const EMU=900000
 const logo=!logoBytes?'':'<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+EMU+'" cy="'+EMU+'"/><wp:docPr id="1" name="Logo"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+EMU+'" cy="'+EMU+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>'
 const sinBorde='<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
 const celda=(w,contenido)=>'<w:tc><w:tcPr><w:tcW w:w="'+w+'" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>'+contenido+'</w:tc>'
 const encabezado='<w:tbl><w:tblPr><w:tblW w:w="9500" w:type="dxa"/>'+sinBorde+'</w:tblPr><w:tblGrid><w:gridCol w:w="1700"/><w:gridCol w:w="7800"/></w:tblGrid><w:tr>'+
  celda(1700,par(logo,{despues:0}))+
  celda(7800,par(run("Transportes D’ León",{b:1,sz:44}),{despues:0})+par(run("Servicio Público Federal de Autotransporte de Carga en General",{sz:16,color:"555555"}),{despues:0}))+
  '</w:tr></w:tbl>'
 let b=encabezado
 b+=par(run(d.ciudad+"; "+d.fechaTexto),{jc:"right",antes:360,despues:360})
 b+=par(run(d.atencion,{b:1}),{despues:240})
 b+=par(run("ASUNTO: ",{b:1})+run(d.asunto),{despues:200})
 b+=par(run("En atención a su solicitud, le presentamos la cotización detallada del servicio requerido:"))
 let n=1
 b+=titulo(n++ +". DATOS DEL TRASLADO")
 b+=vineta(run("Origen: "+d.origen))+vineta(run("Destino: "+d.destino))
 if(d.fechaCarga) b+=vineta(run("Fecha estimada de carga: "+d.fechaCarga))
 if(d.redondo) b+=vineta(run("Servicio: viaje redondo (ida y vuelta)"))
 b+=titulo(n++ +". CARACTERÍSTICAS DE LA UNIDAD")
 b+=vineta(run("Tipo: "+d.unidad))
 if(d.mercancia.length){
  b+=titulo(n++ +". MERCANCÍA A TRANSPORTAR")
  d.mercancia.forEach(m=>{b+=vineta(run(m))})
 }
 const monto=d.precio.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})
 b+=titulo(n++ +". PRECIO Y CONDICIONES COMERCIALES")
 b+=vineta(run("Precio total del servicio: ")+run("$"+monto+" MXN ("+numeroALetras(d.precio)+") MÁS IVA",{b:1}))
 if(d.incluye) b+=vineta(run("Incluye: "+d.incluye))
 b+=vineta(run("Vigencia de la cotización: "+d.vigencia+" a partir de la fecha de emisión"))
 if(d.pago) b+=vineta(run("Condiciones de pago: "+d.pago))
 if(d.noIncluye) b+=vineta(run("No incluye: "+d.noIncluye))
 b+=par(run("Atentamente"),{antes:480,despues:600})
 b+=par(run("______________________________"),{despues:0})
 b+=par(run("Lic Edgar D Leon Garcia"),{despues:600})
 b+=par(run("FUENTE DEL MIRADOR # 62, LOMAS DE TECAMACHALCO, NAUCALPAN, ESTADO DE MEXICO, C.P. 53950.    DGED7103222Z6",{sz:16,color:"555555"}),{jc:"center"})
 const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>'+b+'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1000" w:right="1300" w:bottom="1000" w:left="1300" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>'
 const ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
 const rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
 const drels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>'
 const archivos=[["[Content_Types].xml",ct],["_rels/.rels",rels],["word/document.xml",doc],["word/_rels/document.xml.rels",drels]]
 if(logoBytes) archivos.push(["word/media/logo.png",logoBytes])
 return xlsxZip(archivos)
}
