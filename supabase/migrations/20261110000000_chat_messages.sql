-- Riwayat percakapan chatbot per pengguna.
-- Hanya pemilik yang dapat membaca/menulis/menghapus (tanpa akses admin).

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  intent text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists chat_messages_owner_select on public.chat_messages;
create policy chat_messages_owner_select
  on public.chat_messages for select
  using (auth.uid() = user_id);

drop policy if exists chat_messages_owner_insert on public.chat_messages;
create policy chat_messages_owner_insert
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists chat_messages_owner_delete on public.chat_messages;
create policy chat_messages_owner_delete
  on public.chat_messages for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.chat_messages to authenticated;
