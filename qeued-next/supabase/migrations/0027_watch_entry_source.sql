-- Where a list entry came from, set once, and the G-10 count read from it. source is nullable and
-- nothing backfills it: older rows stay null. The trigger puts a non-null source back on update:
--   update public.watch_entries set source = 'tonight' where id = …;  -- a 'search' row stays 'search'
-- agent_snapshot keeps its three 0025 sections (commented there) and gains recs_taken. Same
-- signature, so the 0025 grants carry over and none is added here.

alter table public.watch_entries
  add column if not exists source text
  constraint watch_entries_source_check check (source in ('recommendation', 'tonight', 'search', 'title_page', 'manual'));

create or replace function public.keep_watch_entry_source()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.source is not null then
    new.source := old.source;
  end if;
  return new;
end $$;

create or replace trigger keep_watch_entry_source
  before update on public.watch_entries for each row execute function public.keep_watch_entry_source();

create or replace function public.agent_snapshot(days int default 7)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with win as (
  select least(greatest(coalesce($1, 7), 1), 400) as span
),
catalogue as (
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
  select c.last_error, count(*) as candidates
  from public.catalogue_candidates c
  where c.last_error is not null
  group by 1 order by 2 desc, 1
  limit 10
),
entry_events as (
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
),
recs_taken as (
  -- G-10: rows added from a recommendation or Tonight. A null source (pre-0027, or no client sends it) is not counted.
  select to_char(e.created_at at time zone 'utc', 'IYYY-"W"IW') as week,
         md5(e.profile_id::text) as profile, count(*) as taken
  from public.watch_entries e, win
  where e.created_at >= now() - make_interval(days => win.span)
    and e.source in ('recommendation', 'tonight')
  group by 1, 2
  order by 1, 2
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
  ),
  'recs_taken', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from recs_taken x)
);
$$;
