-- Progress over time needs the moves themselves, not just where a child ended up.
--
-- `maths_levels` only ever holds the current level, so level history had to be inferred from the level of
-- the next round: a change with no round after it was invisible, and an earned move-up looked identical to
-- a parent override or an easing. Every change now writes an event.
create table if not exists public.maths_level_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  game text not null,
  from_level int not null,
  to_level int not null,
  -- earned: the levelling rule moved it. dropped: two poor rounds. manual: a grown-up used − / +.
  -- import: brought in from guest mode.
  reason text not null default 'earned',
  at timestamptz not null default now()
);

create index if not exists maths_level_events_child_at on public.maths_level_events (child_id, at);

alter table public.maths_level_events enable row level security;

drop policy if exists "own children's level events" on public.maths_level_events;
create policy "own children's level events" on public.maths_level_events for all to authenticated using (public.is_my_child(child_id)) with check (public.is_my_child(child_id));

-- The biggest number a round could ask. Levels get retuned and new ones get added, so a round's difficulty
-- has to be readable years later without depending on today's catalogue.
alter table public.maths_rounds add column if not exists level_max int;
