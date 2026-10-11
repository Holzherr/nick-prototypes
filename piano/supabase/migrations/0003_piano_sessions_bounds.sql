-- Bounds on what the anon key can write to piano_sessions.
--
-- 0001 lets the publishable key insert and update any row it likes: any day, text of any length, any count.
-- This narrows a write to what the client sends. The day is within one day of today (UTC, as the client's
-- `day` is), the ids and piece are 1-64 characters, a run has 0-500 correct presses, and an update keeps
-- the row's device, session and day. The constraints are `not valid`: rows already written are left as
-- they are, every new write is checked.
--
-- What this does not stop: the anon role is the same for every device, so anyone holding the public key
-- can still insert any number of in-bounds rows with reached_last true and fresh device ids, and inflate
-- sessions_7d. Only sign-in or a server write path closes that. Apply by hand through the session pooler,
-- as 0001 was.

alter table public.piano_sessions
  add constraint piano_sessions_piece_id_length check (char_length(piece_id) between 1 and 64) not valid,
  add constraint piano_sessions_session_id_length check (char_length(session_id) between 1 and 64) not valid,
  add constraint piano_sessions_correct_presses_range check (correct_presses between 0 and 500) not valid;

-- Today moves, so the day bound cannot be a constraint; it lives in the write policies.
alter policy "devices record a session" on public.piano_sessions
  with check (day between current_date - 1 and current_date + 1);
alter policy "devices extend a session" on public.piano_sessions
  with check (day between current_date - 1 and current_date + 1);

create or replace function public.piano_sessions_keep_keys()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.device_id is distinct from old.device_id
     or new.session_id is distinct from old.session_id
     or new.day is distinct from old.day then
    raise exception 'piano_sessions: device_id, session_id and day are fixed once written' using errcode = '42501';
  end if;
  return new;
end
$$;

create or replace trigger piano_sessions_keep_keys
  before update on public.piano_sessions
  for each row execute function public.piano_sessions_keep_keys();
