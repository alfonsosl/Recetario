import type { RecipeCategory } from '../types';

/**
 * Fotografías gastronómicas de Unsplash agrupadas por tipo de plato.
 * Si alguna URL falla o no hay conexión, <RecipeImage /> muestra un fallback ilustrado.
 */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70`;

export const IMG = {
  guisoLegumbres: unsplash('1547592166-23ac45744acd'),
  potaje: unsplash('1476718406336-bb5a9690ee2a'),
  estofado: unsplash('1574484284002-952d92456975'),
  crema: unsplash('1547592180-85f173990554'),
  pescadoHorno: unsplash('1485921325833-c519f76c4927'),
  salmon: unsplash('1467003909585-2f8a72700288'),
  pescadoPlancha: unsplash('1519708227418-c8fd9a32b7a2'),
  marisco: unsplash('1565680018434-b513d5e5fd47'),
  paella: unsplash('1534080564583-6be75777b70a'),
  arrozMarinero: unsplash('1515443961218-a51367888e4b'),
  polloGuisado: unsplash('1598103442097-8b74394b95c6'),
  polloAsado: unsplash('1532550907401-a500c9a57435'),
  carneHorno: unsplash('1544025162-d76694265947'),
  carnePlancha: unsplash('1558030006-450675393462'),
  hamburguesa: unsplash('1568901346375-23c9450c58cd'),
  pizza: unsplash('1565299624946-b28f40a0ae38'),
  pastaBolonesa: unsplash('1621996346565-e3dbc646d9a9'),
  pastaCarbonara: unsplash('1563379926898-05f4575a45d8'),
  pastaFria: unsplash('1473093295043-cdd812d0e601'),
  lasana: unsplash('1574894709920-11b28e7367e3'),
  tortilla: unsplash('1525351484163-7529414344d8'),
  huevos: unsplash('1482049016688-2d3e1b311543'),
  ensalada: unsplash('1512621776951-a57141f2eefd'),
  verduras: unsplash('1540189549336-e6e99c3679fe'),
  bowl: unsplash('1546069901-ba9599a7e63c'),
  horneado: unsplash('1490645935967-10de6ba17061'),
} as const;

/** Foto específica para recetas concretas; el resto usa la de su categoría. */
const BY_ID: Record<string, string> = {
  cocido: IMG.potaje,
  garbanzos_espinacas: IMG.potaje,
  sopa_picadillo: IMG.crema,
  arroz_pescado: IMG.arrozMarinero,
  arroz_blanco: IMG.bowl,
  espaguetis_carbonara: IMG.pastaCarbonara,
  lasana_carne: IMG.lasana,
  ensalada_pasta: IMG.pastaFria,
  pollo_horno_patatas: IMG.polloAsado,
  pollo_ajillo: IMG.polloGuisado,
  pechuga_plancha: IMG.polloAsado,
  carne_con_patatas: IMG.estofado,
  albondigas_salsa: IMG.estofado,
  hamburguesas_caseras: IMG.hamburguesa,
  salmon_horno_patatas: IMG.salmon,
  sepia_plancha: IMG.marisco,
  pez_espada_plancha: IMG.pescadoPlancha,
  boquerones_fritos: IMG.pescadoPlancha,
  tortilla_patatas: IMG.tortilla,
  crema_calabacin: IMG.crema,
  crema_calabaza: IMG.crema,
  pizza_casera: IMG.pizza,
  pisto_huevo: IMG.verduras,
};

const BY_CATEGORY: Record<RecipeCategory, string> = {
  legumbre: IMG.guisoLegumbres,
  arroz: IMG.paella,
  pasta: IMG.pastaBolonesa,
  carne: IMG.carnePlancha,
  pescado: IMG.pescadoHorno,
  huevo: IMG.huevos,
  verdura: IMG.verduras,
  ensalada: IMG.ensalada,
  masa_frito: IMG.horneado,
  guarnicion: IMG.bowl,
};

export const imageFor = (id: string, category: RecipeCategory) => BY_ID[id] ?? BY_CATEGORY[category];
