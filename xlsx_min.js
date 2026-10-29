// Generador mínimo de archivos .xlsx (sin librerías ni internet): zip sin compresión + XML de hoja de cálculo.
// crearXlsx(nombreHoja, encabezados, filas, anchos) -> Uint8Array
// Cada celda de "filas" puede ser: texto, número, o {n: número, f: "dinero"} para formato $#,##0.00
const XLSX_CRC=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})()
function xlsxCrc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=XLSX_CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function xlsxEsc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"")}
function xlsxCol(i){let s="";i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}
function xlsxZip(archivos){
 const enc=new TextEncoder(),partes=[],central=[]
 let pos=0
 const u16=n=>[n&255,(n>>>8)&255], u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]
 archivos.forEach(([nombre,texto])=>{
  const nb=enc.encode(nombre),datos=typeof texto==="string"?enc.encode(texto):texto,crc=xlsxCrc32(datos)
  const loc=new Uint8Array([0x50,0x4b,3,4,...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(datos.length),...u32(datos.length),...u16(nb.length),...u16(0)])
  partes.push(loc,nb,datos)
  central.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(datos.length),...u32(datos.length),...u16(nb.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(pos)]),nb)
  pos+=loc.length+nb.length+datos.length
 })
 let tamC=0;central.forEach(c=>tamC+=c.length)
 const fin=new Uint8Array([0x50,0x4b,5,6,...u16(0),...u16(0),...u16(archivos.length),...u16(archivos.length),...u32(tamC),...u32(pos),...u16(0)])
 const todo=[...partes,...central,fin]
 let total=0;todo.forEach(p=>total+=p.length)
 const out=new Uint8Array(total);let o=0;todo.forEach(p=>{out.set(p,o);o+=p.length})
 return out
}
function crearXlsx(nombreHoja,encabezados,filas,anchos){
 const celda=(v,r,c,estilo)=>{
  const ref=xlsxCol(c)+r
  if(v===null||v===undefined||v==="") return ""
  if(typeof v==="object"&&v.n!==undefined) return `<c r="${ref}" s="2"><v>${v.n}</v></c>`
  if(typeof v==="number") return `<c r="${ref}" s="${estilo||0}"><v>${v}</v></c>`
  return `<c r="${ref}" t="inlineStr" s="${estilo||0}"><is><t xml:space="preserve">${xlsxEsc(v)}</t></is></c>`
 }
 let filasXml=`<row r="1">`+encabezados.map((h,c)=>celda(h,1,c,1)).join("")+`</row>`
 filas.forEach((f,i)=>{filasXml+=`<row r="${i+2}">`+f.map((v,c)=>celda(v,i+2,c,0)).join("")+`</row>`})
 const cols=(anchos||[]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join("")
 const hoja=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${filasXml}</sheetData></worksheet>`
 const estilos=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B1F3A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`
 return xlsxZip([
  ["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
  ["_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
  ["xl/workbook.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xlsxEsc(nombreHoja)}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
  ["xl/_rels/workbook.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
  ["xl/styles.xml",estilos],
  ["xl/worksheets/sheet1.xml",hoja]
 ])
}

// ---- Lectura de .xlsx (los que genera esta app y los guardados por Excel, con compresión) ----
// leerXlsx(ArrayBuffer) -> Promise<Array<Array<string|number>>> (filas de la primera hoja; celdas vacías = "")
async function leerXlsx(buf){
 const dv=new DataView(buf),u8=new Uint8Array(buf),dec=new TextDecoder()
 let eocd=-1
 for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-70000);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
 if(eocd<0) throw new Error("El archivo no es un Excel (.xlsx)")
 const n=dv.getUint16(eocd+10,true);let p=dv.getUint32(eocd+16,true)
 const entradas={}
 for(let k=0;k<n;k++){
  if(dv.getUint32(p,true)!==0x02014b50) break
  const metodo=dv.getUint16(p+10,true),comp=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true)
  entradas[dec.decode(u8.subarray(p+46,p+46+nl))]={metodo,comp,off}
  p+=46+nl+el+cl
 }
 const leer=async nombre=>{
  const e=entradas[nombre];if(!e) return null
  const nl=dv.getUint16(e.off+26,true),el=dv.getUint16(e.off+28,true),ini=e.off+30+nl+el
  let datos=u8.subarray(ini,ini+e.comp)
  if(e.metodo===8){
   if(typeof DecompressionStream==="undefined") throw new Error("Este navegador no puede abrir ese Excel; usa el archivo tal como se descargó de la app")
   datos=new Uint8Array(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer())
  }else if(e.metodo!==0) throw new Error("Formato de compresión no compatible")
  return dec.decode(datos)
 }
 const hojas=Object.keys(entradas).filter(x=>/^xl\/worksheets\/sheet\d+\.xml$/.test(x)).sort((a,b)=>parseInt(a.match(/\d+/)[0])-parseInt(b.match(/\d+/)[0]))
 if(!hojas.length) throw new Error("El Excel no tiene hojas")
 const parse=t=>new DOMParser().parseFromString(t,"application/xml")
 const compartidas=[]
 const sst=await leer("xl/sharedStrings.xml")
 if(sst) Array.from(parse(sst).getElementsByTagName("si")).forEach(si=>{compartidas.push(Array.from(si.getElementsByTagName("t")).map(t=>t.textContent).join(""))})
 const doc=parse(await leer(hojas[0]))
 const filas=[]
 Array.from(doc.getElementsByTagName("row")).forEach(row=>{
  const fila=[]
  Array.from(row.getElementsByTagName("c")).forEach(c=>{
   const m=(c.getAttribute("r")||"").match(/^([A-Z]+)/);if(!m) return
   let col=0;for(const ch of m[1]) col=col*26+ch.charCodeAt(0)-64
   col--
   const t=c.getAttribute("t"),v=c.getElementsByTagName("v")[0]
   let val=""
   if(t==="inlineStr") val=Array.from(c.getElementsByTagName("t")).map(x=>x.textContent).join("")
   else if(v){
    if(t==="s") val=compartidas[parseInt(v.textContent)]||""
    else if(t==="str"||t==="b"||t==="e") val=v.textContent
    else{const x=parseFloat(v.textContent);val=isNaN(x)?v.textContent:x}
   }
   fila[col]=val
  })
  for(let i=0;i<fila.length;i++) if(fila[i]===undefined) fila[i]=""
  filas.push(fila)
 })
 return filas
}
