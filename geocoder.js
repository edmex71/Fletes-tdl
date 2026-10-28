// Acepta coordenadas copiadas de Google Maps: "29.4387748, -106.4221653" (latitud, longitud).
function leerCoordenadas(texto){
 const m=/^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(texto||"")
 if(!m) return null
 const lat=parseFloat(m[1]), lon=parseFloat(m[2])
 if(Math.abs(lat)>90||Math.abs(lon)>180) return null
 return [lon,lat]
}

// ---- Plus Codes de Google (Open Location Code): "76F2GP97+MG" (completo) o "H25W+RH6 Chihuahua" (corto + localidad)
const OLC_ALFABETO="23456789CFGHJMPQRVWX"

// {codigo, localidad} si el texto empieza con un Plus Code; null si no lo es
function leerPlusCode(texto){
 const m=/^\s*([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,})(?:\s+(.*))?$/i.exec(texto||"")
 if(!m) return null
 const cod=m[1].toUpperCase(), antes=cod.split("+")[0]
 if(antes.length%2!==0) return null
 return {codigo:cod,completo:antes.length===8,localidad:(m[2]||"").trim()}
}

// Un código completo (8 caracteres antes del +) se convierte sin buscar nada
function requiereBusqueda(texto){
 if(leerCoordenadas(texto)) return false
 const p=leerPlusCode(texto)
 if(p&&p.completo) return false
 return true
}

// Centro de un código completo → [lon,lat]
function decodificarOLC(codigo){
 const c=codigo.replace("+","")
 const res=[20,1,0.05,0.0025,0.000125]
 let lat=0,lon=0
 for(let i=0;i<5&&2*i+1<c.length;i++){
  lat+=OLC_ALFABETO.indexOf(c[2*i])*res[i]
  lon+=OLC_ALFABETO.indexOf(c[2*i+1])*res[i]
 }
 let alto=res[4],ancho=res[4]
 // dígitos extra de precisión: rejilla de 5 filas × 4 columnas
 for(let i=10;i<c.length;i++){
  alto/=5;ancho/=4
  const g=OLC_ALFABETO.indexOf(c[i])
  lat+=Math.floor(g/4)*alto
  lon+=(g%4)*ancho
 }
 return [lon-180+ancho/2,lat-90+alto/2]
}

// Código corto + punto de referencia [lon,lat] (centro de la localidad) → [lon,lat]
function recuperarOLC(codigo,ref){
 const faltan=8-codigo.split("+")[0].length
 const lat0=ref[1]+90, lon0=ref[0]+180
 let prefijo=""
 const pasos=[[20,20],[1,1]]
 for(let i=0;i<faltan/2;i++){
  const a=pasos[i][0]
  const la=Math.floor((lat0%(i?20:180))/a), lo=Math.floor((lon0%(i?20:360))/a)
  prefijo+=OLC_ALFABETO[la]+OLC_ALFABETO[lo]
 }
 const full=prefijo+codigo
 let [lon,lat]=decodificarOLC(full)
 const area=Math.pow(20,2-faltan/2), mitad=area/2
 if(lat>ref[1]+mitad) lat-=area; else if(lat<ref[1]-mitad) lat+=area
 if(lon>ref[0]+mitad) lon-=area; else if(lon<ref[0]-mitad) lon+=area
 return [lon,lat]
}

async function geocode(lugar){
 const c=leerCoordenadas(lugar)
 if(c) return c
 // "Veracruz" a secas devolvía un punto del estado (cerca de Xalapa): se toma la ciudad y puerto de Veracruz
 if(/^(puerto\s+de\s+)?veracruz(,?\s*(ver\.?|veracruz))?$/i.test(lugar.trim())) return [-96.1342,19.1738]
 const pc=leerPlusCode(lugar)
 if(pc){
  if(pc.completo) return decodificarOLC(pc.codigo)
  if(!pc.localidad) throw "El Plus Code \""+pc.codigo+"\" es corto: escribe también la localidad, por ejemplo "+pc.codigo+" Chihuahua"
  const ref=await geocode(pc.localidad)
  return recuperarOLC(pc.codigo,ref)
 }
 const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q="+encodeURIComponent(lugar)
 const r=await fetch(url)
 if(!r.ok) throw "No se pudo buscar \""+lugar+"\" (error "+r.status+")"
 const data=await r.json()
 if(!data.length) throw "Lugar no encontrado: "+lugar
 return [parseFloat(data[0].lon),parseFloat(data[0].lat)]
}
