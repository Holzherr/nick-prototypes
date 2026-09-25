-- Piano practice sessions, and the one number G-11 asks for.
--
-- Piano has no Supabase project of its own. This file targets the Maths Garden project (ref
-- gzdfoptvdocauvgxltjk) and is applied by hand through the session pooler, as Maths Garden's migrations
-- are: the direct database host is IPv6-only. The login role `agent_reader` already exists there
-- (maths-garden migration 0008, with usage on schema public), so there is no `create role` here; the
-- runner's keychain entry `agent-team-maths-garden-db` reaches this function once `apps/piano/app.json`
-- names it as `snapshot_function`. Nothing in `src/` reads this table; the client that writes it is PN-007.
--
-- One row per practice run on one device. No name, no clock time finer than a day, no key press:
-- `device_id` is a random UUID the client made and keeps in localStorage, `session_id` is the session
-- log's own id, `reached_last` means she pressed every note of the piece in that run.

create table public.piano_sessions (
  device_id uuid not null,
  session_id text not null,
  piece_id text not null,
  day date not null,
  reached_last boolean not null default false,
  correct_presses integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (device_id, session_id)
);

alter table public.piano_sessions enable row level security;

-- The publishable (anon) key can write a row and never read the table back: an insert policy, an update
-- policy, and no select or delete policy. "Own device only" cannot be enforced without sign-in, because
-- the anon role is the same for every device; the row key is a random UUID the client made, so what a
-- holder of the key could overwrite is one family's practice counts, and only by guessing that UUID.
-- Without a select policy an update whose WHERE clause reads the row finds nothing, so the client
-- writes with an upsert (insert … on conflict do update, PostgREST `resolution=merge-duplicates`,
-- `return=minimal`); the update policy is what lets that upsert change the existing row.
create policy "devices record a session" on public.piano_sessions
  for insert to anon with check (true);
create policy "devices extend a session" on public.piano_sessions
  for update to anon using (true) with check (true);

-- The Analyst's window. Returns { generated_at, days, sessions_7d, sessions_by_day }.
create or replace function public.piano_snapshot(days int default 7)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with win as (
  -- Clamped: a caller asking for 0 days gets a useless answer, one asking for 100000 gets a slow one.
  select least(greatest(coalesce(days, 7), 1), 400) as span
),
by_day as (
  -- `sessions` reached the last note; `runs` is every row. Days with no rows are omitted.
  select s.day, count(*) filter (where s.reached_last) as sessions, count(*) as runs
  from public.piano_sessions s, win
  where s.day > current_date - win.span
  group by s.day order by s.day
)
select jsonb_build_object(
  'generated_at', now(),
  'days', (select span from win),
  -- sessions_7d is G-11's metric: the target is 2 sessions in 7 days. The runner (agent-team
  -- runner/snapshot.mjs) always calls this function with 8, so this window is fixed at today plus the six
  -- days before it whatever the argument says; an 8-day count reads 3 for a family exactly on target.
  'sessions_7d', (select count(*) from public.piano_sessions
                  where reached_last and day between current_date - 6 and current_date),
  'sessions_by_day', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from by_day x)
);
$$;

-- Execute goes to agent_reader and nobody else; the role gets no grant on the table, so the snapshot is
-- the only way it can see a row.
revoke execute on function public.piano_snapshot(int) from public, anon, authenticated;
grant execute on function public.piano_snapshot(int) to agent_reader;
