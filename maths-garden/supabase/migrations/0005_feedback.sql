-- What people want to say about the app, from wherever they were standing when they wanted to say it.
--
-- Same shape as maths_events and for the same reasons: anyone may write, nobody may read. An open select
-- on this table would publish other people's messages — and a contact address alongside them — to anyone
-- holding the publishable key, which is everyone.
create table if not exists public.maths_feedback (
  id uuid primary key default gen_random_uuid(),
  -- Capped in the database as well as the form. The form is a suggestion; this is the rule.
  message text not null check (length(btrim(message)) between 1 and 2000),
  -- Optional, and only so a reply is possible. Never required: asking for an address is how you stop
  -- someone telling you the thing that was actually wrong.
  contact text check (contact is null or length(contact) <= 200),
  -- Where they were when they hit the button, stripped the same way an event path is — a printable's link
  -- carries the child's name, and it must not arrive here either.
  path text check (path is null or length(path) <= 120),
  -- Which language they were reading, which says a lot about whether a translation is the problem.
  locale text check (locale is null or locale ~ '^[a-z]{2}$'),
  session text check (session is null or length(session) <= 64),
  at timestamptz not null default now()
);

create index if not exists maths_feedback_at_idx on public.maths_feedback (at desc);

alter table public.maths_feedback enable row level security;

create policy "anyone may leave feedback" on public.maths_feedback for insert to anon, authenticated with check (true);
