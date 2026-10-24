# Montar Mediterráneo 5 como web + lista de la compra en Supabase (gratis)

Resultado final:

- Web: **https://alfonsosl.github.io/Recetario/** (GitHub Pages, gratis en repositorios públicos).
- Lista de la compra compartida en tiempo real entre móviles mediante **Supabase** (plan gratuito).
- Cada `git push` vuelve a publicar la web (y el APK) automáticamente.

Tiempo estimado: 10–15 minutos. No hace falta instalar nada en el ordenador.

---

## Paso 1 · Crear el proyecto en Supabase (5 min)

1. Entra en <https://supabase.com> → **Start your project** → inicia sesión con tu cuenta de GitHub.
2. **New project**:
   - *Organization*: la personal (plan **Free**).
   - *Project name*: `mediterraneo5`.
   - *Database password*: genera una y guárdala (la app no la usa, pero es la contraseña maestra de la base de datos).
   - *Region*: una de Europa (p. ej. *West EU (Ireland)* o *Central EU (Frankfurt)*).
   - Deja el resto de opciones por defecto (la *Data API* debe quedar activada).
3. Espera 1–2 minutos a que el proyecto termine de crearse.

## Paso 2 · Crear las tablas (1 min)

1. Menú lateral → **SQL Editor** → **New query**.
2. Abre [`supabase_schema.sql`](../supabase_schema.sql) en GitHub, pulsa *Copy raw file* y pégalo entero.
3. **Run**. Debe terminar con *Success. No rows returned*.

Esto crea:

| Tabla | Contenido |
|---|---|
| `shopping_lists` | Listas (activa / archivada), quién la creó, fecha de cierre y nº de productos. |
| `shopping_items` | Productos: nombre, cantidad, pasillo, comprado, quién lo añadió y quién lo marcó. |

También activa **Realtime** en ambas tablas (los cambios llegan al instante a todos los móviles) y las políticas de seguridad (RLS). El script se puede volver a ejecutar sin romper nada.

Comprobación: **Table Editor** debe mostrar las dos tablas vacías.

## Paso 3 · Copiar la URL y la clave pública (1 min)

Menú lateral → **Project Settings** (rueda dentada) → **API Keys** (o botón **Connect** arriba):

- **Project URL** → algo como `https://abcdefghijkl.supabase.co`
- **Clave pública**: la *Publishable key* (`sb_publishable_…`) o, en proyectos antiguos, la *anon public* (empieza por `eyJ…`).

> ⚠️ No uses nunca la *secret key* ni la *service_role*: darían acceso total a la base de datos.
> La clave pública sí puede ir en la web: es pública por diseño y la protegen las políticas RLS.

## Paso 4 · Guardar las claves en GitHub (2 min)

En el repositorio <https://github.com/alfonsosl/Recetario>:

1. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Crea dos secretos (nombre exacto, valor del paso 3):

| Name | Secret |
|---|---|
| `VITE_SUPABASE_URL` | `https://abcdefghijkl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | la clave pública |

## Paso 5 · Activar GitHub Pages (1 min)

1. **Settings** → **Pages**.
2. *Build and deployment* → **Source: GitHub Actions**.

## Paso 6 · Publicar (2–3 min)

1. Pestaña **Actions** → workflow **Web (GitHub Pages)** → **Run workflow** → **Run workflow**.
2. Cuando termine en verde, la web estará en **https://alfonsosl.github.io/Recetario/**.
3. (Opcional) Ejecuta también **APK Android** para que la app instalada use la misma base de datos.

## Paso 7 · Usarla en familia

1. Abre la web en cada móvil.
2. **Lista Común** → elige tu nombre.
3. **Código de Hogar**: pulsa el código, escribe el mismo en todos los móviles (p. ej. `CASA-GARCIA-7Q2X`) y **Unirme**.
   La etiqueta de la cabecera debe decir **En la nube**.
4. Instálala como app: Android/Chrome → menú ⋮ → *Instalar aplicación*; iPhone/Safari → Compartir → *Añadir a pantalla de inicio*.

Prueba rápida: crea una lista en un móvil y debería aparecer en el otro al momento; marca un producto y verás «comprado por …».

---

## Qué se guarda dónde

| Dato | Dónde |
|---|---|
| Lista de la compra e historial | **Supabase** (compartido por Código de Hogar) |
| Menú, recetas editadas, recetas propias, favoritas | En cada dispositivo (no se comparten) |

## Límites del plan gratuito de Supabase (comprobar en su web, pueden cambiar)

- 500 MB de base de datos: esta app usa unos pocos KB por lista.
- **Los proyectos gratuitos se pausan tras ~1 semana sin actividad.** Si un día la lista no carga («No se pudo sincronizar»), entra en supabase.com y pulsa **Restore project**. Usar la lista cada semana lo evita.
- Hasta 2 proyectos gratuitos activos por cuenta.

## Seguridad

- El **Código de Hogar** funciona como contraseña compartida: quien tenga la web y el código puede ver y editar esa lista. Usa un código largo y difícil de adivinar.
- La clave pública está en el código de la web (es lo normal en Supabase). Lo que protege los datos son las políticas RLS del script.
- Si algún día necesitas usuarios con contraseña, el siguiente paso sería activar *Supabase Auth* y cambiar las políticas RLS.

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| El workflow falla en *configure-pages* | Falta el paso 5 (Source: GitHub Actions). Actívalo y vuelve a lanzar el workflow. |
| La cabecera dice «Solo este dispositivo» | Faltan los secretos o tienen otro nombre. Revisa el paso 4 y vuelve a lanzar el workflow. |
| «No se pudo sincronizar» | Proyecto pausado (Restore project) o el script SQL no se ejecutó (paso 2). |
| Un móvil no ve la lista del otro | El Código de Hogar no es idéntico en ambos. |
| Cambios que no llegan al instante | Vuelve a la app: al recuperar el foco recarga la lista igualmente. Revisa en Supabase → *Database → Publications* que `supabase_realtime` incluye las dos tablas. |

## Desarrollo en local (opcional)

```bash
cp .env.example .env      # rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```
