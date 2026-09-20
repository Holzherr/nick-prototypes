-- Who is speaking, and what sort of thing it is.
--
-- Three people use the feedback box and their notes mean different things: Nick's is a decision, Priyanka's
-- is a parent's eye, Tara's is something a four-year-old did that nobody predicted. Without a reporter the
-- Analyst reads all three as one voice; without a kind it cannot tell a bug from an idea. Both are optional
-- — a message with neither still lands, because a form that refuses to send is a form nobody uses.
--
-- The RLS on this table is untouched: still insert-only, still no select policy.
alter table public.maths_feedback
  -- One of the three names the picker offers. Capped here as well as in the form; the form is a suggestion.
  add column if not exists reporter text check (reporter is null or length(reporter) <= 40),
  -- bug: something is wrong. idea: something is missing. tara-noticed: something the child did or said.
  add column if not exists kind text check (kind is null or kind in ('bug', 'idea', 'tara-noticed'));
