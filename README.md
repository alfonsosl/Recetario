# Mediterráneo 5 · Planificador Mensual y Lista Colaborativa

PWA mobile-first (React + TypeScript + Vite + Tailwind CSS 4 + Lucide) con:

- **Calendario** de 4 semanas rotativas (comida + cena, con 1 o 2 platos cada una), con la semana activa calculada automáticamente: `((semanaISO - 1) % 4) + 1`. Selector manual de semana, vista mes, balance semanal (legumbre / pescado / carne / huevo) e intercambio de cualquier plato.
- **Recetario** de 47 recetas para **5 personas**: ingredientes (opcionales y sobras de otra receta señalados), pasos, notas, conservación y en qué días del plan aparece cada una.
- **Lista Común** multiusuario: identificación rápida (nombre + Código de Hogar), creación desde el menú semanal (suma automática de ingredientes) o desde cero, input rápido estilo chat con categoría sugerida, agrupación por pasillo, marcado táctil y **autoarchivado al 100 %** con cuenta atrás de 2 s e historial.

## Arranque

```bash
npm install
npm run dev        # http://localhost:5173 (también accesible desde el móvil en la red local)
npm run build      # tsc + build de producción en dist/
npm run preview    # sirve dist/ (incluye service worker)
```

## Datos del recetario

La fuente única es `src/data/recetario.json`, generado a partir de:

- `datos/recetas_data.py` — catálogo de recetas y secciones de supermercado.
- `datos/build.py` — plan mensual, listas de la compra y balance semanal.

Para cambiar recetas o el plan: edita esos archivos y ejecuta `npm run datos` (regenera y copia el JSON). La app adapta el JSON en `src/data/index.ts`.

La lista de la compra que genera la app sigue las mismas reglas que `build.py` (comprobado: coincide al 100 % en las 4 semanas): g/ml redondeados a 50 hacia arriba, ajo en cabezas, sin opcionales ni sobras de otras recetas, y especias / "al gusto" como productos a revisar en la despensa.

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

## App Android (APK)

`android/` es el proyecto Capacitor. Cada push compila el APK en GitHub Actions (`.github/workflows/android-apk.yml`) y lo publica en Releases:
`https://github.com/alfonsosl/Recetario/releases/latest/download/Mediterraneo5.apk`

## Estructura

```
datos/             recetas_data.py, build.py (generan el JSON)
src/
  data/            recetario.json, index.ts (adaptador), images.ts
  services/        shoppingSync.ts (Supabase / local)
  hooks/           usePlanner, useShoppingList, useIdentity, useBackToClose, ...
  components/      RecipeImage, RecipeSheet (bottom sheet), RecipePicker, MealCard, BottomNav, shopping/*
  views/           CalendarView, ShoppingView, RecipesView
  utils/           isoWeek, aggregate (suma de ingredientes), format, search, categoryGuess
supabase_schema.sql
```

## Imágenes

El recetario no incluye fotos: cada receta usa una fotografía de Unsplash según su tipo de plato (`src/data/images.ts`). `<RecipeImage />` muestra un skeleton mientras carga y un fallback ilustrado si la URL falla o no hay conexión. Para personalizar una foto, cambia el ID en `images.ts` o asigna una URL propia en el campo `image` de la receta.
