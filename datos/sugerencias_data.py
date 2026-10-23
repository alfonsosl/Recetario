# -*- coding: utf-8 -*-
"""Sugerencias de platos caseros en el mismo estilo que el recetario (5 raciones).

Mismo formato que recetas_data.py, más dos campos que usa la app:
- grupo: proteína principal para el balance semanal (legumbre | pescado | carne | huevo | None)
- emoji: icono del plato (la app no usa fotografías)

Genera sugerencias.json:  python3 sugerencias_data.py
"""
import json
from recetas_data import SECCION_DE, AG

# Ingredientes nuevos que no están en recetas_data.py
SECCION_EXTRA = {
    "plátano": "verdura_fruta", "pepino": "verdura_fruta",
    "costilla de cerdo": "carne", "morcilla": "carne", "magro de cerdo": "carne", "jamón serrano en lonchas": "carne",
    "bonito": "pescado", "sardinas": "pescado",
    "fideos de fideuá": "despensa",
    "corazones de alcachofa": "congelados",
}
SECCION = {**SECCION_DE, **SECCION_EXTRA}

C, X, CX = ["comida"], ["cena"], ["comida", "cena"]
OPC = {"opcional": True}
S = []


def sugerencia(id, nombre, categoria, momento, tipo, prep, coc, dif, etiquetas, grupo, emoji, ingredientes, pasos,
               notas="", conservacion=""):
    ings = []
    for t in ingredientes:
        nombre_i, cant, unidad = t[:3]
        extra = t[3] if len(t) > 3 else {}
        assert nombre_i in SECCION, f"Sin sección: {nombre_i} ({id})"
        ings.append({"nombre": nombre_i, "cantidad": cant, "unidad": unidad, "seccion": SECCION[nombre_i],
                     "opcional": bool(extra.get("opcional"))})
    S.append(dict(id=id, nombre=nombre, categoria=categoria, momento=momento, tipo_plato=tipo, raciones=5,
                  tiempo_prep_min=prep, tiempo_coccion_min=coc, dificultad=dif, etiquetas=etiquetas,
                  origen="sugerencia", grupo=grupo, emoji=emoji, ingredientes=ings, pasos=pasos,
                  notas=notas, conservacion=conservacion, genera=[]))


# ---------------- COMIDAS ----------------
sugerencia("lentejas_chorizo", "Lentejas estofadas con chorizo", "legumbre", C, "principal", 15, 50, "baja",
           ["legumbre", "cuchara", "congelable"], "legumbre", "🍲",
           [("lentejas pardinas", 500, "g"), ("chorizo", 200, "g"), ("cebolla", 1, "ud"), ("zanahoria", 2, "ud"),
            ("pimiento verde", 1, "ud"), ("patata", 400, "g"), ("ajo", 3, "diente"), ("tomate triturado", 150, "g"),
            ("pimentón dulce", 1, "cdta"), ("laurel", 2, "hoja"), ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
           ["Lavar las lentejas (las pardinas no necesitan remojo).",
            "Sofreír cebolla, pimiento y ajo picados 8 min en el aceite.",
            "Añadir el chorizo en rodajas 2 min; fuera del fuego, el pimentón; después el tomate, 3 min.",
            "Incorporar lentejas, zanahoria en rodajas y laurel; cubrir con ~2 l de agua fría y cocer 25 min a fuego suave.",
            "Añadir la patata chascada y cocer 15-20 min más. Salar y reposar 5 min."],
           conservacion="Nevera 4 días; congelan bien sin la patata.")

sugerencia("garbanzos_bacalao", "Garbanzos con bacalao y espinacas", "legumbre", C, "principal", 15, 30, "baja",
           ["legumbre", "pescado", "cuchara"], "legumbre", "🍲",
           [("garbanzos cocidos", 1000, "g"), ("bacalao desalado", 400, "g"), ("espinacas frescas", 400, "g"),
            ("cebolla", 1, "ud"), ("ajo", 3, "diente"), ("tomate triturado", 150, "g"), ("pimentón dulce", 1, "cdta"),
            ("caldo de pescado", 500, "ml"), ("aceite de oliva virgen extra", 50, "ml"), ("huevos", 3, "ud", OPC),
            ("sal", None, AG)],
           ["Pochar cebolla y ajo picados 8 min.",
            "Fuera del fuego, añadir el pimentón; después el tomate, 5 min.",
            "Añadir las espinacas y rehogar hasta que reduzcan.",
            "Incorporar garbanzos escurridos y caldo; cocer 10 min.",
            "Añadir el bacalao desmigado y cocer 4 min más. Rectificar de sal (el bacalao ya sala).",
            "Opcional: servir con huevo duro picado."],
           notas="Si el bacalao es salado, desalar 36-48 h cambiando el agua cada 8 h.")

sugerencia("arroz_cubana", "Arroz a la cubana", "arroz", C, "principal", 10, 25, "baja",
           ["huevo", "rápido"], "huevo", "🍳",
           [("arroz largo", 450, "g"), ("tomate frito", 400, "g"), ("huevos", 5, "ud"), ("plátano", 3, "ud", OPC),
            ("ajo", 2, "diente"), ("aceite de oliva virgen extra", 30, "ml"), ("aceite de girasol", 200, "ml"),
            ("sal", None, AG)],
           ["Dorar los ajos chafados en el aceite de oliva, nacarar el arroz 1 min y añadir el doble de agua hirviendo con sal.",
            "Cocer 18 min tapado a fuego bajo y reposar 5 min.",
            "Calentar el tomate frito.",
            "Freír los huevos en el aceite de girasol (y, si se usa, el plátano en rodajas a lo largo).",
            "Servir el arroz en flanera con tomate y un huevo frito por persona."])

sugerencia("arroz_horno", "Arroz al horno", "arroz", C, "principal", 20, 50, "media",
           ["carne", "horno", "fin de semana"], "carne", "🥘",
           [("arroz redondo", 500, "g"), ("costilla de cerdo", 500, "g"), ("morcilla", 2, "ud"),
            ("garbanzos cocidos", 300, "g"), ("patata", 300, "g"), ("tomate", 2, "ud"), ("ajo", 10, "diente"),
            ("pimentón dulce", 1, "cdta"), ("colorante o azafrán", 1, "cdta"), ("caldo de pollo", 1100, "ml"),
            ("aceite de oliva virgen extra", 80, "ml"), ("sal", None, AG)],
           ["Precalentar el horno a 220 °C.",
            "En cazuela de barro, dorar la costilla salada; retirar. Dorar la patata en rodajas y un tomate en rodajas; retirar.",
            "Dorar la cabeza de ajo entera y la morcilla en trozos; retirar.",
            "Sofreír el otro tomate rallado y el pimentón; añadir el arroz y los garbanzos, remover 1 min.",
            "Colocar encima costilla, morcilla, patata, tomate y la cabeza de ajo en el centro; verter el caldo caliente con el colorante.",
            "Hornear 20 min y reposar 5 min."],
           notas="Los 10 dientes de ajo son una cabeza entera que se asa en el centro.")

sugerencia("fideua", "Fideuá de marisco", "pasta", C, "principal", 20, 30, "media",
           ["pescado", "marisco"], "pescado", "🥘",
           [("fideos de fideuá", 450, "g"), ("gambas", 300, "g"), ("calamar", 300, "g"), ("rape", 300, "g"),
            ("tomate triturado", 150, "g"), ("ajo", 3, "diente"), ("pimentón dulce", 1, "cdta"),
            ("colorante o azafrán", 1, "cdta"), ("caldo de pescado", 1100, "ml"), ("aceite de oliva virgen extra", 60, "ml"),
            ("mayonesa", 150, "g", OPC), ("sal", None, AG)],
           ["Pelar las gambas (cabezas al caldo 10 min y colar).",
            "Tostar los fideos en el aceite hasta dorar; retirar.",
            "Marcar gambas y rape; retirar. Sofreír el calamar en anillas y el ajo 5 min.",
            "Añadir tomate y pimentón 3 min; volver los fideos y verter el caldo caliente con colorante. Ajustar sal.",
            "Cocer 8-10 min hasta que se absorba el caldo; incorporar rape y gambas los últimos 3 min.",
            "Opcional: gratinar 2 min para que los fideos se ricen. Servir con alioli (mayonesa con ajo)."])

sugerencia("marmitako", "Marmitako de bonito", "pescado", C, "principal", 15, 40, "baja",
           ["pescado azul", "cuchara"], "pescado", "🐟",
           [("bonito", 800, "g"), ("patata", 1200, "g"), ("cebolla", 1, "ud"), ("pimiento verde", 1, "ud"),
            ("pimiento rojo", 1, "ud"), ("ajo", 2, "diente"), ("tomate triturado", 200, "g"), ("pimentón dulce", 1, "cdta"),
            ("caldo de pescado", 1500, "ml"), ("aceite de oliva virgen extra", 50, "ml"), ("sal", None, AG)],
           ["Pochar cebolla, pimientos y ajo picados 10 min.",
            "Añadir pimentón y tomate; 5 min.",
            "Incorporar la patata chascada, rehogar 2 min y cubrir con el caldo. Cocer 25 min.",
            "Apagar el fuego, añadir el bonito en tacos salado y tapar 5 min: se hace con el calor residual."],
           notas="Con atún fresco también funciona. No cocer el bonito o quedará seco.")

sugerencia("magro_tomate", "Magro con tomate", "carne", C, "principal", 15, 45, "baja",
           ["carne", "congelable"], "carne", "🥩",
           [("magro de cerdo", 1000, "g"), ("tomate triturado", 800, "g"), ("cebolla", 1, "ud"), ("pimiento verde", 1, "ud"),
            ("ajo", 3, "diente"), ("vino blanco", 100, "ml"), ("laurel", 1, "hoja"), ("azúcar", 5, "g"),
            ("aceite de oliva virgen extra", 50, "ml"), ("sal", None, AG), ("pimienta negra", None, AG)],
           ["Salpimentar el magro en tacos y dorarlo por tandas; retirar.",
            "Pochar cebolla, pimiento y ajo 10 min.",
            "Volver la carne, añadir el vino y reducir 2 min.",
            "Añadir tomate, azúcar y laurel; guisar 30 min a fuego suave hasta que la carne esté tierna."],
           notas="Acompaña bien con arroz blanco o patatas fritas.", conservacion="Nevera 4 días; congela bien.")

sugerencia("macarrones_atun", "Macarrones con atún y tomate", "pasta", C, "principal", 10, 20, "baja",
           ["pescado", "rápido"], "pescado", "🍝",
           [("macarrones", 500, "g"), ("atún en aceite", 4, "ud"), ("tomate frito", 400, "g"), ("cebolla", 1, "ud"),
            ("queso rallado", 100, "g"), ("orégano", None, AG), ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
           ["Cocer la pasta según el paquete.",
            "Pochar la cebolla picada 8 min, añadir tomate frito y orégano, 3 min.",
            "Incorporar el atún escurrido y mezclar con la pasta.",
            "Servir con queso rallado (opcional: gratinar 5 min)."],
           notas="Atún: latas de ~80 g escurrido.")

# ---------------- CENAS ----------------
sugerencia("merluza_romana", "Merluza a la romana", "pescado", CX, "principal", 15, 15, "baja",
           ["pescado blanco", "frito"], "pescado", "🐟",
           [("merluza en rodajas", 1000, "g"), ("harina de trigo", 100, "g"), ("huevos", 3, "ud"),
            ("aceite de girasol", 500, "ml"), ("limón", 1, "ud"), ("sal", None, AG)],
           ["Secar y salar la merluza.",
            "Pasar por harina, sacudir y después por huevo batido.",
            "Freír en aceite a 175 °C 2-3 min por lado hasta dorar.",
            "Escurrir en papel absorbente y servir con limón."],
           notas="El aceite colado se reutiliza.")

sugerencia("sardinas_plancha", "Sardinas a la plancha", "pescado", CX, "principal", 15, 10, "baja",
           ["pescado azul", "rápido", "ligero"], "pescado", "🐟",
           [("sardinas", 1500, "g"), ("ajo", 2, "diente"), ("perejil fresco", 0.25, "manojo"), ("limón", 1, "ud"),
            ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
           ["Limpiar las sardinas (sin tripa, con escamas fuera) y secar.",
            "Majar ajo, perejil y aceite.",
            "Plancha muy caliente con sal gruesa: 2-3 min por lado.",
            "Servir con el majado y limón."])

sugerencia("tortilla_calabacin", "Tortilla de calabacín y cebolla", "huevo", X, "principal", 10, 25, "baja",
           ["huevo", "vegetariano", "ligero"], "huevo", "🥚",
           [("calabacín", 3, "ud"), ("cebolla", 1, "ud"), ("huevos", 9, "ud"), ("aceite de oliva virgen extra", 60, "ml"),
            ("sal", None, AG)],
           ["Cortar el calabacín en dados pequeños y la cebolla en juliana.",
            "Pochar ambos con sal a fuego medio 15 min hasta que evaporen el agua.",
            "Mezclar con los huevos batidos y reposar 3 min.",
            "Cuajar 3 min, dar la vuelta con plato y 2 min más."])

sugerencia("huevos_rotos", "Huevos rotos con jamón", "huevo", X, "principal", 10, 25, "baja",
           ["huevo", "frito", "fin de semana"], "huevo", "🍳",
           [("patata", 1200, "g"), ("huevos", 10, "ud"), ("jamón serrano en lonchas", 150, "g"),
            ("aceite de girasol", 750, "ml"), ("sal", None, AG)],
           ["Freír las patatas en rodajas gruesas a fuego medio hasta que estén tiernas y doradas; escurrir y salar.",
            "Freír los huevos con la yema líquida.",
            "Colocar los huevos sobre las patatas con el jamón y romperlos al servir."],
           notas="El aceite colado se reutiliza 2-3 veces.")

sugerencia("crema_verduras", "Crema de verduras", "verdura", X, "primero", 15, 30, "baja",
           ["vegetariano", "ligero", "congelable", "acompañamiento"], None, "🥣",
           [("calabacín", 2, "ud"), ("zanahoria", 3, "ud"), ("puerro", 2, "ud"), ("cebolla", 1, "ud"),
            ("judía verde", 200, "g"), ("patata", 300, "g"), ("caldo de verduras", 1200, "ml"),
            ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
           ["Pochar cebolla y puerro 8 min.",
            "Añadir el resto de verduras y la patata troceadas; rehogar 3 min.",
            "Cubrir con el caldo y cocer 25 min.",
            "Triturar fino y ajustar sal."],
           conservacion="Nevera 3 días; congela bien.")

sugerencia("salmorejo", "Salmorejo", "verdura", CX, "primero", 15, 0, "baja",
           ["vegetariano (sin jamón)", "frío", "temporada verano", "acompañamiento"], None, "🍅",
           [("tomate", 12, "ud"), ("pan", 250, "g"), ("ajo", 1, "diente"), ("aceite de oliva virgen extra", 150, "ml"),
            ("vinagre de vino", 15, "ml"), ("huevos", 2, "ud"), ("jamón serrano en taquitos", 100, "g", OPC),
            ("sal", None, AG)],
           ["Cocer los huevos 10 min, enfriar y picar.",
            "Triturar los tomates (unos 1,5 kg) con el ajo y colar.",
            "Añadir el pan troceado y dejar 10 min que se empape; triturar.",
            "Emulsionar añadiendo el aceite en hilo con la batidora; vinagre y sal.",
            "Enfriar 1 h y servir con huevo picado (y jamón)."],
           conservacion="Nevera 2 días.")

sugerencia("ensalada_garbanzos", "Ensalada de garbanzos", "ensalada", CX, "principal", 15, 10, "baja",
           ["legumbre", "frío", "táper"], "legumbre", "🥗",
           [("garbanzos cocidos", 1000, "g"), ("tomate", 3, "ud"), ("pimiento rojo", 1, "ud"), ("pimiento verde", 1, "ud"),
            ("cebolla", 1, "ud"), ("atún en aceite", 2, "ud"), ("huevos", 3, "ud"), ("aceitunas sin hueso", 100, "g"),
            ("aceite de oliva virgen extra", 50, "ml"), ("vinagre de vino", 20, "ml"), ("sal", None, AG)],
           ["Cocer los huevos 10 min y trocear.",
            "Enjuagar y escurrir los garbanzos.",
            "Picar en dados pequeños tomate, pimientos y cebolla.",
            "Mezclar todo con el atún y las aceitunas; aliñar al servir."],
           conservacion="Nevera 2 días (aliñar al servir).")

sugerencia("menestra_verduras", "Menestra de verduras", "verdura", CX, "primero", 15, 30, "baja",
           ["verdura", "ligero", "acompañamiento"], None, "🥦",
           [("judía verde", 300, "g"), ("guisantes congelados", 200, "g"), ("corazones de alcachofa", 300, "g"),
            ("zanahoria", 2, "ud"), ("patata", 300, "g"), ("cebolla", 1, "ud"), ("ajo", 2, "diente"),
            ("jamón serrano en taquitos", 100, "g", OPC), ("harina de trigo", 10, "g"),
            ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
           ["Cocer por separado en agua con sal: judías y zanahoria 12 min, patata 15 min, alcachofas y guisantes 5 min. Reservar 300 ml del agua.",
            "Sofreír cebolla y ajo picados 8 min (y el jamón 1 min).",
            "Añadir la harina, tostar 1 min y mojar con el agua de cocción hasta ligar.",
            "Incorporar las verduras y cocer 3 min."])

sugerencia("calabacines_rellenos", "Calabacines rellenos de atún", "verdura", X, "principal", 20, 35, "media",
           ["verdura", "pescado", "horno"], "pescado", "🥒",
           [("calabacín", 5, "ud"), ("cebolla", 1, "ud"), ("atún en aceite", 3, "ud"), ("tomate frito", 200, "g"),
            ("queso rallado", 100, "g"), ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
           ["Partir los calabacines a lo largo, vaciar la pulpa dejando 1 cm y hornearlos 15 min a 200 °C.",
            "Pochar la cebolla y la pulpa picada 10 min.",
            "Añadir tomate frito y atún escurrido.",
            "Rellenar, cubrir con queso y gratinar 10 min."])

sugerencia("ensalada_verde", "Ensalada verde", "ensalada", CX, "guarnicion", 10, 0, "baja",
           ["ligero", "frío", "acompañamiento"], None, "🥗",
           [("lechuga", 2, "ud"), ("pepino", 1, "ud"), ("cebolla", 0.5, "ud"), ("aceitunas sin hueso", 80, "g"),
            ("aceite de oliva virgen extra", 30, "ml"), ("vinagre de vino", 15, "ml"), ("sal", None, AG)],
           ["Lavar y cortar la lechuga, el pepino en rodajas y la cebolla en juliana fina.",
            "Añadir las aceitunas y aliñar al servir."],
           notas="Acompañamiento ligero para cualquier segundo plato.")

if __name__ == "__main__":
    ids = [s["id"] for s in S]
    assert len(ids) == len(set(ids)), "ids duplicados"
    with open("sugerencias.json", "w", encoding="utf-8") as f:
        json.dump({"sugerencias": S}, f, ensure_ascii=False, indent=2)
    print("sugerencias:", len(S))
