-- A read-only snapshot for the team's Analyst: one function, one login role, no table grants.
--
-- The Analyst has reported "no data" for qeued because the only way into this database is the
-- owner's own credentials. This is the smallest thing that fixes it: a security definer function
-- that returns the night's numbers as one jsonb document, and a role allowed to call that function
-- and nothing else. The role cannot select a row from any table, so widening what the Analyst
-- sees takes a migration and a review, not a grant. Same shape as Maths Garden's 0008.
--
-- Three sections, every one from a table the catalogue tools already read:
--
--   catalogue           held titles, total titles, candidates not held, published_share (G-09)
--   candidates          count per status, and the ten most common last_error values
--   household_activity  per ISO week × hashed profile × status: rows created, rows updated,
--                       rows carrying a rating, in watch_entries
--
-- household_activity measures household activity and nothing else. No column marks a
-- watch_entries row as having come from a recommendation, so recommendations taken (G-10)
-- cannot be counted from this database today; QD-004 adds that column. The section carries a
-- fixed "measures" key saying so, so the report never presents it as that metric.
--
-- Nothing here identifies a person. The profile appears only as md5(profile_id::text); no column
-- from `profiles` is read; no row from the auth schema is touched.
--
-- The password is deliberately not in this file, because this repo is public. Nick sets it after
-- applying and stores the whole connection string in the keychain under `agent-team-qeued-db`,
-- in this shape — session pooler host, because the direct database host is IPv6-only, and the
-- pooler wants the project ref appended to the user:
--
--   postgresql://agent_reader.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
--
-- Read it with:
--
--   psql "$(security find-generic-password -s agent-team-qeued-db -w)" -Atc "select public.agent_snapshot(7)"

create or replace function public.agent_snapshot(days int default 7)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with win as (
  -- Clamped: a caller asking for 0 days gets a useless answer, one asking for 100000 gets a slow one.
  select least(greatest(coalesce($1, 7), 1), 400) as span
),
catalogue as (
  -- A title is published once the catalogue pipeline has written it (catalogue_version > 0).
  -- published_share is what G-09 tracks: of everything we hold or still want, how much is live.
  -- "Not held" is every candidate status other than held, skipped included, as the item defines it;
  -- the candidates section carries the per-status counts for anyone who wants to net skipped out.
  select
    (select count(*) from public.titles t where t.catalogue_version > 0) as held,
    (select count(*) from public.titles) as titles,
    (select count(*) from public.catalogue_candidates c where c.status <> 'held') as candidates_not_held
),
by_status as (
  select c.status, count(*) as candidates
  from public.catalogue_candidates c
  group by 1 order by 1
),
top_errors as (
  -- Why titles sit unpublished. last_error is a scraper message, never a person's words.
  select c.last_error, count(*) as candidates
  from public.catalogue_candidates c
  where c.last_error is not null
  group by 1 order by 2 desc, 1
  limit 10
),
entry_events as (
  -- One event per row created, and one more per row changed after creation. The trigger sets
  -- updated_at on every update; on insert it equals created_at exactly, so the second branch is
  -- only rows that were actually touched again. `status` is the row's current status.
  select md5(e.profile_id::text) as profile, e.status, e.id, e.watched_rating,
         e.created_at as happened_at, 'created' as kind
  from public.watch_entries e, win
  where e.created_at >= now() - make_interval(days => win.span)
  union all
  select md5(e.profile_id::text), e.status, e.id, e.watched_rating, e.updated_at, 'updated'
  from public.watch_entries e, win
  where e.updated_at >= now() - make_interval(days => win.span)
    and e.updated_at > e.created_at
),
household_activity as (
  select to_char(v.happened_at at time zone 'utc', 'IYYY-"W"IW') as week, v.profile, v.status,
         count(*) filter (where v.kind = 'created') as created,
         count(*) filter (where v.kind = 'updated') as updated,
         count(distinct v.id) filter (where v.watched_rating is not null) as rated
  from entry_events v
  group by 1, 2, 3
  order by 1, 2, 3
)
select jsonb_build_object(
  'generated_at', now(),
  'days', (select span from win),
  'catalogue', (
    select jsonb_build_object(
      'held', x.held,
      'titles', x.titles,
      'candidates_not_held', x.candidates_not_held,
      'published_share', round(x.held::numeric / nullif(x.held + x.candidates_not_held, 0), 3)
    ) from catalogue x
  ),
  'candidates', jsonb_build_object(
    'by_status', (select coalesce(jsonb_object_agg(x.status, x.candidates), '{}'::jsonb) from by_status x),
    'top_errors', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from top_errors x)
  ),
  'household_activity', jsonb_build_object(
    'measures', 'household activity, not recommendations taken',
    'weeks', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from household_activity x)
  )
);
$$;

-- One login role that can do exactly one thing. Re-running the file is harmless: a role that
-- already exists is left as it is, password included.
do $$
begin
  create role agent_reader login;
exception
  when duplicate_object then null;
end
$$;

-- Usage on the schema is what makes the function reachable. It grants nothing on any table inside
-- it, and there are no table grants anywhere in this file on purpose.
grant usage on schema public to agent_reader;

revoke execute on function public.agent_snapshot(int) from public, anon, authenticated;
grant execute on function public.agent_snapshot(int) to agent_reader;
