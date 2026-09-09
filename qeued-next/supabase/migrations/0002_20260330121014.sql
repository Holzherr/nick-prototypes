CREATE TABLE public.skipped_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title_name text NOT NULL,
  skipped_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.skipped_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skips" ON public.skipped_recommendations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skips" ON public.skipped_recommendations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own skips" ON public.skipped_recommendations FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_skipped_recs_user_title ON public.skipped_recommendations (user_id, title_name);