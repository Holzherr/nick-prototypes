ALTER TABLE public.watch_entries ADD COLUMN IF NOT EXISTS watched_date date;
ALTER TABLE public.watch_entries ADD COLUMN IF NOT EXISTS review text;