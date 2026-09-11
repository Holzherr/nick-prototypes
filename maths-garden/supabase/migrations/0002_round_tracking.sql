-- Rounds left early are kept (completed = false) so the grown-ups screen can spot frustration; they never
-- count towards levels. Per-answer timing and tap counts live inside `answers` (jsonb), so they need no columns.
alter table public.maths_rounds add column if not exists completed boolean not null default true;
