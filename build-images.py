import os, json, base64, io
from PIL import Image

SRC='_src'; OUT='assets/images'
os.makedirs(OUT, exist_ok=True)

# slot -> (source file id fragment, alt text)
MAP = [
 ("hero-belleza",      "LB5-4Db0cBg", "Mujer en penumbra con luz cálida sobre el hombro"),
 ("manifiesto",        "OdoTnZnJD78", "Retrato de mujer en claroscuro con la mano en el cuello"),
 ("intro-piel",        "-fQ5XNOcqFQ", "Retrato de mujer con la mirada al horizonte y luz dorada"),
 ("nosotros",          "opJ8Wge42oI", "Retrato editorial en claroscuro"),
 ("cabina",            "npE_I2GzpHY", "Cabina de tratamiento facial con luz suave"),
 ("cabina-2",          "9qYFu1NzpS8", "Mujer recibiendo un tratamiento facial en cabina"),
 ("sauna-dark",        "IwyL840Pq2I", "Interior de sauna de madera oscura"),
 ("sauna",             "HOplEhR9T2Y", "Sauna de madera con iluminación ambiental cálida"),
 ("sauna-2",           "EiERveaIdz0", "Detalle de estufa de sauna con piedras"),
 ("masaje-aceite",     "0MoF-Fe0w0A", "Aceite esencial vertido sobre la piel durante un masaje"),
 ("masaje-bn",         "CLiwQXx7kT8", "Masaje relajante en blanco y negro"),
 ("masaje-espalda",    "WAm_HaI4W2E", "Masaje de espalda con aceite tibio"),
 ("masaje-cuerpo",     "83RTpUBjyYY", "Masaje corporal completo sobre camilla"),
 ("facial-limpieza",   "MGKzomg0Dts", "Rostro en reposo durante una limpieza facial"),
 ("facial-oro",        "6Cz6R3El3p0", "Mascarilla facial dorada de acabado editorial"),
 ("cejas",             "35IcCEwNTqc", "Diseño de cejas con pinza de precisión"),
 ("mirada",            "_tnkR2gu3kw", "Macrofotografía de ojo y ceja"),
 ("pestanas",          "6Y_O7Q9zQt4", "Detalle macro de pestañas y mirada"),
 ("nails-oscuro",      "FmL4LJA8acE", "Manos con manicura oscura sobre fondo en penumbra"),
 ("nails-nude",        "DtoWpHt2_d8", "Manos con manicura nude de acabado natural"),
 ("nails-calido",      "SyCC0GQi5S4", "Uñas de tono nude sobre superficie suave"),
 ("nails-macro",       "QDLcmSCQEbQ", "Detalle macro de manos y uñas"),
 ("cabello-bn",        "e5XjqAnVejo", "Cabello en movimiento, fotografía en blanco y negro"),
 ("cabello-movimiento","rOjqDiJhhkw", "Melena en movimiento sobre fondo claro"),
 ("cabello-oscuro",    "ve_kk3cH7HY", "Cabello oscuro con acabado brillante"),
 ("cabello-salon",     "ok2aIXX8fZw", "Sesión de peinado en salón"),
 ("pareja-manos",      "b0PPQcgIV6o", "Dos manos que se encuentran en la penumbra"),
 ("pareja-manos-2",    "MWhSHtmiT-c", "Manos entrelazadas con luz cálida y fondo oscuro"),
 ("pareja-manos-3",    "E6E_nRnk62U", "Manos que se rozan sobre fondo negro"),
 ("yoga-1",            "gtu2fIpP3EE", "Postura de yoga sobre fondo oscuro con luz lateral"),
 ("yoga-2",            "7FjFDyJOv4s", "Mujer en postura de yoga recogida, iluminación tenue"),
 ("yoga-3",            "vs-PjCh5goo", "Silueta en postura de meditación sobre fondo negro"),
 ("yoga-4",            "W5zTPoCVai0", "Postura de equilibrio junto a una ventana con luz natural"),
 ("yoga-5",            "jx8GSJ8pz0E", "Estiramiento lateral de yoga frente a muro oscuro"),
]

WIDTHS=[640,1024,1600,2400]
src_files={f: os.path.join(SRC,f) for f in os.listdir(SRC)}
manifest={}
for slot, frag, alt in MAP:
    match=[p for f,p in src_files.items() if frag in f]
    if not match:
        print("MISSING", slot, frag); continue
    im=Image.open(match[0]).convert('RGB')
    W,H=im.size
    entry={"alt":alt,"w":W,"h":H,"sizes":[]}
    for w in WIDTHS:
        if w>W: continue
        h=round(H*w/W)
        r=im.resize((w,h), Image.LANCZOS)
        r.save(f"{OUT}/{slot}-{w}.avif", quality=62, speed=6)
        r.save(f"{OUT}/{slot}-{w}.webp", quality=80, method=5)
        entry["sizes"].append(w)
    # LQIP base64 (tiny avif -> use webp for broad support, 20px)
    t=im.resize((24, max(1,round(H*24/W))), Image.LANCZOS)
    buf=io.BytesIO(); t.save(buf,'WEBP',quality=45)
    entry["lqip"]="data:image/webp;base64,"+base64.b64encode(buf.getvalue()).decode()
    manifest[slot]=entry
    print("ok", slot, entry["sizes"])

with open('data/images.json','w') as f: json.dump(manifest,f,indent=1,ensure_ascii=False)
print("total", len(manifest))
