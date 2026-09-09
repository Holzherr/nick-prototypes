
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS imdb_url text;
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS rt_url text;
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS director text;
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS cast_members text[];
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS runtime_minutes integer;
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS enriched boolean NOT NULL DEFAULT false;

-- Allow service role to update titles (for enrichment)
CREATE POLICY "Service role can update titles" ON public.titles FOR UPDATE TO service_role USING (true) WITH CHECK (true);
