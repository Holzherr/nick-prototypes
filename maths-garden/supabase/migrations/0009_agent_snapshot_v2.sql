-- agent_snapshot v2: the three lines the first report still wrote as "no data".
--
-- Minutes played, easing triggered and sticker duplicates were all recorded by the app before 0008 and
-- simply not surfaced. Same signature, same role, same grants, same hashing as 0008; `rounds` rows gain
-- `total_ms` and `eased`, and a sixth section `stickers` counts draws per day × child. Still no name of a
-- child and no name of a sticker: the `sticker` column is compared to itself for the duplicate count and
-- never returned. The role and its password are unchanged; apply as 0008 was, by hand in the SQL editor.

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
ans as (
  -- One answer per row. The case guards the unnest: `answers` is jsonb, so a row that is not an array
  -- would abort the whole snapshot, and a snapshot that errors is the failure this function exists to end.
  select rnd.child, rnd.day, rnd.game, rnd.level, a.v
  from rnd cross join lateral jsonb_array_elements(
         case when jsonb_typeof(rnd.answers) = 'array' then rnd.answers else '[]'::jsonb end) as a(v)
),
ms as (
  -- Per-answer timings live inside `answers`, so the median is taken over the answers themselves rather
  -- than over per-round averages, which would flatten exactly the slow answers worth seeing. `total_ms`
  -- is the whole question (`totalMs`: prompt to tap), falling back to the answer time for rounds saved
  -- before it existed; `eased` counts questions asked from the level below after two misses in a row.
  select child, day, game, level,
         percentile_cont(0.5) within group (order by (v->>'ms')::numeric)
           filter (where jsonb_typeof(v->'ms') = 'number') as median_ms,
         sum(case when jsonb_typeof(v->'totalMs') = 'number' then (v->>'totalMs')::numeric
                  when jsonb_typeof(v->'ms') = 'number' then (v->>'ms')::numeric
                  else 0 end) as total_ms,
         count(*) filter (where v->'eased' = 'true'::jsonb) as eased
  from ans
  group by 1, 2, 3, 4
),
rounds as (
  -- `ms` has one row per group, so max() reads that row and coalesce() covers a group with no answers.
  select r.day, r.game, r.level, r.child,
         count(*) as rounds,
         count(*) filter (where r.completed) as completed,
         round(sum(r.score)::numeric / nullif(sum(r.total), 0), 3) as accuracy,
         max(m.median_ms) as median_ms,
         coalesce(max(m.total_ms), 0)::int as total_ms,
         coalesce(max(m.eased), 0)::int as eased
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
),
stk as (
  -- A draw is a duplicate when the same child already held that sticker from an earlier draw, in or
  -- before the window. The id breaks a tie on `earned_at`, so of two same-second draws exactly one counts.
  select md5(s.child_id::text) as child,
         (s.earned_at at time zone 'utc')::date as day,
         s.shiny,
         exists (select 1 from public.maths_stickers p
                 where p.child_id = s.child_id and p.sticker = s.sticker
                   and (p.earned_at, p.id) < (s.earned_at, s.id)) as duplicate
  from public.maths_stickers s, win
  where s.earned_at >= now() - make_interval(days => win.span)
),
stickers as (
  select day, child,
         count(*) as earned,
         count(*) filter (where shiny) as shiny,
         count(*) filter (where duplicate) as duplicates
  from stk group by 1, 2 order by 1, 2
)
select jsonb_build_object(
  'generated_at', now(),
  'days', (select span from win),
  'rounds', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from rounds x),
  'quits', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from quits x),
  'level_events', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from level_events x),
  'events', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from events x),
  'feedback', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from feedback x),
  'stickers', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from stickers x)
);
$$;

-- `create or replace` keeps the function's privileges, and 0008 created the role; the lines are repeated so
-- this file stands on its own if it is ever the one that is re-run.
grant usage on schema public to agent_reader;

revoke execute on function public.agent_snapshot(int) from public, anon, authenticated;
grant execute on function public.agent_snapshot(int) to agent_reader;
