import { ALL_RECIPES } from '../data';
import type { Category } from '../types';
import { normalize } from './search';

/** Nombres de ingredientes del recetario → categoría (para autocompletar y sugerir). */
const KNOWN = new Map<string, Category>();
for (const r of ALL_RECIPES) for (const i of r.ingredients) if (!i.pantry) KNOWN.set(normalize(i.name), i.category);

export const KNOWN_PRODUCTS: string[] = [...new Set(ALL_RECIPES.flatMap((r) => r.ingredients.filter((i) => !i.pantry).map((i) => i.name)))].sort(
  (a, b) => a.localeCompare(b, 'es'),
);

const KEYWORDS: [Category, string[]][] = [
  ['Hogar y Otros', ['papel', 'detergente', 'lejia', 'jabon', 'suavizante', 'friegasuelos', 'lavavajillas', 'bolsa', 'servilleta', 'estropajo', 'pañal', 'panal', 'champu', 'gel', 'pasta de dientes', 'cepillo', 'pila', 'bombilla', 'film', 'aluminio', 'insecticida', 'ambientador', 'toallita', 'compresa', 'desodorante']],
  ['Huevos y Lácteos', ['huevo', 'leche', 'yogur', 'queso', 'nata', 'mantequilla', 'kefir', 'cuajada', 'requeson', 'mozzarella', 'parmesano']],
  ['Pescados y Mariscos', ['pescado', 'merluza', 'salmon', 'atun', 'bonito', 'bacalao', 'sardina', 'boqueron', 'gamba', 'langostino', 'mejillon', 'almeja', 'calamar', 'sepia', 'pulpo', 'lubina', 'dorada', 'rape', 'lenguado', 'emperador', 'caballa', 'trucha', 'chipiron', 'surimi']],
  ['Carnes y Aves', ['pollo', 'pavo', 'ternera', 'cerdo', 'cordero', 'conejo', 'carne', 'jamon', 'chorizo', 'lomo', 'salchicha', 'hamburguesa', 'pechuga', 'muslo', 'costilla', 'solomillo', 'lacon', 'bacon', 'fiambre', 'morcilla']],
  ['Legumbres y Cereales', ['lenteja', 'garbanzo', 'alubia', 'judion', 'arroz', 'pasta', 'macarron', 'espagueti', 'fideo', 'harina', 'pan', 'avena', 'cereal', 'quinoa', 'cuscus', 'tortilla de trigo', 'galleta', 'biscote']],
  ['Verduras y Hortalizas', ['tomate', 'cebolla', 'ajo', 'patata', 'zanahoria', 'pimiento', 'calabacin', 'berenjena', 'lechuga', 'espinaca', 'acelga', 'brocoli', 'coliflor', 'puerro', 'pepino', 'calabaza', 'judia verde', 'champiñon', 'champinon', 'seta', 'manzana', 'platano', 'naranja', 'limon', 'pera', 'fresa', 'uva', 'kiwi', 'melon', 'sandia', 'fruta', 'verdura', 'aguacate', 'perejil', 'albahaca', 'cilantro', 'boniato', 'alcachofa', 'esparrago', 'rucula', 'canonigo']],
  ['Despensa y AOVE', ['aceite', 'aove', 'sal', 'vinagre', 'especia', 'pimenton', 'azucar', 'cafe', 'te', 'cacao', 'miel', 'mermelada', 'caldo', 'tomate frito', 'conserva', 'lata', 'aceituna', 'frutos secos', 'almendra', 'nuez', 'vino', 'agua', 'zumo', 'refresco', 'cerveza', 'chocolate', 'mostaza', 'mayonesa', 'ketchup', 'oregano', 'comino', 'pimienta']],
];

/** Sugiere la categoría de supermercado a partir del nombre escrito por el usuario. */
export function guessCategory(name: string): Category | null {
  const n = normalize(name.trim());
  if (n.length < 2) return null;
  const exact = KNOWN.get(n);
  if (exact) return exact;
  // Coincidencia parcial con productos del recetario ("salmón" → "Salmón (lomos)").
  for (const [known, cat] of KNOWN) if (known.startsWith(n) || n.startsWith(known)) return cat;
  // Palabras clave: se prioriza la coincidencia más larga para evitar falsos positivos.
  let best: { cat: Category; len: number } | null = null;
  for (const [cat, words] of KEYWORDS) {
    for (const w of words) {
      const re = new RegExp(`(^|\\s)${w}`);
      if (re.test(n) && (!best || w.length > best.len)) best = { cat, len: w.length };
    }
  }
  return best?.cat ?? null;
}
