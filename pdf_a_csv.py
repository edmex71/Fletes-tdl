# Convierte rows.json (PDF CAPUFE abr-2026) al CSV que lee build_casetas.py
import json, csv, re, sys
R = json.load(open(sys.argv[1])); OUT = sys.argv[2]
NOMBRES = {  # nombre PDF -> nombre usado por la base (igual al de 2025 cuando es la misma plaza)
 'ACAYUCAN (SAYULA)':'Acayucan','ESTACION DON':'Estacion Don (La Jaula)','LA VENTA (AGUADULCE)':'Sanchez Magallanes (Aguadulce)',
 'LIB. CD. OBREGON (LICO)':'Libramiento de Cd. Obregon (Lico)','TRES MARIAS "A" Y "B"':'Tres Marias "A"',
 'JOROBAS (CEM)':'Jorobas','SAN MARTIN':'San Martin a Puebla','ENT. AMOZOC III':'Amozoc-Perote','HUITZO DIRECTA':'Huitzo',
 'HUITZO INTERMEDIA':'Huitzo','HUITZO BIS':'Huitzo','PLAYAS':'Playas de Tijuana','CABO SAN LUCAS':'San Lucas',
 'ING. FRANCISCO VELASCO DURAN':'Ing. Francisco Velasco Durán','CHAMAPA-LECHERIA':'Chamapa-Lecheria',
 'SAYULA TRONCAL':'Sayula Troncal','SAYULA REMOTA':'Sayula Remota','LIBRAMIENTO PONIENTE DE ACAPULCO':'Libramiento Poniente de Acapulco',
 'LIBRAMIENTO DE VILLAHERMOSA':'Libramiento de Villahermosa','LIBRAMIENTO ORIENTE DE CHIHUAHUA':'Libramiento Oriente de Chihuahua',
 'CIUDAD VALLES-TAMUÍN':'Ciudad Valles-Tamuin','LECHERIA RETORNO':'Lecheria Retorno','RETORNO':'Lecheria Retorno',
 'ACATLÁN':'Acatlan','LA CALERA':'La Calera Tamuin','OCOZOCOAUTLA (OCUILAPA)':'Ocozocoautla (Ocuilapa)',
}
MIN = {'de','del','la','las','los','el','y','a','al'}
def titulo(s):
    out=[]
    for w in re.split(r'(\s+|-)', re.sub(r'\.(?=\w)','. ',s.strip())):
        if not w or w.isspace() or w=='-': out.append(w); continue
        if re.fullmatch(r'\(?\s*[A-Z]\d?\s*\)?',w) and len(w)<=5 and w.strip('() ').isalnum() and len(w.strip('() '))<=2: out.append(w.upper()); continue
        lw=w.lower()
        if lw in MIN and out and out[-1].isspace(): out.append(lw)
        elif lw in('ent.','lib.','blvd.','cd.','ing.','cem'): out.append(lw.capitalize() if lw!='cem' else 'CEM')
        else: out.append(lw.capitalize())
    return re.sub(r'\s+',' ',''.join(out))
cols='casetas,tramo_que_cobra,tipo,en_vigor_partir_de,hasta,motos,autos,autobus_2_ejes,autobus_3_ejes,autobus_4_ejes,camion_2_ejes,camion_3_ejes,camion_4_ejes,camion_5_ejes,camion_6_ejes,camion_7_ejes,camion_8_ejes,camion_9_ejes,eje_extra_automovil,eje_extra_camion'.split(',')
def f(v): return '' if v is None else v
n=0; omit=[]
w=csv.writer(open(OUT,'w',newline='',encoding='utf-8')); w.writerow(cols)
for r in R:
    if r['tipo'] not in('caseta','puente') or r['seccion'] not in('fonadin','fideicomiso358'): continue
    if r['nombre']=='***' and 'FORTIN' in r['tramo'].upper(): r=dict(r,nombre='Fortin')
    if all(r['C%d'%e] is None for e in range(2,10)): omit.append(r['nombre']+' | '+r['tramo']+' (sin tarifa C2-C9)'); continue
    nom = NOMBRES.get(r['nombre']) or titulo(r['nombre'])
    row=[nom, (titulo(r['tramo']) if not re.fullmatch(r'\(\d+\)',r['tramo'].strip()) else nom), 'Puente' if r['tipo']=='puente' else 'Camino','2026-04-13','',
         f(r['M']),f(r['A']),f(r['B2']),f(r['B3']),f(r['B4'])]+[f(r['C%d'%e]) for e in range(2,10)]+[f(r['EEA']),f(r['EEC'])]
    w.writerow(row); n+=1
print(n,'filas'); print('omitidas:',omit)
