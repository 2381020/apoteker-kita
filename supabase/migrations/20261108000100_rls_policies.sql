-- Row Level Security policies

alter table public.profiles enable row level security;
alter table public.medications enable row level security;
alter table public.interactions enable row level security;
alter table public.pharmacies enable row level security;
alter table public.guides enable row level security;
alter table public.reminders enable row level security;
alter table public.consumption_history enable row level security;

-- Profiles: a user can read/update their own profile; admins can manage all.
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Reference data: readable by everyone, writable only by admins.
drop policy if exists medications_read_all on public.medications;
create policy medications_read_all
  on public.medications for select
  using (true);

drop policy if exists medications_admin_write on public.medications;
create policy medications_admin_write
  on public.medications for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists interactions_read_all on public.interactions;
create policy interactions_read_all
  on public.interactions for select
  using (true);

drop policy if exists interactions_admin_write on public.interactions;
create policy interactions_admin_write
  on public.interactions for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists pharmacies_read_all on public.pharmacies;
create policy pharmacies_read_all
  on public.pharmacies for select
  using (true);

drop policy if exists pharmacies_admin_write on public.pharmacies;
create policy pharmacies_admin_write
  on public.pharmacies for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists guides_read_all on public.guides;
create policy guides_read_all
  on public.guides for select
  using (true);

drop policy if exists guides_admin_write on public.guides;
create policy guides_admin_write
  on public.guides for all
  using (public.is_admin())
  with check (public.is_admin());

-- Reminders: owners manage their own rows; admins manage all.
drop policy if exists reminders_owner_all on public.reminders;
create policy reminders_owner_all
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists reminders_admin_all on public.reminders;
create policy reminders_admin_all
  on public.reminders for all
  using (public.is_admin())
  with check (public.is_admin());

-- Consumption history: owners manage their own rows; admins manage all.
drop policy if exists history_owner_all on public.consumption_history;
create policy history_owner_all
  on public.consumption_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists history_admin_all on public.consumption_history;
create policy history_admin_all
  on public.consumption_history for all
  using (public.is_admin())
  with check (public.is_admin());

-- Grants
grant usage on schema public to anon, authenticated;
grant select on public.medications, public.interactions, public.pharmacies, public.guides to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
