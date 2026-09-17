-- Anonymous, first-party counting: how many people arrive, sign up and play.
--
-- No cookies and no third party. The session id is random and dies with the browser tab, so nothing here
-- follows anyone between visits, and nothing can identify a child: the app strips every query parameter
-- except a sheet's id and stage before recording a path, because a printable's link carries the child's
-- name and avatar. Guest mode records nothing at all.
create table if not exists public.maths_events (
  id uuid primary key default gen_random_uuid(),
  -- A short fixed vocabulary, enforced here so a malformed or hostile insert cannot fill the table with prose.
  name text not null check (name ~ '^[a-z_]{1,32}$'),
  path text check (path is null or length(path) <= 120),
  ref text check (ref is null or length(ref) <= 120),
  session text check (session is null or length(session) <= 64),
  at timestamptz not null default now()
);

create index if not exists maths_events_at_idx on public.maths_events (at desc);
create index if not exists maths_events_name_at_idx on public.maths_events (name, at desc);

alter table public.maths_events enable row level security;

-- Anyone may record an event, including a signed-out visitor on the public pages — that is the point.
-- Nobody may read them back: with no select policy the counts are reachable only to the project owner in
-- SQL. Per-row reads are worth nothing anyway, and an open select would hand anyone the site's traffic.
create policy "anyone may record an anonymous event" on public.maths_events for insert to anon, authenticated with check (true);
