# -*- coding: utf-8 -*-
import json, math
from collections import defaultdict, Counter
from recetas_data import R, SECCION_DE, AG

DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

# Plan: (comida, cena) — cada una lista de ids de receta
PLAN = [
  [  # Semana 1
    (["lentejas_verduras"], ["tortilla_francesa", "crema_calabacin"]),
    (["pollo_horno_patatas"], ["pez_espada_plancha", "ensalada_mixta"]),
    (["arroz_pescado"], ["revuelto_champinones"]),
    (["garbanzos_espinacas"], ["croquetas_bacalao", "crema_calabaza"]),
    (["macarrones_bolonesa"], ["pizza_casera"]),
    (["dorada_frita", "ensalada_mixta"], ["empanada_atun"]),
    (["cocido"], ["sopa_picadillo"]),
  ],
  [  # Semana 2
    (["ropa_vieja"], ["salmon_horno_patatas"]),
    (["alubias_verduras"], ["tortilla_patatas"]),
    (["espaguetis_carbonara"], ["merluza_salsa_verde"]),
    (["carne_con_patatas"], ["croquetas_cocido", "crema_calabaza"]),
    (["arroz_pollo"], ["ensalada_pollo_mayonesa"]),
    (["boquerones_fritos", "ensalada_mixta"], ["hamburguesas_caseras"]),
    (["lentejas_verduras"], ["pisto_huevo"]),
  ],
  [  # Semana 3
    (["judias_verdes_patatas", "pechuga_plancha"], ["bacalao_tomate"]),
    (["lasana_carne"], ["tortilla_francesa", "ensalada_mixta"]),
    (["garbanzos_espinacas"], ["pez_espada_plancha", "crema_calabacin"]),
    (["arroz_chorizo"], ["empanada_queso"]),
    (["albondigas_salsa", "patatas_fritas"], ["sepia_plancha", "ensalada_mixta"]),
    (["alubias_verduras"], ["revuelto_champinones"]),
    (["cocido"], ["sopa_picadillo"]),
  ],
  [  # Semana 4
    (["ropa_vieja"], ["croquetas_pollo", "crema_calabaza"]),
    (["pollo_ajillo", "arroz_blanco"], ["salmon_horno_patatas"]),
    (["lentejas_verduras"], ["tortilla_patatas"]),
    (["berenjenas_rellenas"], ["ensalada_pasta"]),
    (["arroz_pescado"], ["pizza_casera"]),
    (["dorada_frita", "ensalada_mixta"], ["huevos_fritos", "patatas_fritas"]),
    (["macarrones_bolonesa"], ["filetes_empanados", "ensalada_mixta"]),
  ],
]

# ---------- normalizar recetas ----------
recetas = []
for r in R:
    ings = []
    for t in r["ingredientes"]:
        nombre, cant, unidad = t[:3]
        extra = t[3] if len(t) > 3 else {}
        d = {"nombre": nombre, "cantidad": cant, "unidad": unidad}
        if "de_receta" in extra:
            d["seccion"] = "aprovechamiento"
            d["de_receta"] = extra["de_receta"]
        else:
            assert nombre in SECCION_DE, f"Sin sección: {nombre} ({r['id']})"
            d["seccion"] = SECCION_DE[nombre]
        d["opcional"] = bool(extra.get("opcional"))
        ings.append(d)
    r = dict(r, ingredientes=ings)
    recetas.append(r)
IDX = {r["id"]: r for r in recetas}
assert len(IDX) == len(recetas), "ids duplicados"
for r in recetas:
    for i in r["ingredientes"]:
        if "de_receta" in i:
            assert i["de_receta"] in IDX

# ---------- plan ----------
plan = []
for s, semana in enumerate(PLAN, 1):
    assert len(semana) == 7
    dias = []
    for d, (com, cen) in enumerate(semana):
        for rid in com + cen:
            assert rid in IDX, rid
        dias.append({"dia": DIAS[d], "comida": com, "cena": cen})
    plan.append({"semana": s, "dias": dias})

# ---------- listas de la compra ----------
def redondear(cant, unidad):
    if unidad in ("g", "ml"):
        return int(math.ceil(cant / 50.0) * 50)
    if unidad == "diente":
        return int(math.ceil(cant / 10.0))  # -> cabezas
    return int(math.ceil(cant - 1e-9))

ORDEN_SEC = ["verdura_fruta", "carne", "pescado", "huevos_lacteos", "panaderia_refrigerados",
             "congelados", "despensa"]
listas = []
for sem in plan:
    tot = defaultdict(float)
    especias = set()
    usos = defaultdict(set)
    for dia in sem["dias"]:
        for rid in dia["comida"] + dia["cena"]:
            for i in IDX[rid]["ingredientes"]:
                if i["opcional"] or i["seccion"] == "aprovechamiento":
                    continue
                if i["seccion"] == "especias" or i["unidad"] == AG:
                    especias.add(i["nombre"]); continue
                tot[(i["nombre"], i["unidad"], i["seccion"])] += i["cantidad"]
                usos[i["nombre"]].add(rid)
    secciones = {}
    for (n, u, sec), c in sorted(tot.items()):
        unidad = "cabeza" if u == "diente" else u
        secciones.setdefault(sec, []).append(
            {"nombre": n, "cantidad": redondear(c, u), "unidad": unidad, "recetas": sorted(usos[n])})
    listas.append({
        "semana": sem["semana"],
        "secciones": {k: secciones[k] for k in ORDEN_SEC if k in secciones},
        "revisar_despensa": sorted(especias),
    })

# ---------- balance semanal ----------
def grupo(rid):
    r = IDX[rid]
    if rid in ("cocido", "ropa_vieja") or r["categoria"] == "legumbre" and rid != "sopa_picadillo":
        return "legumbre"
    if r["categoria"] == "pescado" or rid in ("croquetas_bacalao", "empanada_atun", "arroz_pescado"):
        return "pescado"
    if r["categoria"] == "carne" or rid in ("croquetas_cocido", "croquetas_pollo", "arroz_pollo",
            "arroz_chorizo", "macarrones_bolonesa", "lasana_carne", "berenjenas_rellenas",
            "ensalada_pollo_mayonesa", "espaguetis_carbonara", "hamburguesas_caseras"):
        return "carne"
    if r["categoria"] == "huevo" or rid == "pisto_huevo":
        return "huevo"
    return None

balance = []
for sem in plan:
    c = Counter()
    for dia in sem["dias"]:
        for rid in dia["comida"] + dia["cena"]:
            g = grupo(rid)
            if g: c[g] += 1
    balance.append({"semana": sem["semana"], **{k: c.get(k, 0) for k in ["legumbre", "pescado", "carne", "huevo"]}})

usadas = {rid for s in plan for d in s["dias"] for rid in d["comida"] + d["cena"]}

out = {
    "meta": {
        "nombre": "Repositorio de recetas — comida y cena",
        "version": "1.0",
        "fecha": "2026-10-23",
        "idioma": "es-ES",
        "raciones_base": 5,
        "unidades": {"g": "gramos", "ml": "mililitros", "ud": "unidades", "diente": "diente de ajo",
                     "cdta": "cucharadita", "hoja": "hoja", "manojo": "manojo", "al_gusto": "sin cantidad fija"},
        "notas": [
            "Cantidades para 5 personas; escalar multiplicando 'cantidad' por raciones/5.",
            "Ingredientes con 'de_receta' son sobras de otra receta (no entran en la compra).",
            "Ingredientes 'opcional' no entran en la compra.",
            "Lista de la compra: g/ml redondeados a 50 hacia arriba; ajo en cabezas (~10 dientes).",
            "El aceite de fritura y pochado (tortilla, fritos) se cuenta entero aunque se reutilice: revisar antes de comprar.",
            "Valores nutricionales no incluidos (no calculados con fuente verificada).",
        ],
        "criterios_plan": [
            "Comidas: legumbres, arroces, pastas y guisos; cenas: pescado, huevo, cremas, ensaladas y platos rápidos.",
            "Objetivo semanal aprox.: 2-3 legumbres, 3-4 pescado, 3-5 carne, 2-3 huevo como plato principal.",
            "Cocido los domingos de las semanas 1 y 3; sus sobras alimentan sopa, ropa vieja y croquetas.",
        ],
        "balance_semanal": balance,
        "total_recetas": len(recetas),
        "recetas_no_usadas_en_plan": sorted(set(IDX) - usadas),
    },
    "recetas": recetas,
    "plan_mensual": plan,
    "listas_compra": listas,
}

with open("recetario.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("recetas:", len(recetas), "| usuario:", sum(r["origen"] == "usuario" for r in recetas),
      "| nuevas:", sum(r["origen"] == "nuevo" for r in recetas))
print("no usadas:", out["meta"]["recetas_no_usadas_en_plan"])
for b in balance: print(b)
for l in listas:
    n = sum(len(v) for v in l["secciones"].values())
    hv = [i for i in l["secciones"]["huevos_lacteos"] if i["nombre"] == "huevos"]
    print("semana", l["semana"], "items", n, "huevos", hv[0]["cantidad"] if hv else 0)
