-- One row per write: the anon key can no longer rewrite every family's practice counts at once.
--
-- 0001's update policy is `using (true)` with no select policy. An update with a WHERE clause finds nothing
-- (the WHERE needs select), but an update with no WHERE reads nothing first, so it passes RLS and touches
-- every row: `PATCH /rest/v1/piano_sessions` with the publishable key and a body of
-- `{"correct_presses":0,"reached_last":false}` zeroes the whole table and G-11's sessions_7d with it.
--
-- The client only ever writes one row per request (an upsert keyed on device_id + session_id), so a
-- statement that changes more than one row is refused. Inserts are untouched. Apply by hand through the
-- session pooler, as 0001 was.

create or replace function public.piano_sessions_one_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from changed) > 1 then
    raise exception 'piano_sessions: one row per update' using errcode = '42501';
  end if;
  return null;
end
$$;

drop trigger if exists piano_sessions_one_row on public.piano_sessions;
create trigger piano_sessions_one_row
  after update on public.piano_sessions
  referencing new table as changed
  for each statement execute function public.piano_sessions_one_row();
