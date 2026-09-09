
-- Actors table
CREATE TABLE public.actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  bio text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view actors" ON public.actors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role can insert actors" ON public.actors FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update actors" ON public.actors FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Junction table linking titles to actors
CREATE TABLE public.title_actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.actors(id) ON DELETE CASCADE,
  character_name text,
  display_order integer NOT NULL DEFAULT 0,
  UNIQUE(title_id, actor_id)
);

ALTER TABLE public.title_actors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view title_actors" ON public.title_actors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role can insert title_actors" ON public.title_actors FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update title_actors" ON public.title_actors FOR UPDATE TO service_role USING (true) WITH CHECK (true);
