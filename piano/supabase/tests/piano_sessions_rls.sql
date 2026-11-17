-- RLS check for piano_sessions against a scratch local Postgres, never the hosted project:
--   createdb piano_rls && psql -v ON_ERROR_STOP=1 -d piano_rls -f supabase/tests/piano_sessions_rls.sql
-- Stubs the bits of Supabase the migrations lean on, applies them, then plays the anon key.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'agent_reader') then create role agent_reader nologin; end if;
end $$;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;

\ir ../migrations/0001_piano_sessions.sql
\ir ../migrations/0002_piano_one_row_per_update.sql

insert into public.piano_sessions (device_id, session_id, piece_id, day, reached_last, correct_presses) values
  ('00000000-0000-0000-0000-00000000000a', 's1', 'p1', current_date, true, 10),
  ('00000000-0000-0000-0000-00000000000b', 's1', 'p1', current_date, true, 12);

set role anon;

-- An anon insert still lands. (The client's upsert, `on conflict do update`, is refused by RLS with or
-- without 0002, because it needs a select policy this table deliberately lacks; see the PR notes.)
insert into public.piano_sessions (device_id, session_id, piece_id, day, reached_last, correct_presses)
  values ('00000000-0000-0000-0000-00000000000c', 's1', 'p1', current_date, true, 9);

-- The attack: an update with no WHERE, which is what a filterless PATCH sends.
do $$ begin
  update public.piano_sessions set correct_presses = 0, reached_last = false;
  raise exception 'FAIL: a blanket update went through';
exception when insufficient_privilege then null;
end $$;

-- Still no reading back.
do $$ begin
  if (select count(*) from public.piano_sessions) <> 0 then raise exception 'FAIL: anon can read piano_sessions'; end if;
end $$;

reset role;

do $$ begin
  if (select count(*) from public.piano_sessions where reached_last and correct_presses > 0) <> 3 then
    raise exception 'FAIL: rows changed: %', (select json_agg(s) from public.piano_sessions s);
  end if;
end $$;

select 'piano_sessions RLS: ok';
