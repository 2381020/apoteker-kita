-- Dukungan impor dataset interaksi (DDInter 2.0) lewat menu admin.

-- 1. Metadata sumber dataset
alter table public.interactions
  add column if not exists source text not null default '',
  add column if not exists ddinter_id text,
  add column if not exists original_severity text;

-- 2. Kunci pasangan tak berurutan untuk mencegah duplikat A+B vs B+A.
alter table public.interactions
  add column if not exists pair_key text generated always as (
    least(lower(medication_a), lower(medication_b)) || '|' ||
    greatest(lower(medication_a), lower(medication_b))
  ) stored;

create unique index if not exists interactions_pair_key_unique
  on public.interactions (pair_key);

create index if not exists interactions_lookup_idx
  on public.interactions (lower(medication_a), lower(medication_b));

-- 3. Daftar nama obat untuk combobox pencarian
create extension if not exists pg_trgm;

create table if not exists public.drug_names (
  name text primary key,
  ddinter_id text,
  created_at timestamptz not null default now()
);

create index if not exists drug_names_name_trgm
  on public.drug_names using gin (name gin_trgm_ops);

alter table public.drug_names enable row level security;

drop policy if exists drug_names_read_all on public.drug_names;
create policy drug_names_read_all
  on public.drug_names for select
  using (true);

grant select on public.drug_names to anon, authenticated;

-- 4. Sinkronkan nama obat otomatis setelah insert batch interaksi.
create or replace function public.sync_drug_names_from_interactions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.drug_names (name)
  select distinct nama
  from (
    select medication_a as nama from new_rows
    union all
    select medication_b as nama from new_rows
  ) combined
  where nama is not null and length(trim(nama)) > 0
  on conflict (name) do nothing;

  return null;
end;
$$;

drop trigger if exists sync_drug_names_after_insert on public.interactions;
create trigger sync_drug_names_after_insert
  after insert on public.interactions
  referencing new table as new_rows
  for each statement
  execute function public.sync_drug_names_from_interactions();

-- 5. Backfill nama obat dari data interaksi yang sudah ada.
insert into public.drug_names (name)
select distinct nama
from (
  select medication_a as nama from public.interactions
  union
  select medication_b as nama from public.interactions
) combined
where nama is not null and length(trim(nama)) > 0
on conflict (name) do nothing;

-- 6. Pencarian nama obat untuk combobox
create or replace function public.search_drug_names(q text default '', lim int default 20)
returns table(name text)
language sql
stable
security invoker
set search_path = public
as $$
  select d.name
  from public.drug_names d
  where q = '' or d.name ilike '%' || q || '%'
  order by d.name
  limit least(greatest(lim, 1), 50);
$$;

grant execute on function public.search_drug_names(text, int) to anon, authenticated;

-- 7. Reset data impor (khusus admin)
create or replace function public.reset_ddinter_interactions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat menghapus data impor';
  end if;

  delete from public.interactions where source = 'DDInter 2.0';
  get diagnostics removed = row_count;

  delete from public.drug_names d
  where not exists (
    select 1
    from public.interactions i
    where i.medication_a = d.name or i.medication_b = d.name
  );

  return removed;
end;
$$;

grant execute on function public.reset_ddinter_interactions() to authenticated;
