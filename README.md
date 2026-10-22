# Mediterráneo 5 · Planificador Mensual y Lista Colaborativa

PWA mobile-first (React + TypeScript + Vite + Tailwind CSS 4 + Lucide) con:

- **Calendario** de 4 semanas rotativas de dieta mediterránea (comida + cena), con la semana activa calculada automáticamente: `((semanaISO - 1) % 4) + 1`. Selector manual de semana, vista mes e intercambio de cualquier plato por otra de las 56 recetas.
- **Recetario** de 56 platos con cantidades exactas para **5 personas** y preparación paso a paso. Buscador sin tildes por título, etiqueta o ingrediente.
- **Lista Común** multiusuario: identificación rápida (nombre + Código de Hogar), creación desde el menú semanal (suma automática de ingredientes) o desde cero, input rápido estilo chat con categoría sugerida, agrupación por pasillo, marcado táctil y **autoarchivado al 100 %** con cuenta atrás de 2 s e historial.

## Arranque

```bash
npm install
npm run dev        # http://localhost:5173 (también accesible desde el móvil en la red local)
npm run build      # tsc + build de producción en dist/
npm run preview    # sirve dist/ (incluye service worker)
```

## Sincronización de la lista

`src/services/shoppingSync.ts` elige el adaptador al arrancar:

| Variables `.env` | Adaptador | Alcance |
|---|---|---|
| Sin definir | `localStorage` + `BroadcastChannel` | Tiempo real entre pestañas/ventanas del mismo navegador. Cero configuración. |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | Supabase Postgres + Realtime | Tiempo real entre todos los móviles con el mismo Código de Hogar. |

### Conectar Supabase en 1 minuto

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pega y ejecuta [`supabase_schema.sql`](./supabase_schema.sql) (tablas, índices, Realtime y RLS).
3. Settings → API → copia *Project URL* y *anon public key* en `.env` (ver `.env.example`).
4. `npm run build` y despliega. Comparte el Código de Hogar con tu familia.

> Seguridad: el esquema usa un modelo sencillo en el que el Código de Hogar actúa como secreto compartido (cualquiera con la anon key y el código accede a esa lista). Usa un código difícil de adivinar o añade Supabase Auth si lo necesitas.

## Instalar como app (PWA)

- `public/manifest.json`, iconos (incl. *maskable* y `apple-touch-icon`), meta-tags iOS/Android en `index.html` y service worker (`public/sw.js`, solo en producción).
- Android/Chrome: menú ⋮ → *Instalar aplicación*. iOS/Safari: Compartir → *Añadir a pantalla de inicio*.
- Requiere HTTPS en producción (Vercel, Netlify, Cloudflare Pages… sirven `dist/` tal cual).

## Estructura

```
src/
  data/            week1..4.ts (14 recetas cada uno), index.ts, helpers.ts, images.ts
  services/        shoppingSync.ts (Supabase / local)
  hooks/           usePlanner, useShoppingList, useIdentity, useBackToClose, ...
  components/      RecipeImage, RecipeSheet (bottom sheet), RecipePicker, MealCard, BottomNav, shopping/*
  views/           CalendarView, ShoppingView, RecipesView
  utils/           isoWeek, aggregate (suma de ingredientes), format, search, categoryGuess
supabase_schema.sql
```

## Imágenes

Cada receta usa una fotografía de Unsplash (`images.unsplash.com`) agrupada por tipo de plato en `src/data/images.ts`. `<RecipeImage />` muestra un skeleton mientras carga y un fallback ilustrado si la URL falla o no hay conexión. Para personalizar una foto, cambia el ID en `images.ts` o asigna una URL propia en el campo `image` de la receta.
