import re, sys, json, collections, subprocess
PDF, OUT = sys.argv[1], sys.argv[2]
COLS = ['M','A','B2','B3','B4','C2','C3','C4','C5','C6','C7','C8','C9','EEA','EEC']
txt = subprocess.run(['pdftotext','-layout',PDF,'-'],capture_output=True,text=True,check=True).stdout
DATE = re.compile(r'(Abr \d{1,2}/\d{4}|Julio \d{2} \d{4})')
rows = []; avisos = []

for pno, page in enumerate(txt.split('\f'), 1):
    if not page.strip(): continue
    if 'RED CONCESIONADA' in page: seccion = 'concesionada'
    elif 'FIDEICOMISO' in page: seccion = 'fideicomiso358'
    elif 'RED FONADIN' in page: seccion = 'fonadin'
    else: seccion = 'otro'
    if 'PEATONES' in page and 'TRICICLOS' in page: continue
    lines = page.split('\n')
    hdr = next((l for l in lines if re.search(r'\bB2\b',l) and re.search(r'\bC5\b',l)), None)
    if not hdr: continue
    centers = {m.group(0): (m.start()+m.end())/2 for m in re.finditer(r'\b(EEA|EEC|M|A|B2|B3|B4|C[2-9])\b', hdr)}
    subsec = ''; pending = ''; autop = ''
    for l in lines:
        s = l.strip()
        if not s: continue
        if 'PUENTES NACIONALES' in s or 'PUENTES INTERNACIONALES' in s: subsec = s
        if 'cerró su operación' in s: avisos.append(s)
        m = DATE.search(l)
        if not m:
            # linea suelta: posible nombre de caseta/autopista que se continua en la siguiente fila
            if re.fullmatch(r"[A-ZÁÉÍÓÚÑ0-9 .\-()/]+", s) and not re.search(r'CAMINOS|TARIFAS|RED |CASETAS|MOTOS|AUTOS|TRAMO|EN VIGOR|PARTIR|Cifras|IVA|NOTAS|ABREVIATURAS|PUENTES|CAMIONES|FIDEICOMISO|^M\b', s):
                pending = s
            continue
        left = l[:m.start()].rstrip(); right = l[m.end():]
        fecha = m.group(0)
        cells = {}
        for n in re.finditer(r'\d{1,3}(?:,\d{3})*', right):
            cx = (n.start()+n.end())/2 + m.end()
            col = min(centers, key=lambda c: abs(centers[c]-cx))
            if abs(centers[col]-cx) <= 5: cells[col] = float(n.group(0).replace(',',''))
        idx = None
        mi = re.match(r'^\s{0,3}(\d{1,3})\s+(.*)$', left)
        if mi and len(left) - len(left.lstrip()) <= 3: idx, left = mi.group(1), mi.group(2)
        parts = [p.strip() for p in re.split(r'\s{2,}', left.strip()) if p.strip()]
        marca = ''
        def tomar_marca(t):
            mm = re.match(r'^\(\s*(D|I\d?)\s*\)\s*(.*)$', t)
            return (mm.group(1), mm.group(2)) if mm else ('', t)
        nombre = tramo = ''
        if idx is not None and len(parts) <= 1:
            tipo = 'autopista' if seccion in ('fonadin','fideicomiso358') else 'concesionada'
            nombre = parts[0] if parts else ''
            if tipo == 'autopista': autop = nombre
            if seccion == 'concesionada': nombre = nombre
        elif idx is not None and len(parts) >= 2:   # puente nacional: "1 EL ZACATAL    ZACATAL-CIUDAD DEL CARMEN"
            tipo = 'puente'; nombre, tramo = parts[0], parts[1]
        elif len(parts) >= 2:
            tipo = 'caseta' if seccion != 'concesionada' else 'concesionada'
            nombre = parts[0]; marca, tramo = tomar_marca(' '.join(parts[1:]))
            if nombre.startswith('('):   # el nombre venia vacio y el marcador quedo primero
                marca, tramo = tomar_marca(' '.join(parts)); nombre = pending or autop
        elif len(parts) == 1:
            tipo = 'caseta' if seccion != 'concesionada' else 'concesionada'
            marca, tramo = tomar_marca(parts[0]); nombre = pending or autop
        else:
            continue
        rows.append(dict(seccion=seccion, tipo=tipo, sub=subsec, idx=idx, autopista=autop, nombre=nombre,
                         marca=marca, tramo=tramo, fecha=fecha, pagina=pno, **{c: cells.get(c) for c in COLS}))
        if tipo != 'autopista': pending = ''
print('filas:', len(rows), dict(collections.Counter((r['seccion'],r['tipo']) for r in rows)))
print('avisos:', avisos)
json.dump(rows, open(OUT,'w'), ensure_ascii=False)
