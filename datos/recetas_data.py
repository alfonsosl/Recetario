# -*- coding: utf-8 -*-
# Catálogo de recetas (5 raciones). Ingredientes: (nombre, cantidad, unidad[, {opcional|de_receta}])
AG = "al_gusto"

SECCIONES = {
    "verdura_fruta": ["cebolla", "zanahoria", "pimiento verde", "pimiento rojo", "patata", "tomate",
                      "ajo", "puerro", "repollo", "lechuga", "limón", "espinacas frescas", "calabaza",
                      "calabacín", "berenjena", "champiñones", "judía verde", "tomate cherry",
                      "perejil fresco", "hierbabuena"],
    "carne": ["morcillo de ternera", "muslos de pollo", "tocino", "chorizo", "hueso de jamón",
              "hueso de ternera", "carne picada mixta", "bacon", "pechuga de pollo",
              "carne de ternera para guisar", "pollo troceado", "lomo de cerdo",
              "carne picada de vacuno", "jamón serrano en taquitos", "jamón york"],
    "pescado": ["lomos de salmón", "pez espada en rodajas", "dorada de ración", "bacalao desalado",
                "merluza en rodajas", "gambas", "calamar", "rape", "boquerones", "sepia limpia",
                "almejas"],
    "huevos_lacteos": ["huevos", "leche entera", "mantequilla", "queso rallado", "queso parmesano rallado",
                       "queso mozzarella", "queso en lonchas", "quesitos"],
    "despensa": ["lentejas pardinas", "garbanzos secos", "garbanzos cocidos", "alubias blancas",
                 "arroz redondo", "arroz largo", "macarrones", "espaguetis", "pasta corta (hélices)",
                 "fideos finos", "placas de lasaña", "harina de trigo", "harina de freír", "pan rallado",
                 "tomate triturado", "tomate frito", "atún en aceite", "maíz dulce", "aceitunas sin hueso",
                 "mayonesa", "aceite de oliva virgen extra", "aceite de girasol", "vinagre de vino",
                 "vino blanco", "caldo de pescado", "caldo de pollo", "caldo de verduras", "azúcar"],
    "panaderia_refrigerados": ["masa de empanada (lámina)", "masa de pizza (lámina)", "pan de hamburguesa",
                               "pan"],
    "congelados": ["guisantes congelados"],
    "especias": ["sal", "pimienta negra", "pimentón dulce", "comino molido", "orégano", "laurel",
                 "nuez moscada", "colorante o azafrán", "tomillo"],
}
SECCION_DE = {n: s for s, ns in SECCIONES.items() for n in ns}

R = []

def receta(id, nombre, categoria, momento, tipo, prep, coc, dif, etiquetas, ingredientes, pasos,
           notas="", origen="usuario", conservacion="", genera=None):
    R.append(dict(id=id, nombre=nombre, categoria=categoria, momento=momento, tipo_plato=tipo,
                  raciones=5, tiempo_prep_min=prep, tiempo_coccion_min=coc, dificultad=dif,
                  etiquetas=etiquetas, origen=origen, ingredientes=ingredientes, pasos=pasos,
                  notas=notas, conservacion=conservacion, genera=genera or []))

C, X, CX = ["comida"], ["cena"], ["comida", "cena"]
OPC = {"opcional": True}

# ---------------- LEGUMBRES ----------------
receta("lentejas_verduras", "Lentejas con verduras (sin carne)", "legumbre", C, "principal", 15, 45, "baja",
       ["vegetariano", "legumbre", "cuchara", "congelable"],
       [("lentejas pardinas", 500, "g"), ("cebolla", 1, "ud"), ("zanahoria", 2, "ud"), ("pimiento verde", 1, "ud"),
        ("tomate", 1, "ud"), ("patata", 400, "g"), ("ajo", 3, "diente"), ("pimentón dulce", 1, "cdta"),
        ("laurel", 2, "hoja"), ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
       ["Lavar las lentejas (las pardinas no necesitan remojo).",
        "Picar cebolla, pimiento, ajo y tomate; pelar y cortar zanahoria en rodajas y patata chascada.",
        "Sofreír cebolla, pimiento y ajo 8 min en el aceite; añadir tomate y 3 min más.",
        "Fuera del fuego, añadir el pimentón y remover para que no se queme.",
        "Añadir lentejas, zanahoria, laurel y cubrir con agua fría (~2 l). Cocer a fuego suave 25 min.",
        "Añadir la patata y cocer 15-20 min más, hasta que lentejas y patata estén tiernas. Salar y reposar 5 min."],
       notas="Si quedan caldosas, aplastar unos trozos de patata para espesar.",
       conservacion="Nevera 4 días; congelan bien sin la patata.")

receta("cocido", "Cocido (carne aparte)", "legumbre", C, "principal", 20, 150, "media",
       ["legumbre", "cuchara", "fin de semana", "genera sobras"],
       [("garbanzos secos", 600, "g"), ("morcillo de ternera", 700, "g"), ("muslos de pollo", 800, "g"),
        ("tocino", 150, "g"), ("chorizo", 200, "g"), ("hueso de jamón", 1, "ud"), ("hueso de ternera", 1, "ud"),
        ("zanahoria", 3, "ud"), ("puerro", 1, "ud"), ("patata", 600, "g"), ("repollo", 400, "g"), ("sal", None, AG)],
       ["La víspera: poner los garbanzos en remojo 12 h en agua templada con una cucharada de sal.",
        "Olla grande con 4 l de agua fría, huesos, morcillo, pollo y tocino. Llevar a ebullición y espumar.",
        "Añadir los garbanzos escurridos (en malla) con el agua ya hirviendo. Cocer a fuego suave 2 h (o 35-40 min en olla rápida).",
        "Cocer el chorizo y el repollo aparte con algo de caldo para que no tiñan el cocido.",
        "Añadir zanahoria, puerro y patata los últimos 30 min. Salar al final.",
        "Servir garbanzos y verduras por un lado y la carne (pringá) aparte.",
        "Reservar 2 l de caldo, ~700 g de carne y ~400 g de garbanzos para sopa, croquetas y ropa vieja."],
       notas="Cantidades pensadas para que sobre para sopa de picadillo, croquetas y ropa vieja.",
       conservacion="Caldo y carne: nevera 3-4 días o congelar.",
       genera=["caldo de cocido", "carne de cocido", "garbanzos de cocido"])

receta("garbanzos_espinacas", "Garbanzos con espinacas", "legumbre", C, "principal", 10, 25, "baja",
       ["vegetariano", "legumbre", "rápido"],
       [("garbanzos cocidos", 1200, "g"), ("espinacas frescas", 500, "g"), ("ajo", 4, "diente"), ("pan", 60, "g"),
        ("comino molido", 1, "cdta"), ("pimentón dulce", 1, "cdta"), ("vinagre de vino", 15, "ml"),
        ("aceite de oliva virgen extra", 50, "ml"), ("huevos", 3, "ud", OPC), ("sal", None, AG)],
       ["Freír en el aceite los ajos laminados y el pan en rebanadas hasta dorar; retirar.",
        "Majar ajo y pan con comino, pimentón y vinagre hasta hacer una pasta.",
        "En el mismo aceite rehogar las espinacas hasta que reduzcan.",
        "Añadir garbanzos escurridos, el majado y 300 ml de agua. Cocer 10-15 min hasta que espese.",
        "Rectificar sal. Opcional: servir con huevo duro picado."],
       origen="nuevo", conservacion="Nevera 3 días.")

receta("alubias_verduras", "Alubias blancas con verduras", "legumbre", C, "principal", 15, 90, "baja",
       ["vegetariano", "legumbre", "cuchara", "congelable"],
       [("alubias blancas", 500, "g"), ("cebolla", 1, "ud"), ("zanahoria", 2, "ud"), ("pimiento verde", 1, "ud"),
        ("puerro", 1, "ud"), ("tomate", 1, "ud"), ("ajo", 2, "diente"), ("pimentón dulce", 1, "cdta"),
        ("laurel", 1, "hoja"), ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
       ["Remojar las alubias 12 h en agua fría.",
        "Ponerlas en olla con agua fría que las cubra, verduras enteras peladas y laurel. Cocer a fuego suave 1 h 30 (25 min en olla rápida), 'asustando' con agua fría 2-3 veces.",
        "Sacar las verduras, triturarlas con un poco de caldo y devolver a la olla.",
        "Sofreír el ajo picado en el aceite, apartar, añadir pimentón y verterlo sobre las alubias.",
        "Cocer 5 min más y salar."],
       origen="nuevo", conservacion="Nevera 4 días; congelan bien.")

receta("ropa_vieja", "Ropa vieja (aprovechamiento de cocido)", "legumbre", C, "principal", 10, 20, "baja",
       ["aprovechamiento", "rápido"],
       [("carne de cocido", 500, "g", {"de_receta": "cocido"}), ("garbanzos de cocido", 400, "g", {"de_receta": "cocido"}),
        ("cebolla", 1, "ud"), ("pimiento rojo", 1, "ud"), ("ajo", 2, "diente"), ("tomate triturado", 200, "g"),
        ("pimentón dulce", 1, "cdta"), ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
       ["Desmigar la carne del cocido y picar el tocino/chorizo sobrante.",
        "Pochar cebolla, pimiento y ajo 10 min.",
        "Añadir tomate y pimentón; 5 min.",
        "Incorporar carne y garbanzos, saltear 5-8 min a fuego medio-alto hasta que se tuesten un poco."],
       origen="nuevo", conservacion="Nevera 2 días.")

receta("sopa_picadillo", "Sopa de picadillo", "legumbre", X, "primero", 5, 15, "baja",
       ["aprovechamiento", "ligero", "cuchara"],
       [("caldo de cocido", 2000, "ml", {"de_receta": "cocido"}), ("fideos finos", 150, "g"), ("huevos", 2, "ud"),
        ("jamón serrano en taquitos", 100, "g"), ("hierbabuena", 0.25, "manojo", OPC)],
       ["Cocer los huevos 10 min, enfriar y picar.",
        "Llevar el caldo a ebullición, añadir los fideos y cocer según el paquete (3-5 min).",
        "Servir con huevo picado, taquitos de jamón y una hoja de hierbabuena."],
       origen="nuevo")

# ---------------- ARROCES ----------------
receta("arroz_blanco", "Arroz blanco", "arroz", CX, "guarnicion", 5, 20, "baja",
       ["guarnición", "vegetariano"],
       [("arroz largo", 450, "g"), ("ajo", 2, "diente"), ("laurel", 1, "hoja"),
        ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
       ["Dorar los ajos enteros chafados en el aceite.",
        "Añadir el arroz y nacarar 1 min.",
        "Agregar el doble de volumen de agua hirviendo (~900 ml), sal y laurel.",
        "Cocer 18 min a fuego bajo tapado y reposar 5 min."],
       notas="Con tomate frito y huevo frito = arroz a la cubana.")

receta("arroz_pescado", "Arroz de pescado", "arroz", C, "principal", 20, 35, "media",
       ["pescado", "marisco"],
       [("arroz redondo", 500, "g"), ("rape", 400, "g"), ("gambas", 300, "g"), ("calamar", 300, "g"),
        ("pimiento rojo", 1, "ud"), ("tomate triturado", 150, "g"), ("ajo", 3, "diente"),
        ("pimentón dulce", 1, "cdta"), ("colorante o azafrán", 1, "cdta"), ("caldo de pescado", 1500, "ml"),
        ("aceite de oliva virgen extra", 60, "ml"), ("sal", None, AG)],
       ["Pelar las gambas (cabezas y cáscaras al caldo 10 min para reforzarlo, colar).",
        "Marcar gambas y rape troceado en el aceite; retirar.",
        "Sofreír calamar en anillas, pimiento y ajo 5 min; añadir tomate y pimentón, 3 min.",
        "Añadir el arroz, nacarar, y verter el caldo caliente con el colorante. Ajustar sal.",
        "Cocer 10 min fuerte y 8 min suave; incorporar rape y gambas los últimos 5 min.",
        "Reposar 5 min tapado."],
       notas="Para meloso, añadir 300 ml más de caldo.")

receta("arroz_pollo", "Arroz con pollo", "arroz", C, "principal", 15, 40, "media", ["carne"],
       [("arroz redondo", 500, "g"), ("pollo troceado", 1000, "g"), ("pimiento rojo", 1, "ud"),
        ("judía verde", 200, "g"), ("tomate triturado", 150, "g"), ("ajo", 3, "diente"),
        ("pimentón dulce", 1, "cdta"), ("colorante o azafrán", 1, "cdta"), ("caldo de pollo", 1300, "ml"),
        ("aceite de oliva virgen extra", 60, "ml"), ("sal", None, AG)],
       ["Salar y dorar bien el pollo en el aceite (10 min).",
        "Añadir pimiento, judía verde troceada y ajo; 5 min.",
        "Añadir tomate y pimentón; 3 min.",
        "Incorporar arroz, nacarar y añadir caldo caliente con colorante.",
        "Cocer 18 min (10 fuerte + 8 suave) y reposar 5 min."])

receta("arroz_chorizo", "Arroz con chorizo", "arroz", C, "principal", 10, 30, "baja", ["carne"],
       [("arroz redondo", 500, "g"), ("chorizo", 250, "g"), ("cebolla", 1, "ud"), ("pimiento rojo", 1, "ud"),
        ("ajo", 2, "diente"), ("tomate triturado", 150, "g"), ("guisantes congelados", 150, "g"),
        ("pimentón dulce", 1, "cdta"), ("caldo de pollo", 1200, "ml"),
        ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
       ["Dorar el chorizo en rodajas en el aceite; retirar parte si suelta mucha grasa.",
        "Sofreír cebolla, pimiento y ajo 8 min; añadir tomate y pimentón.",
        "Añadir arroz, nacarar y verter caldo caliente.",
        "A los 10 min añadir los guisantes. Total 18 min; reposar 5 min."])

# ---------------- PASTA ----------------
receta("macarrones_bolonesa", "Macarrones a la boloñesa", "pasta", C, "principal", 10, 35, "baja",
       ["carne", "congelable (salsa)"],
       [("macarrones", 500, "g"), ("carne picada mixta", 500, "g"), ("cebolla", 1, "ud"), ("zanahoria", 1, "ud"),
        ("ajo", 2, "diente"), ("tomate triturado", 800, "g"), ("queso rallado", 100, "g"), ("orégano", 1, "cdta"),
        ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG), ("pimienta negra", None, AG)],
       ["Picar fino cebolla, zanahoria y ajo; pochar 10 min.",
        "Añadir la carne, salpimentar y dorar desmenuzando.",
        "Añadir tomate y orégano; cocer 20 min a fuego suave.",
        "Cocer la pasta según paquete, escurrir y mezclar con la salsa.",
        "Servir con queso rallado (opcional: gratinar 5 min)."],
       conservacion="Salsa: nevera 4 días, congela bien.")

receta("espaguetis_carbonara", "Espaguetis carbonara", "pasta", C, "principal", 10, 15, "baja", ["rápido"],
       [("espaguetis", 500, "g"), ("bacon", 250, "g"), ("huevos", 6, "ud"), ("queso parmesano rallado", 120, "g"),
        ("pimienta negra", None, AG), ("sal", None, AG)],
       ["Batir 5 yemas + 1 huevo entero con el queso y mucha pimienta.",
        "Dorar el bacon en tiras sin aceite.",
        "Cocer la pasta; reservar 200 ml del agua.",
        "Fuera del fuego, mezclar pasta con bacon y su grasa, añadir la mezcla de huevo y agua de cocción poco a poco removiendo hasta que quede cremosa (sin cuajar)."],
       notas="Versión con nata: sustituir parte del huevo por 200 ml de nata. Las claras sobrantes sirven para tortilla.")

receta("lasana_carne", "Lasaña de carne", "pasta", C, "principal", 30, 40, "media",
       ["carne", "horno", "congelable"],
       [("placas de lasaña", 15, "ud"), ("carne picada mixta", 600, "g"), ("cebolla", 1, "ud"), ("zanahoria", 1, "ud"),
        ("ajo", 2, "diente"), ("tomate triturado", 400, "g"), ("leche entera", 800, "ml"), ("harina de trigo", 70, "g"),
        ("mantequilla", 70, "g"), ("queso rallado", 150, "g"), ("nuez moscada", None, AG),
        ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG), ("pimienta negra", None, AG)],
       ["Hacer la boloñesa: pochar verduras picadas, dorar carne, añadir tomate y cocer 15 min.",
        "Bechamel: fundir mantequilla, tostar harina 2 min, añadir leche caliente poco a poco hasta espesar; sal y nuez moscada.",
        "Hidratar las placas según el paquete.",
        "Montar capas: bechamel, placas, carne… terminar en bechamel y queso.",
        "Hornear a 200 °C 25 min y gratinar 5 min."],
       origen="nuevo", conservacion="Congela bien en porciones.")

receta("ensalada_pasta", "Ensalada de pasta", "ensalada", CX, "principal", 15, 12, "baja",
       ["frío", "pescado", "táper"],
       [("pasta corta (hélices)", 500, "g"), ("atún en aceite", 3, "ud"), ("tomate cherry", 250, "g"),
        ("maíz dulce", 150, "g"), ("aceitunas sin hueso", 100, "g"), ("huevos", 2, "ud"),
        ("aceite de oliva virgen extra", 50, "ml"), ("vinagre de vino", 15, "ml"), ("orégano", None, AG), ("sal", None, AG)],
       ["Cocer la pasta, enfriar con agua y escurrir bien.",
        "Cocer los huevos 10 min y trocear.",
        "Mezclar pasta, atún, tomates partidos, maíz, aceitunas y huevo.",
        "Aliñar con aceite, vinagre, sal y orégano."],
       notas="Atún: latas de ~80 g escurrido.", conservacion="Nevera 2 días (aliñar al servir).")

# ---------------- CARNES ----------------
receta("filetes_empanados", "Filetes empanados", "carne", CX, "principal", 15, 15, "baja", ["carne", "frito"],
       [("pechuga de pollo", 800, "g"), ("huevos", 2, "ud"), ("pan rallado", 200, "g"), ("harina de trigo", 50, "g"),
        ("ajo", 1, "diente"), ("perejil fresco", 0.25, "manojo"), ("aceite de girasol", 300, "ml"), ("sal", None, AG)],
       ["Filetear finas las pechugas y salar. Opcional: marinar con ajo y perejil picados 15 min.",
        "Pasar por harina, huevo batido y pan rallado.",
        "Freír en aceite a 175 °C 2-3 min por lado.",
        "Escurrir en papel absorbente."],
       notas="Válido también con filetes de ternera o lomo.", conservacion="Empanados crudos congelan bien.")

receta("carne_con_patatas", "Carne con patatas (guiso)", "carne", C, "principal", 20, 90, "media",
       ["carne", "cuchara", "congelable"],
       [("carne de ternera para guisar", 1000, "g"), ("patata", 1000, "g"), ("cebolla", 1, "ud"), ("zanahoria", 2, "ud"),
        ("pimiento rojo", 1, "ud"), ("ajo", 3, "diente"), ("tomate triturado", 200, "g"), ("vino blanco", 150, "ml"),
        ("guisantes congelados", 150, "g", OPC), ("laurel", 2, "hoja"), ("pimentón dulce", 1, "cdta"),
        ("aceite de oliva virgen extra", 50, "ml"), ("sal", None, AG), ("pimienta negra", None, AG)],
       ["Salpimentar la carne en tacos y dorarla por tandas; retirar.",
        "Pochar cebolla, pimiento, zanahoria y ajo 10 min; añadir tomate y pimentón.",
        "Volver la carne, añadir vino y reducir 2 min. Cubrir con agua (~800 ml) y laurel.",
        "Guisar 60 min a fuego suave (20 min en olla rápida).",
        "Añadir patatas chascadas (y guisantes) y cocer 25 min más hasta que estén tiernas."])

receta("pollo_horno_patatas", "Pollo al horno con patatas", "carne", C, "principal", 15, 60, "baja",
       ["carne", "horno"],
       [("pollo troceado", 1500, "g"), ("patata", 1000, "g"), ("cebolla", 2, "ud"), ("limón", 1, "ud"),
        ("ajo", 5, "diente"), ("vino blanco", 150, "ml"), ("tomillo", None, AG),
        ("aceite de oliva virgen extra", 60, "ml"), ("sal", None, AG), ("pimienta negra", None, AG)],
       ["Precalentar horno a 200 °C.",
        "Base de patatas en rodajas de 0,5 cm y cebolla en juliana, con sal y aceite.",
        "Encima el pollo salpimentado, ajos chafados, tomillo y rodajas de limón.",
        "Regar con el vino y el resto del aceite.",
        "Hornear 50-60 min, dando la vuelta al pollo a mitad, hasta que esté dorado."],
       origen="nuevo")

receta("pollo_ajillo", "Pollo al ajillo", "carne", C, "principal", 10, 35, "baja", ["carne"],
       [("pollo troceado", 1500, "g"), ("ajo", 10, "diente"), ("vino blanco", 150, "ml"), ("laurel", 1, "hoja"),
        ("perejil fresco", 0.25, "manojo"), ("aceite de oliva virgen extra", 80, "ml"), ("sal", None, AG)],
       ["Salar el pollo en trozos pequeños.",
        "Dorar en el aceite a fuego medio 15 min por todas las caras.",
        "Añadir los ajos laminados y laurel; 3 min sin que se quemen.",
        "Verter el vino, tapar y cocer 15 min a fuego suave. Espolvorear perejil."],
       origen="nuevo")

receta("albondigas_salsa", "Albóndigas en salsa", "carne", C, "principal", 25, 35, "media",
       ["carne", "congelable"],
       [("carne picada mixta", 750, "g"), ("huevos", 1, "ud"), ("pan rallado", 50, "g"), ("leche entera", 50, "ml"),
        ("ajo", 3, "diente"), ("perejil fresco", 0.25, "manojo"), ("harina de trigo", 50, "g"),
        ("cebolla", 1, "ud"), ("zanahoria", 1, "ud"), ("tomate triturado", 300, "g"), ("vino blanco", 100, "ml"),
        ("caldo de pollo", 300, "ml"), ("aceite de oliva virgen extra", 60, "ml"), ("sal", None, AG)],
       ["Mezclar carne, huevo, pan rallado mojado en leche, 2 ajos y perejil picados, sal. Formar bolas.",
        "Enharinar y dorar las albóndigas; retirar.",
        "En el mismo aceite pochar cebolla, zanahoria y ajo 10 min; añadir tomate y vino, 5 min.",
        "Añadir caldo, triturar la salsa y volver las albóndigas. Cocer 15 min."],
       notas="Buena guarnición: patatas fritas o arroz blanco.", origen="nuevo")

receta("lomo_plancha", "Lomo de cerdo a la plancha", "carne", CX, "principal", 5, 10, "baja",
       ["carne", "rápido", "ligero"],
       [("lomo de cerdo", 900, "g"), ("ajo", 2, "diente"), ("perejil fresco", 0.25, "manojo"),
        ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
       ["Majar ajo y perejil con el aceite.",
        "Plancha muy caliente, filetes 1-2 min por lado; salar.",
        "Servir con el majado por encima."],
       origen="nuevo")

receta("pechuga_plancha", "Pechuga de pollo a la plancha", "carne", CX, "principal", 5, 10, "baja",
       ["carne", "rápido", "ligero"],
       [("pechuga de pollo", 900, "g"), ("limón", 1, "ud"), ("ajo", 1, "diente"), ("orégano", None, AG),
        ("aceite de oliva virgen extra", 20, "ml"), ("sal", None, AG)],
       ["Filetear, marinar 10 min con limón, ajo rallado, orégano, aceite y sal.",
        "Plancha caliente 3 min por lado."],
       origen="nuevo")

receta("hamburguesas_caseras", "Hamburguesas caseras", "carne", X, "principal", 15, 10, "baja",
       ["carne", "fin de semana"],
       [("carne picada de vacuno", 900, "g"), ("huevos", 1, "ud"), ("pan rallado", 30, "g"), ("cebolla", 1, "ud"),
        ("pan de hamburguesa", 5, "ud"), ("queso en lonchas", 5, "ud"), ("lechuga", 1, "ud"), ("tomate", 2, "ud"),
        ("sal", None, AG), ("pimienta negra", None, AG)],
       ["Mezclar carne, huevo, pan rallado, sal y pimienta. Formar 5 hamburguesas de ~180 g.",
        "Plancha fuerte 3-4 min por lado; poner el queso el último minuto.",
        "Tostar el pan y montar con lechuga, tomate y cebolla en aros."],
       origen="nuevo")

receta("berenjenas_rellenas", "Berenjenas rellenas de carne", "verdura", C, "principal", 25, 45, "media",
       ["carne", "verdura", "horno"],
       [("berenjena", 4, "ud"), ("carne picada mixta", 400, "g"), ("cebolla", 1, "ud"), ("tomate triturado", 300, "g"),
        ("leche entera", 400, "ml"), ("harina de trigo", 35, "g"), ("mantequilla", 35, "g"), ("queso rallado", 100, "g"),
        ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG), ("nuez moscada", None, AG)],
       ["Partir las berenjenas a lo largo, hacer cortes en la pulpa, salar, aceitar y hornear 25 min a 200 °C.",
        "Vaciar la pulpa con cuchara y picarla.",
        "Pochar cebolla, dorar carne, añadir pulpa y tomate; 10 min.",
        "Rellenar, cubrir con bechamel (mantequilla + harina + leche) y queso.",
        "Gratinar 10 min."],
       origen="nuevo")

# ---------------- PESCADOS ----------------
receta("salmon_horno_patatas", "Salmón al horno con patatas", "pescado", CX, "principal", 15, 40, "baja",
       ["pescado azul", "horno"],
       [("lomos de salmón", 900, "g"), ("patata", 1000, "g"), ("cebolla", 1, "ud"), ("limón", 1, "ud"),
        ("ajo", 2, "diente"), ("vino blanco", 100, "ml"), ("perejil fresco", 0.25, "manojo"),
        ("aceite de oliva virgen extra", 50, "ml"), ("sal", None, AG)],
       ["Horno a 200 °C. Patatas en rodajas finas y cebolla en juliana con sal y aceite: hornear 25 min.",
        "Colocar encima el salmón salado, ajo y perejil picados, rodajas de limón y el vino.",
        "Hornear 12-15 min más (según grosor)."])

receta("pez_espada_plancha", "Pez espada a la plancha", "pescado", CX, "principal", 5, 8, "baja",
       ["pescado", "rápido", "ligero"],
       [("pez espada en rodajas", 900, "g"), ("limón", 1, "ud"), ("ajo", 2, "diente"),
        ("perejil fresco", 0.25, "manojo"), ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
       ["Majar ajo, perejil, aceite y unas gotas de limón.",
        "Plancha muy caliente: 2-3 min por lado (rodajas de 2 cm). Salar.",
        "Servir con el majado."],
       notas="No pasarlo de punto: se seca rápido.")

receta("dorada_frita", "Dorada frita", "pescado", CX, "principal", 10, 15, "baja", ["pescado", "frito"],
       [("dorada de ración", 5, "ud"), ("harina de freír", 150, "g"), ("aceite de girasol", 500, "ml"),
        ("limón", 1, "ud"), ("sal", None, AG)],
       ["Pedir en pescadería limpia y con cortes en el lomo.",
        "Salar, enharinar y sacudir el exceso.",
        "Freír en aceite abundante a 180 °C 4-5 min por lado.",
        "Escurrir y servir con limón."])

receta("merluza_salsa_verde", "Merluza en salsa verde", "pescado", CX, "principal", 10, 20, "baja",
       ["pescado blanco", "ligero"],
       [("merluza en rodajas", 1000, "g"), ("ajo", 4, "diente"), ("perejil fresco", 0.5, "manojo"),
        ("harina de trigo", 20, "g"), ("vino blanco", 100, "ml"), ("caldo de pescado", 300, "ml"),
        ("guisantes congelados", 150, "g"), ("almejas", 300, "g", OPC),
        ("aceite de oliva virgen extra", 50, "ml"), ("sal", None, AG)],
       ["Dorar el ajo picado en el aceite sin que se queme; añadir la harina y tostar 1 min.",
        "Añadir vino, luego caldo poco a poco removiendo hasta ligar.",
        "Incorporar la merluza salada, guisantes (y almejas); cocer 6-8 min moviendo la cazuela.",
        "Espolvorear perejil picado."],
       origen="nuevo")

receta("bacalao_tomate", "Bacalao con tomate", "pescado", CX, "principal", 15, 30, "baja", ["pescado blanco"],
       [("bacalao desalado", 900, "g"), ("tomate triturado", 600, "g"), ("cebolla", 1, "ud"), ("pimiento rojo", 1, "ud"),
        ("ajo", 2, "diente"), ("harina de trigo", 40, "g"), ("azúcar", 5, "g"),
        ("aceite de oliva virgen extra", 80, "ml"), ("sal", None, AG)],
       ["Secar, enharinar y marcar el bacalao 2 min por lado; reservar.",
        "Pochar cebolla, pimiento y ajo 10 min.",
        "Añadir tomate y azúcar; cocer 15 min.",
        "Incorporar el bacalao y cocer 5-6 min en la salsa."],
       notas="Si el bacalao es salado, desalar 36-48 h cambiando el agua cada 8 h.", origen="nuevo")

receta("boquerones_fritos", "Boquerones fritos", "pescado", CX, "principal", 20, 15, "baja",
       ["pescado azul", "frito"],
       [("boquerones", 1000, "g"), ("harina de freír", 200, "g"), ("aceite de girasol", 500, "ml"),
        ("limón", 1, "ud"), ("sal", None, AG)],
       ["Limpiar (quitar cabeza y tripa), lavar y escurrir bien.",
        "Salar, enharinar en abanicos de 4-5 y sacudir.",
        "Freír a 180 °C en tandas 2 min.",
        "Escurrir y servir con limón."],
       origen="nuevo")

receta("sepia_plancha", "Sepia a la plancha", "pescado", CX, "principal", 5, 10, "baja",
       ["marisco", "rápido", "ligero"],
       [("sepia limpia", 1000, "g"), ("ajo", 3, "diente"), ("perejil fresco", 0.25, "manojo"), ("limón", 1, "ud"),
        ("aceite de oliva virgen extra", 50, "ml"), ("sal", None, AG)],
       ["Cortar la sepia en tiras o trozos y secar bien.",
        "Plancha muy caliente, 3-4 min hasta dorar; salar.",
        "Regar con majado de ajo, perejil, aceite y limón."],
       origen="nuevo")

# ---------------- CROQUETAS ----------------
def croquetas(id, nombre, base, extra, origen="usuario", genera_de=None):
    ings = [base] + extra + [("leche entera", 900, "ml"), ("harina de trigo", 100, "g"), ("mantequilla", 80, "g"),
                             ("cebolla", 0.5, "ud"), ("nuez moscada", None, AG), ("huevos", 2, "ud"),
                             ("pan rallado", 200, "g"), ("aceite de girasol", 500, "ml"), ("sal", None, AG)]
    receta(id, nombre, "masa_frito", CX, "principal", 40, 30, "media", ["frito", "congelable"],
           ings,
           ["Pochar la cebolla muy picada en la mantequilla; añadir el relleno picado fino y rehogar 2 min.",
            "Añadir la harina y tostar 2-3 min.",
            "Incorporar la leche caliente poco a poco removiendo 10-12 min hasta masa espesa que se despegue. Sal y nuez moscada.",
            "Extender en fuente, filmar a piel y enfriar mínimo 4 h (mejor de un día para otro).",
            "Formar ~35 croquetas, pasar por huevo y pan rallado.",
            "Freír en aceite a 180 °C en tandas pequeñas hasta dorar."],
           notas="Salen ~35 uds. Congelar crudas ya empanadas y freír sin descongelar.",
           conservacion="Crudas congeladas 3 meses.", origen=origen)

croquetas("croquetas_cocido", "Croquetas de cocido", ("carne de cocido", 400, "g", {"de_receta": "cocido"}), [])
croquetas("croquetas_bacalao", "Croquetas de bacalao", ("bacalao desalado", 300, "g"), [("ajo", 1, "diente")])
croquetas("croquetas_pollo", "Croquetas de pollo", ("pechuga de pollo", 400, "g"),
          [("jamón serrano en taquitos", 50, "g", OPC)])

# ---------------- HUEVOS ----------------
receta("huevos_fritos", "Huevos fritos", "huevo", CX, "principal", 2, 8, "baja", ["huevo", "rápido"],
       [("huevos", 10, "ud"), ("aceite de oliva virgen extra", 200, "ml"), ("sal", None, AG)],
       ["Calentar el aceite (2 cm) en sartén pequeña hasta que humee ligeramente.",
        "Freír de uno en uno, regando la clara con aceite para la puntilla, 1 min.",
        "Escurrir y salar."],
       notas="El aceite se puede colar y reutilizar.")

receta("tortilla_francesa", "Tortilla francesa", "huevo", X, "principal", 2, 5, "baja",
       ["huevo", "rápido", "ligero"],
       [("huevos", 10, "ud"), ("aceite de oliva virgen extra", 20, "ml"), ("sal", None, AG)],
       ["Batir 2 huevos por persona con sal.",
        "Sartén antiadherente con unas gotas de aceite a fuego medio.",
        "Verter, cuajar 30-60 s moviendo y doblar en tres."],
       notas="Variantes: queso, jamón york, atún, espinacas.")

receta("tortilla_patatas", "Tortilla de patatas con cebolla", "huevo", CX, "principal", 15, 35, "media",
       ["huevo", "vegetariano"],
       [("patata", 1200, "g"), ("cebolla", 2, "ud"), ("huevos", 9, "ud"),
        ("aceite de oliva virgen extra", 400, "ml"), ("sal", None, AG)],
       ["Pelar y cortar las patatas en láminas finas; cebolla en juliana.",
        "Pochar en abundante aceite a fuego medio 20-25 min (sin dorar). Escurrir el aceite (reutilizable).",
        "Mezclar con los huevos batidos y sal; reposar 5 min.",
        "Cuajar en sartén con un hilo de aceite 3 min, voltear con plato y 2 min más."],
       notas="El aceite colado se reutiliza: el consumo real ronda 80-100 ml.")

receta("revuelto_champinones", "Revuelto de champiñones y jamón", "huevo", X, "principal", 10, 10, "baja",
       ["huevo", "rápido", "ligero"],
       [("huevos", 10, "ud"), ("champiñones", 500, "g"), ("jamón serrano en taquitos", 100, "g"),
        ("ajo", 2, "diente"), ("perejil fresco", 0.25, "manojo"), ("aceite de oliva virgen extra", 30, "ml"),
        ("sal", None, AG)],
       ["Saltear champiñones laminados con ajo a fuego fuerte hasta que evaporen el agua.",
        "Añadir el jamón 1 min.",
        "Bajar el fuego, añadir los huevos batidos y remover hasta cuajar jugosos. Perejil."],
       origen="nuevo")

receta("pisto_huevo", "Pisto con huevo", "verdura", CX, "principal", 15, 40, "baja",
       ["vegetariano", "verdura", "congelable (pisto)"],
       [("calabacín", 2, "ud"), ("berenjena", 1, "ud"), ("pimiento rojo", 1, "ud"), ("pimiento verde", 1, "ud"),
        ("cebolla", 2, "ud"), ("ajo", 2, "diente"), ("tomate triturado", 400, "g"), ("huevos", 5, "ud"),
        ("azúcar", 5, "g"), ("aceite de oliva virgen extra", 60, "ml"), ("sal", None, AG)],
       ["Picar todas las verduras en dados.",
        "Pochar cebolla y ajo 5 min, añadir pimientos 10 min, luego berenjena y calabacín 10 min.",
        "Añadir tomate y azúcar; cocer 15 min.",
        "Servir con un huevo frito o cuajar los huevos encima tapado 4 min."],
       origen="nuevo")

# ---------------- PATATAS / GUARNICIONES ----------------
receta("patatas_fritas", "Patatas fritas caseras", "guarnicion", CX, "guarnicion", 10, 20, "baja",
       ["guarnición", "frito", "vegetariano"],
       [("patata", 1500, "g"), ("aceite de girasol", 750, "ml"), ("sal", None, AG)],
       ["Cortar en bastones, lavar para quitar almidón y secar muy bien.",
        "Primera fritura a 150 °C 6-8 min; escurrir.",
        "Segunda fritura a 185 °C 2-3 min hasta dorar. Salar."],
       notas="El aceite colado se reutiliza 2-3 veces.")

receta("judias_verdes_patatas", "Judías verdes con patatas", "verdura", C, "primero", 10, 25, "baja",
       ["verdura", "ligero"],
       [("judía verde", 1000, "g"), ("patata", 600, "g"), ("ajo", 3, "diente"), ("jamón serrano en taquitos", 100, "g", OPC),
        ("pimentón dulce", 1, "cdta"), ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
       ["Cocer judías troceadas y patatas en dados en agua con sal 15-20 min; escurrir.",
        "Sofreír ajo laminado (y jamón) en el aceite; apartar y añadir pimentón.",
        "Rehogar las verduras en el refrito 2 min."],
       origen="nuevo")

# ---------------- CREMAS ----------------
receta("crema_calabacin", "Crema de calabacín", "verdura", X, "primero", 10, 25, "baja",
       ["vegetariano", "ligero", "congelable"],
       [("calabacín", 4, "ud"), ("cebolla", 1, "ud"), ("patata", 300, "g"), ("caldo de verduras", 800, "ml"),
        ("quesitos", 4, "ud", OPC), ("aceite de oliva virgen extra", 30, "ml"), ("sal", None, AG)],
       ["Pochar la cebolla 5 min.",
        "Añadir calabacín (con piel) y patata troceados, rehogar 3 min.",
        "Cubrir con caldo y cocer 20 min.",
        "Triturar (con los quesitos si se usan) y ajustar sal."],
       origen="nuevo")

receta("crema_calabaza", "Crema de calabaza", "verdura", X, "primero", 15, 30, "baja",
       ["vegetariano", "ligero", "temporada otoño", "congelable"],
       [("calabaza", 1200, "g"), ("zanahoria", 2, "ud"), ("cebolla", 1, "ud"), ("puerro", 1, "ud"),
        ("patata", 300, "g"), ("caldo de verduras", 1000, "ml"), ("aceite de oliva virgen extra", 30, "ml"),
        ("sal", None, AG), ("nuez moscada", None, AG)],
       ["Pochar cebolla y puerro 8 min.",
        "Añadir calabaza, zanahoria y patata troceadas; rehogar 3 min.",
        "Cubrir con caldo y cocer 25 min.",
        "Triturar fino y ajustar sal y nuez moscada."],
       origen="nuevo")

# ---------------- ENSALADAS ----------------
receta("ensalada_mixta", "Ensalada mixta", "ensalada", CX, "primero", 15, 10, "baja", ["frío", "ligero"],
       [("lechuga", 2, "ud"), ("tomate", 4, "ud"), ("cebolla", 1, "ud"), ("zanahoria", 1, "ud"),
        ("atún en aceite", 3, "ud"), ("huevos", 3, "ud"), ("maíz dulce", 150, "g"), ("aceitunas sin hueso", 100, "g"),
        ("aceite de oliva virgen extra", 40, "ml"), ("vinagre de vino", 20, "ml"), ("sal", None, AG)],
       ["Cocer los huevos 10 min.",
        "Lavar y cortar lechuga, tomate, cebolla en juliana y zanahoria rallada.",
        "Añadir atún, huevo, maíz y aceitunas. Aliñar al servir."],
       notas="Como acompañamiento de un segundo, se puede reducir a la mitad.")

receta("ensalada_pollo_mayonesa", "Ensalada de pollo con mayonesa", "ensalada", CX, "principal", 15, 15, "baja",
       ["frío", "carne"],
       [("pechuga de pollo", 600, "g"), ("lechuga", 1, "ud"), ("maíz dulce", 150, "g"), ("huevos", 2, "ud"),
        ("mayonesa", 200, "g"), ("sal", None, AG), ("pimienta negra", None, AG)],
       ["Cocer la pechuga en agua con sal y laurel 15 min; enfriar y desmigar.",
        "Cocer los huevos 10 min y picar.",
        "Mezclar pollo, huevo, maíz y mayonesa; salpimentar.",
        "Servir sobre la lechuga cortada."],
       conservacion="Mezcla con mayonesa: nevera máx. 24 h.")

# ---------------- MASAS ----------------
receta("empanada_atun", "Empanada de atún con verduras", "masa_frito", CX, "principal", 25, 35, "media",
       ["pescado", "horno", "táper"],
       [("masa de empanada (lámina)", 2, "ud"), ("atún en aceite", 4, "ud"), ("cebolla", 2, "ud"),
        ("pimiento rojo", 1, "ud"), ("pimiento verde", 1, "ud"), ("tomate frito", 300, "g"), ("huevos", 3, "ud"),
        ("aceite de oliva virgen extra", 40, "ml"), ("sal", None, AG)],
       ["Pochar cebolla y pimientos en juliana 15 min; añadir tomate frito 5 min.",
        "Mezclar con el atún escurrido y 2 huevos duros picados; enfriar.",
        "Extender una lámina en bandeja, rellenar, cubrir con la otra y sellar bordes.",
        "Pintar con huevo batido, hacer un agujero central.",
        "Hornear a 190 °C 30-35 min."])

receta("empanada_queso", "Empanada de queso", "masa_frito", CX, "principal", 10, 30, "baja",
       ["horno", "vegetariano (sin york)"],
       [("masa de empanada (lámina)", 2, "ud"), ("queso mozzarella", 400, "g"), ("jamón york", 200, "g", OPC),
        ("huevos", 1, "ud"), ("orégano", None, AG)],
       ["Extender una lámina, cubrir con queso (y york) y orégano.",
        "Tapar con la otra lámina, sellar y pintar con huevo.",
        "Hornear a 190 °C 25-30 min."],
       notas="Mezclar mozzarella con un queso más curado mejora el sabor.")

receta("pizza_casera", "Pizza casera", "masa_frito", X, "principal", 10, 15, "baja", ["horno", "fin de semana"],
       [("masa de pizza (lámina)", 2, "ud"), ("tomate frito", 200, "g"), ("queso mozzarella", 250, "g"),
        ("jamón york", 150, "g"), ("champiñones", 200, "g"), ("orégano", None, AG)],
       ["Horno a 220 °C.",
        "Extender las masas, cubrir con tomate, mozzarella, york y champiñones laminados.",
        "Hornear 12-15 min. Orégano al sacar."],
       origen="nuevo")
