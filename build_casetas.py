import csv, json, math, re, sys, unicodedata, collections
CSV, OSM, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

def strip(s):
    s = unicodedata.normalize('NFD', s.upper())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'\(.*?\)', ' ', s)
    s = re.sub(r'\bN\s*[°º]\s*\d*', ' ', s)
    s = re.sub(r'CASETA DE COBROS?|CASETA COBRO|PLAZA DE COBROS?|CASETA DE PEAJE|CABINA DE PEAJE:?|CASETA|CASERA DE COBRO', ' ', s)
    s = re.sub(r'\bN(RO|O|UMERO)\b\.?', ' ', s)
    s = re.sub(r'\bKM\b[\d+ .]*', ' ', s)
    s = re.sub(r'[^A-Z ]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def hav(a, b):
    R = 6371; p1 = math.radians(a[1]); p2 = math.radians(b[1])
    dl = math.radians(b[0]-a[0]); dp = p2-p1
    x = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(x))

ALIAS = {  # clave CSV normalizada -> clave OSM normalizada
    'SAN MARTIN A PUEBLA': 'SAN MARTIN TEXMELUCAN',
    'LA CARBONERA': 'LA CARBONERA',
    'TAXCO': 'C BIS TAXCO',
    'LA CALERA': 'CALERA',
    'TRES MARIAS A': 'BIS TRES MARIA CA',
    'TAMPICO': 'PUENTE TAMPICO',
}
# Ubicacion elegida cuando el mismo nombre existe en varios lugares (lon,lat). Revisar con SICT.
HINT = {
    'QUERETARO': (-100.473, 20.572),
    'QUERETARO BIS': (-100.473, 20.572),
    'ALPUYECA': (-99.26, 18.723),
    'SAN MARTIN A PUEBLA': (-98.41, 19.302),
}
# El CSV usa el mismo nombre para dos plazas distintas: se separan por tramo.
SPLIT = {
    'Esperanza': [
        ('Esperanza (Sonora)', lambda tr: tr.lower().startswith(('cd','ciudad')) and 'obregon' in tr.lower(), (-109.939, 27.604)),
        ('Esperanza (Puebla)', lambda tr: not (tr.lower().startswith(('cd','ciudad')) and 'obregon' in tr.lower()), (-97.386, 18.871)),
    ],
}

# ---------- tarifas: ultima por caseta+tramo
rows = list(csv.DictReader(open(CSV, encoding='utf-8')))
latest = {}
for r in rows:
    k = (r['casetas'].strip(), r['tramo_que_cobra'].strip())
    if k not in latest or r['en_vigor_partir_de'] > latest[k]['en_vigor_partir_de']:
        latest[k] = r
def num(v):
    v = (v or '').strip()
    return float(v) if v else None
casetas = collections.OrderedDict()
for (c, tramo), r in sorted(latest.items()):
    t = {e: num(r['camion_%d_ejes' % e]) for e in range(2, 10)}
    item = {'tramo': tramo, 'desde': r['en_vigor_partir_de'], 't': t}
    if c in SPLIT:
        for nombre, test, hint in SPLIT[c]:
            if test(tramo):
                casetas.setdefault(nombre, []).append(item); HINT[strip(nombre)] = hint; break
    else:
        casetas.setdefault(c, []).append(item)

# ---------- OSM
txt = open(OSM, encoding='utf-8').read()
data = json.loads(txt[txt.index('{'):txt.rindex('}')+1])
EXC = re.compile(r'INSPECC|AGRICULTURAL|ENTRANCE|DIENTE|LIBRE TOLL|PALENQUE', re.I)
osm = []
for f in data['features']:
    p = f.get('properties') or {}
    nm = p.get('name')
    if nm and EXC.search(nm): continue
    if p.get('highway') == 'toll_gantry' and not nm: continue
    osm.append({'name': nm, 'k': strip(nm) if nm else '', 'xy': f['geometry']['coordinates']})

def match(c):
    k0 = strip(c); k = ALIAS.get(k0, k0)
    ex = [o for o in osm if o['k'] == k]
    if ex: return ex, 'exacto'
    if len(k) >= 6:
        co = [o for o in osm if o['k'] and (o['k'].startswith(k) or (k.startswith(o['k']) and len(o['k']) >= 6))]
        if co: return co, 'parcial'
    return [], None

def spatial_clusters(ms, km=3.0):
    cls = []
    for o in ms:
        for cl in cls:
            if any(hav(o['xy'], m['xy']) <= km for m in cl): cl.append(o); break
        else: cls.append([o])
    return cls

out = []; sin = []; usados = set(); revisar = []
pre = {c: match(c) for c in casetas}
for c, tr in sorted(casetas.items(), key=lambda kv: pre[kv[0]][1] != 'exacto'):
    ms, how = pre[c]
    if how == 'parcial':   # no reutilizar puntos ya asignados a otra caseta (evita cobrar dos veces)
        ms = [o for o in ms if id(o) not in usados]
    k0 = strip(c); chosen = ms; flag = None
    cls = spatial_clusters(ms)
    if len(cls) > 1:
        if k0 in HINT:
            cls.sort(key=lambda cl: min(hav(HINT[k0], m['xy']) for m in cl))
            chosen = cls[0]; flag = 'ubicacion elegida entre %d sitios con el mismo nombre' % len(cls)
        else:
            flag = 'mismo nombre en %d sitios distintos: se aceptan todos' % len(cls)
    for o in chosen: usados.add(id(o))
    pts = [o['xy'] for o in chosen]
    # fusionar carriles casi identicos (<=60 m) para reducir tamaño
    uniq = []
    for p in pts:
        if not any(hav(p, q) < 0.06 for q in uniq): uniq.append(p)
    rec = {'n': c, 'tr': tr, 'pts': [[round(x, 5), round(y, 5)] for x, y in uniq]}
    out.append(rec)
    if not uniq: sin.append(c)
    if flag: revisar.append((c, flag, how))
    elif how == 'parcial': revisar.append((c, 'nombre parcial', how))

# ---------- casetas extra (privadas/concesionadas) tomadas de Traza tu ruta, solo 5 ejes
import os, statistics
_ex = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tarifas_extra.json'), encoding='utf-8'))
_rat = {}
for e in range(2, 10):
    rs = []
    for tr in casetas.values():
        for it in tr:
            if it['t'].get(5) and it['t'].get(e): rs.append(it['t'][e] / it['t'][5])
    _rat[e] = statistics.median(rs)
print('proporciones vs 5 ejes:', {e: round(v, 2) for e, v in _rat.items()})
EXTRA_NAMES = []
for x in _ex['casetas']:
    t = {e: float(round(x['c5'] * _rat[e])) for e in range(2, 10)}; t[5] = float(x['c5'])
    item = {'tramo': x['tramo'], 'desde': _ex['desde'], 't': t, 'a': 1}
    pts = []
    if x.get('osm'):
        k = strip(x['osm']); r = x.get('radio', 0.08)
        ms = [o for o in osm if id(o) not in usados and o['k'] and (k in o['k'] or o['k'] in k)
              and abs(o['xy'][0]-x['cerca'][0]) < r and abs(o['xy'][1]-x['cerca'][1]) < r]
        for o in ms: usados.add(id(o))
        for o in ms:
            if not any(hav(o['xy'], q) < 0.06 for q in pts): pts.append(o['xy'])
        if not pts: print('EXTRA sin puntos OSM:', x['n'])
    ex = next((c for c in out if c['n'] == x['n']), None)
    if ex: ex['tr'].append(item); ex['pts'] += [[round(a, 5), round(b, 5)] for a, b in pts if [round(a, 5), round(b, 5)] not in ex['pts']]
    else: out.append({'n': x['n'], 'tr': [item], 'pts': [[round(a, 5), round(b, 5)] for a, b in pts]})
    if not pts and not ex: sin.append(x['n'])

# ---------- plazas OSM sin tarifa
tar_pts = [p for c in out for p in c['pts']]
rest = [o for o in osm if id(o) not in usados and not any(hav(o['xy'], p) < 0.8 for p in tar_pts)]
clusters = []
for o in rest:
    for cl in clusters:
        if any(hav(o['xy'], m['xy']) <= 0.6 for m in cl): cl.append(o); break
    else: clusters.append([o])
merged = True
while merged:
    merged = False
    for i in range(len(clusters)):
        for j in range(i+1, len(clusters)):
            if any(hav(a['xy'], b['xy']) <= 0.6 for a in clusters[i] for b in clusters[j]):
                clusters[i] += clusters.pop(j); merged = True; break
        if merged: break
plazas = []
for cl in clusters:
    names = [m['name'] for m in cl if m['name']]
    nm = collections.Counter(names).most_common(1)[0][0] if names else None
    lon = sum(m['xy'][0] for m in cl)/len(cl); lat = sum(m['xy'][1] for m in cl)/len(cl)
    plazas.append({'n': (re.sub(r'\s+', ' ', nm).strip() if nm else 'Caseta sin nombre'), 'p': [round(lon, 5), round(lat, 5)]})

js = '// Generado por build_casetas.py - NO editar a mano\n'
js += '// Tarifas: red FONADIN (camion 2-9 ejes), vigencia mas reciente por tramo (campo "desde").\n'
js += '// Coordenadas: OpenStreetMap (ODbL).\n'
js += 'const CASETAS_TARIFA=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
js += 'const PLAZAS_SIN_TARIFA=' + json.dumps(plazas, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(OUT, 'w', encoding='utf-8').write(js)

print('casetas con tarifa:', len(out), '| con coordenadas:', len(out)-len(sin), '| sin coordenadas:', len(sin))
print('plazas OSM sin tarifa (estimadas):', len(plazas), '| con nombre:', sum(p['n'] != 'Caseta sin nombre' for p in plazas))
print('\nSIN COORDENADAS (no se pueden detectar):', ', '.join(sin))
print('\nA REVISAR:')
for c, f, h in revisar: print('  -', c, '|', f)
print('\nKB:', round(len(js.encode())/1024))
