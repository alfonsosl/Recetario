-- =====================================================================
-- Mediterráneo 5 · Lista de la compra común (Supabase / PostgreSQL)
-- Ejecuta este script completo en: Supabase → SQL Editor → New query → Run
-- Después copia Project URL y anon key (Settings → API) en el archivo .env:
--   VITE_SUPABASE_URL=https://xxxx.supabase.co
--   VITE_SUPABASE_ANON_KEY=eyJ...
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Listas ----------
create table if not exists public.shopping_lists (
  id             uuid primary key default gen_random_uuid(),
  household_code text        not null check (char_length(household_code) between 3 and 40),
  name           text        not null,
  status         text        not null default 'active' check (status in ('active', 'archived')),
  created_by     text        not null,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz,
  item_count     integer     not null default 0
);

create index if not exists shopping_lists_household_status_idx
  on public.shopping_lists (household_code, status, created_at desc);

-- Solo una lista activa por hogar.
create unique index if not exists shopping_lists_one_active_per_household
  on public.shopping_lists (household_code) where status = 'active';

-- ---------- Productos ----------
create table if not exists public.shopping_items (
  id             uuid primary key default gen_random_uuid(),
  list_id        uuid        not null references public.shopping_lists (id) on delete cascade,
  household_code text        not null,
  name           text        not null check (char_length(name) between 1 and 120),
  quantity       text        not null default '',
  category       text        not null check (category in (
                   'Verduras y Hortalizas', 'Carnes y Aves', 'Pescados y Mariscos',
                   'Legumbres y Cereales', 'Huevos y Lácteos', 'Despensa y AOVE', 'Hogar y Otros')),
  checked        boolean     not null default false,
  added_by       text        not null,
  source         text        not null default 'manual' check (source in ('menu', 'manual')),
  created_at     timestamptz not null default now(),
  checked_at     timestamptz,
  checked_by     text
);

create index if not exists shopping_items_list_idx on public.shopping_items (list_id);
create index if not exists shopping_items_household_idx on public.shopping_items (household_code);

-- ---------- Realtime ----------
-- REPLICA IDENTITY FULL para que los UPDATE/DELETE lleguen con todas las columnas.
alter table public.shopping_lists replica identity full;
alter table public.shopping_items replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'shopping_lists') then
    alter publication supabase_realtime add table public.shopping_lists;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'shopping_items') then
    alter publication supabase_realtime add table public.shopping_items;
  end if;
end $$;

-- ---------- Seguridad (RLS) ----------
-- Modelo sencillo para uso familiar: el "Código de Hogar" actúa como secreto compartido.
-- Cualquiera con la anon key y el código puede leer/escribir esa lista.
-- Usa un código difícil de adivinar (p. ej. CASA-7KQ2-PLMX). Para más seguridad, añade Supabase Auth.
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;

drop policy if exists "anon_all_lists" on public.shopping_lists;
create policy "anon_all_lists" on public.shopping_lists
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon_all_items" on public.shopping_items;
create policy "anon_all_items" on public.shopping_items
  for all to anon, authenticated using (true) with check (true);
