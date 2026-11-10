-- ApotekerKita initial schema
-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('patient', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'interaction_severity') then
    create type public.interaction_severity as enum ('ringan', 'sedang', 'berat');
  end if;
  if not exists (select 1 from pg_type where typname = 'consumption_status') then
    create type public.consumption_status as enum ('ditempuh', 'lewat', 'dilewati');
  end if;
end
$$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  date_of_birth date,
  gender text,
  role public.app_role not null default 'patient',
  avatar_url text,
  notification_preferences jsonb not null default '{"reminders": true, "email": false, "sms": false}'::jsonb,
  medication_preferences jsonb not null default '{"preferredLanguage": "id", "units": "metric"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_gender_check check (gender is null or gender in ('laki-laki', 'perempuan', ''))
);

-- Reference data
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  generic_name text not null default '',
  brand text not null default '',
  category text not null default '',
  description text not null default '',
  uses text[] not null default '{}',
  dosage_form text not null default '',
  strength text not null default '',
  side_effects text[] not null default '{}',
  contraindications text[] not null default '{}',
  storage text not null default '',
  image_url text,
  is_prescription boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medications_name_brand_unique unique (name, brand)
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  medication_a text not null,
  medication_b text not null,
  severity public.interaction_severity not null default 'ringan',
  description text not null default '',
  recommendation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interactions_pair_unique unique (medication_a, medication_b)
);

create table if not exists public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  city text not null default '',
  phone text not null default '',
  distance text not null default '',
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  is_open boolean not null default false,
  services text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pharmacies_name_address_unique unique (name, address)
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  category text not null default '',
  summary text not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User-owned data
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  medication_name text not null,
  dosage text not null default '',
  frequency text not null default '',
  time time,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

create table if not exists public.consumption_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  medication_name text not null,
  dosage text not null default '',
  taken_at timestamptz not null default now(),
  status public.consumption_status not null default 'ditempuh',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists consumption_history_user_id_idx on public.consumption_history (user_id);
create index if not exists consumption_history_taken_at_idx on public.consumption_history (taken_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'medications',
    'interactions',
    'pharmacies',
    'guides',
    'reminders'
  ]
  loop
    execute format('drop trigger if exists set_updated_at_%1$s on public.%1$s', table_name);
    execute format(
      'create trigger set_updated_at_%1$s before update on public.%1$s for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end
$$;

-- Admin helper (security definer avoids recursive RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Auto-create profile for every new auth user. Role is hardcoded to avoid
-- privilege escalation through user-supplied metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'patient'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent privilege escalation: only admins or the service role may change roles.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_admin()
     and auth.role() is distinct from 'service_role' then
    raise exception 'Hanya admin yang dapat mengubah role pengguna';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
