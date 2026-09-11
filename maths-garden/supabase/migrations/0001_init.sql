-- Maths Garden. A parent (auth.users) owns child profiles; every round, level and check-in belongs
-- to a child. Row-level security: a parent sees only their own children and those children's data.

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  birthdate date,
  avatar text not null default '🌸',
  created_at timestamptz not null default now()
);
create index children_parent_idx on public.children (parent_id);

-- One play of a game (five questions). id is generated on the device so offline retries are idempotent.
create table public.maths_rounds (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  game text not null,
  level integer not null check (level >= 0),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  answers jsonb not null default '[]'::jsonb, -- [{ target, chosen, correct, ms }]
  played_at timestamptz not null default now()
);
create index maths_rounds_child_idx on public.maths_rounds (child_id, played_at desc);

-- Current level per game (auto-levelled by the app, overridable on the grown-ups screen).
create table public.maths_levels (
  child_id uuid not null references public.children (id) on delete cascade,
  game text not null,
  level integer not null default 0 check (level >= 0),
  updated_at timestamptz not null default now(),
  primary key (child_id, game)
);

-- Parent-scored probes from the weekly check-in (rote counting, counting objects, …).
create table public.maths_checkins (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  probe text not null,
  score integer not null check (score >= 0),
  max integer,
  note text,
  taken_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index maths_checkins_child_idx on public.maths_checkins (child_id, taken_on);

-- Stickers picked after finishing a round. sticker = "<pack>/<name>" from src/features/stickers/catalog.ts.
create table public.maths_stickers (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  sticker text not null,
  shiny boolean not null default false,
  round_id uuid,
  earned_at timestamptz not null default now()
);
create index maths_stickers_child_idx on public.maths_stickers (child_id, earned_at);

create or replace function public.is_my_child(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.children where id = c and parent_id = auth.uid())
$$;

alter table public.children enable row level security;
alter table public.maths_rounds enable row level security;
alter table public.maths_levels enable row level security;
alter table public.maths_checkins enable row level security;
alter table public.maths_stickers enable row level security;

create policy "parents manage their children" on public.children
  for all to authenticated using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "parents manage their children's rounds" on public.maths_rounds
  for all to authenticated using (public.is_my_child(child_id)) with check (public.is_my_child(child_id));
create policy "parents manage their children's levels" on public.maths_levels
  for all to authenticated using (public.is_my_child(child_id)) with check (public.is_my_child(child_id));
create policy "parents manage their children's check-ins" on public.maths_checkins
  for all to authenticated using (public.is_my_child(child_id)) with check (public.is_my_child(child_id));
create policy "parents manage their children's stickers" on public.maths_stickers
  for all to authenticated using (public.is_my_child(child_id)) with check (public.is_my_child(child_id));
