-- Catalogue engine: our own factual records, provenance, and streaming availability.

-- A richer factual record per title, plus rights metadata for imagery.
ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS synopsis text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS certification text,
  ADD COLUMN IF NOT EXISTS countries text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seasons integer,
  ADD COLUMN IF NOT EXISTS episodes integer,
  ADD COLUMN IF NOT EXISTS production_status text,
  ADD COLUMN IF NOT EXISTS image_license text,
  ADD COLUMN IF NOT EXISTS image_attribution text,
  ADD COLUMN IF NOT EXISTS image_source_url text,
  ADD COLUMN IF NOT EXISTS catalogued_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS catalogue_version integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.titles.synopsis IS 'Written for Qeued from researched sources, not copied.';
COMMENT ON COLUMN public.titles.image_license IS 'Licence of image_url, e.g. CC-BY-SA-4.0, public-domain, generated. Null means no image held.';
COMMENT ON COLUMN public.titles.catalogue_version IS 'Bumped each time the catalogue pipeline rewrites this row.';

-- Slugs for the public listing. Unique, derived from name + year.
CREATE OR REPLACE FUNCTION public.title_slug(p_name text, p_year integer)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '-', 'g'))
         || coalesce('-' || p_year::text, '');
$$;

UPDATE public.titles SET slug = public.title_slug(name, year) WHERE slug IS NULL;

-- Disambiguate any collisions before the unique index goes on.
WITH dupes AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS n
  FROM public.titles
)
UPDATE public.titles t SET slug = d.slug || '-' || d.n
FROM dupes d WHERE t.id = d.id AND d.n > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_titles_slug ON public.titles(slug);

-- Where each researched fact came from, so stale fields can be refreshed and claims defended.
CREATE TABLE IF NOT EXISTS public.title_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_id UUID REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
  field TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT,
  retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (title_id, field, source_url)
);
CREATE INDEX IF NOT EXISTS idx_title_sources_title ON public.title_sources(title_id);

-- Where you can actually watch it. Region-scoped and expiring: availability churns monthly.
CREATE TABLE IF NOT EXISTS public.title_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_id UUID REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
  region TEXT NOT NULL DEFAULT 'GB',
  provider TEXT NOT NULL,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('subscription', 'rent', 'buy', 'free', 'cinema')),
  url TEXT,
  note TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  UNIQUE (title_id, region, provider, offer_type)
);
CREATE INDEX IF NOT EXISTS idx_title_availability_title ON public.title_availability(title_id, region);

ALTER TABLE public.title_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sources are viewable by everyone" ON public.title_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages sources" ON public.title_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Availability is viewable by everyone" ON public.title_availability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages availability" ON public.title_availability FOR ALL TO service_role USING (true) WITH CHECK (true);
