import type { Category, Ingredient, Unit } from '../types';

export const VER: Category = 'Verduras y Hortalizas';
export const CAR: Category = 'Carnes y Aves';
export const PES: Category = 'Pescados y Mariscos';
export const LEG: Category = 'Legumbres y Cereales';
export const LAC: Category = 'Huevos y Lácteos';
export const DES: Category = 'Despensa y AOVE';
export const HOG: Category = 'Hogar y Otros';

export const ing = (
  name: string,
  quantity: number,
  unit: Unit,
  category: Category,
  note?: string,
): Ingredient => (note ? { name, quantity, unit, category, note } : { name, quantity, unit, category });

/* Básicos con nombre fijo para que se sumen correctamente en la lista de la compra. */
export const aove = (ml: number, note?: string): Ingredient => ing('Aceite de oliva virgen extra', ml, 'ml', DES, note);
export const sal = (): Ingredient => ing('Sal', 0, 'al gusto', DES);
export const pimienta = (): Ingredient => ing('Pimienta negra molida', 0, 'al gusto', DES);
export const ajo = (dientes: number): Ingredient => ing('Ajo', dientes, 'diente', VER);
export const laurel = (hojas: number): Ingredient => ing('Laurel', hojas, 'hoja', DES);
export const pimenton = (cdta: number): Ingredient => ing('Pimentón dulce de la Vera', cdta, 'cdta', DES);
export const agua = (ml: number, note?: string): Ingredient => ({
  ...ing('Agua', ml, 'ml', DES, note),
  pantry: true,
});
