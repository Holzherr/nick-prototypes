-- A read-only snapshot for the team's Analyst: one function, one login role, no table grants.
--
-- The Analyst has read "no data" for four nights because the only way into this database is the owner's
-- own credentials. This is the smallest thing that fixes it: a security definer function that returns the
-- night's numbers as one jsonb document, and a role allowed to call that function and nothing else. The
-- role cannot select a row from any table, so widening what the Analyst sees takes a migration and a
-- review, not a grant.
--
-- Nothing here names a child or repeats what a person wrote to us in confidence. Child ids are hashed;
-- `children.name` is never read; feedback comes back as message, path, locale and at only.
--
-- The password is deliberately not in this file, because this repo is public. Nick sets it after applying
-- and stores the whole connection string in the keychain under `agent-team-maths-garden-db`, in this
-- shape — session pooler host, because the direct database host is IPv6-only, and the pooler wants the
-- project ref appended to the user:
--
--   postgresql://agent_reader.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
--
-- Read it with:
--
--   psql "$(security find-generic-password -s agent-team-maths-garden-db -w)" -Atc "select public.agent_snapshot(7)"

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
rnd as (
  select md5(r.child_id::text) as child,
         (r.played_at at time zone 'utc')::date as day,
         r.game, r.level, r.score, r.total, r.completed, r.answers
  from public.maths_rounds r, win
  where r.played_at >= now() - make_interval(days => win.span)
),
ms as (
  -- Per-answer timings live inside `answers`, so the median is taken over the answers themselves rather
  -- than over per-round averages, which would flatten exactly the slow answers worth seeing.
  select rnd.child, rnd.day, rnd.game, rnd.level,
         percentile_cont(0.5) within group (order by (a.v->>'ms')::numeric) as median_ms
  -- The case guards the unnest: `answers` is jsonb, so a row that is not an array would abort the whole
  -- snapshot, and a snapshot that errors is the failure this function exists to end.
  from rnd cross join lateral jsonb_array_elements(
         case when jsonb_typeof(rnd.answers) = 'array' then rnd.answers else '[]'::jsonb end) as a(v)
  where jsonb_typeof(a.v->'ms') = 'number'
  group by 1, 2, 3, 4
),
rounds as (
  select r.day, r.game, r.level, r.child,
         count(*) as rounds,
         count(*) filter (where r.completed) as completed,
         round(sum(r.score)::numeric / nullif(sum(r.total), 0), 3) as accuracy,
         max(m.median_ms) as median_ms
  from rnd r left join ms m using (child, day, game, level)
  group by r.day, r.game, r.level, r.child
  order by r.day, r.game, r.level, r.child
),
quits as (
  -- A round left early. It never counts towards a level, but it is the frustration signal.
  select r.game, count(*) as quits
  from rnd r where not r.completed group by 1 order by 1
),
level_events as (
  select (e.at at time zone 'utc')::date as day, e.game, e.reason, count(*) as changes
  from public.maths_level_events e, win
  where e.at >= now() - make_interval(days => win.span)
  group by 1, 2, 3 order by 1, 2, 3
),
events as (
  select (e.at at time zone 'utc')::date as day, e.name, count(*) as events,
         count(distinct e.session) as sessions
  from public.maths_events e, win
  where e.at >= now() - make_interval(days => win.span)
  group by 1, 2 order by 1, 2
),
feedback as (
  -- Message, path, locale and at only: never the optional reply address someone may have left, and never
  -- the session id that would tie a message back to a visit.
  select f.message, f.path, f.locale, f.at
  from public.maths_feedback f, win
  where f.at >= now() - make_interval(days => win.span)
  order by f.at desc
)
select jsonb_build_object(
  'generated_at', now(),
  'days', (select span from win),
  'rounds', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from rounds x),
  'quits', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from quits x),
  'level_events', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from level_events x),
  'events', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from events x),
  'feedback', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from feedback x)
);
$$;

-- One login role that can do exactly one thing.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'agent_reader') then
    create role agent_reader login;
  end if;
end
$$;

-- Usage on the schema is what makes the function reachable. It grants nothing on any table inside it,
-- and there are no table grants anywhere in this file on purpose.
grant usage on schema public to agent_reader;

revoke execute on function public.agent_snapshot(int) from public, anon, authenticated;
grant execute on function public.agent_snapshot(int) to agent_reader;
