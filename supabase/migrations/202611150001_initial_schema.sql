-- GameMatch initial schema: user-owned data only.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  platforms text[] not null default '{}',
  genres text[] not null default '{}',
  budget_categories text[] not null default '{}',
  subscriptions text[] not null default '{}',
  paid_price_limit text check (paid_price_limit in ('500', '1500', 'unlimited')),
  updated_at timestamptz not null default now()
);

create table if not exists public.library_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  igdb_game_id bigint not null,
  status text not null check (
    status in ('skipped', 'saved', 'want_to_play', 'playing', 'completed', 'owned')
  ),
  is_superlike boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, igdb_game_id)
);

create index if not exists library_entries_user_status_idx
  on public.library_entries (user_id, status);
create index if not exists library_entries_igdb_game_id_idx
  on public.library_entries (igdb_game_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists preferences_set_updated_at on public.preferences;
create trigger preferences_set_updated_at before update on public.preferences
for each row execute function public.set_updated_at();

drop trigger if exists library_entries_set_updated_at on public.library_entries;
create trigger library_entries_set_updated_at before update on public.library_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, nullif(new.raw_user_meta_data ->> 'username', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.library_entries enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;
grant select, insert, update, delete on public.library_entries to authenticated;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Profiles are insertable by their owner" on public.profiles;
create policy "Profiles are insertable by their owner"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Profiles are updateable by their owner" on public.profiles;
create policy "Profiles are updateable by their owner"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Preferences are manageable by their owner" on public.preferences;
create policy "Preferences are manageable by their owner"
on public.preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Library entries are manageable by their owner" on public.library_entries;
create policy "Library entries are manageable by their owner"
on public.library_entries for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
