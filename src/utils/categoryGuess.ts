import { BASE_RECIPES, SUGGESTIONS } from '../data';

const ALL_RECIPES = [...BASE_RECIPES, ...SUGGESTIONS];
import type { Category } from '../types';
import { SECTION_TO_CATEGORY } from './categories';
import { capitalize } from './format';
import { normalize } from './search';

/** Productos del recetario → pasillo (para autocompletar y sugerir categoría). */
const KNOWN = new Map<string, Category>();
for (const r of ALL_RECIPES)
  for (const i of r.ingredients) if (i.section !== 'aprovechamiento') KNOWN.set(normalize(i.name), SECTION_TO_CATEGORY[i.section]);

export const KNOWN_PRODUCTS: string[] = [
  ...new Set(ALL_RECIPES.flatMap((r) => r.ingredients.filter((i) => i.section !== 'aprovechamiento').map((i) => capitalize(i.name)))),
].sort((a, b) => a.localeCompare(b, 'es'));

const KEYWORDS: [Category, string[]][] = [
  ['Hogar y otros', ['papel', 'detergente', 'lejia', 'jabon', 'suavizante', 'friegasuelos', 'lavavajillas', 'bolsa', 'servilleta', 'estropajo', 'panal', 'champu', 'gel', 'pasta de dientes', 'cepillo', 'pila', 'bombilla', 'film', 'aluminio', 'ambientador', 'toallita', 'compresa', 'desodorante']],
  ['Huevos y lácteos', ['huevo', 'leche', 'yogur', 'queso', 'quesito', 'nata', 'mantequilla', 'kefir', 'cuajada', 'mozzarella', 'parmesano']],
  ['Pescado', ['pescado', 'merluza', 'salmon', 'bonito', 'bacalao', 'sardina', 'boqueron', 'gamba', 'langostino', 'mejillon', 'almeja', 'calamar', 'sepia', 'pulpo', 'lubina', 'dorada', 'rape', 'lenguado', 'pez espada', 'emperador', 'caballa', 'trucha', 'chipiron']],
  ['Carne', ['pollo', 'pavo', 'ternera', 'cerdo', 'cordero', 'conejo', 'carne', 'jamon', 'chorizo', 'lomo', 'salchicha', 'hamburguesa', 'pechuga', 'muslo', 'costilla', 'solomillo', 'bacon', 'fiambre', 'morcilla', 'tocino', 'morcillo']],
  ['Panadería y refrigerados', ['pan', 'barra', 'masa', 'hojaldre', 'bolleria', 'tortilla de trigo']],
  ['Congelados', ['congelad', 'helado', 'guisantes']],
  ['Especias', ['sal', 'pimienta', 'pimenton', 'oregano', 'comino', 'laurel', 'tomillo', 'nuez moscada', 'azafran', 'colorante', 'canela', 'curry']],
  ['Verdura y fruta', ['tomate', 'cebolla', 'ajo', 'patata', 'zanahoria', 'pimiento', 'calabacin', 'berenjena', 'lechuga', 'espinaca', 'acelga', 'brocoli', 'coliflor', 'puerro', 'pepino', 'calabaza', 'judia verde', 'champinon', 'seta', 'manzana', 'platano', 'naranja', 'limon', 'pera', 'fresa', 'uva', 'kiwi', 'melon', 'sandia', 'fruta', 'verdura', 'aguacate', 'perejil', 'hierbabuena', 'albahaca', 'boniato', 'repollo']],
  ['Despensa', ['aceite', 'aove', 'vinagre', 'azucar', 'cafe', 'te', 'cacao', 'miel', 'mermelada', 'caldo', 'tomate frito', 'tomate triturado', 'conserva', 'lata', 'atun', 'aceituna', 'almendra', 'nuez', 'vino', 'agua', 'zumo', 'refresco', 'cerveza', 'chocolate', 'mostaza', 'mayonesa', 'ketchup', 'lenteja', 'garbanzo', 'alubia', 'arroz', 'pasta', 'macarron', 'espagueti', 'fideo', 'harina', 'pan rallado', 'galleta', 'maiz']],
];

/** Sugiere el pasillo del supermercado a partir del nombre escrito por el usuario. */
export function guessCategory(name: string): Category | null {
  const n = normalize(name.trim());
  if (n.length < 2) return null;
  const exact = KNOWN.get(n);
  if (exact) return exact;
  for (const [known, cat] of KNOWN) if (known.startsWith(n) || n.startsWith(known)) return cat;
  // Palabra clave más larga gana ("pan rallado" → Despensa antes que "pan" → Panadería).
  let best: { cat: Category; len: number } | null = null;
  for (const [cat, words] of KEYWORDS) {
    for (const w of words) {
      if (new RegExp(`(^|\\s)${w}`).test(n) && (!best || w.length > best.len)) best = { cat, len: w.length };
    }
  }
  return best?.cat ?? null;
}
