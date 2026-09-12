-- A queue of what the catalogue should hold but does not yet.
--
-- Growing the catalogue used to mean a JSON file of candidate titles, run once, with the
-- failures reported to a terminal and then lost. At a few hundred titles that was fine. At
-- several thousand it is not: the same title gets proposed again by the next list, a page
-- that timed out looks identical to a title that does not exist, and nothing records that a
-- name was already tried and could not be resolved.
--
-- So candidates are rows. Each one carries how badly it is wanted, whether it has been
-- fetched, and — when it could not be — what went wrong, so a later pass can retry the
-- timeouts without re-proposing the titles that genuinely have no UK page.

CREATE TABLE IF NOT EXISTS public.catalogue_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
  /** 5 is canonical, 1 is completionist. Drives the order things get fetched in. */
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  /** Which slice of the expansion proposed it, so a weak slice can be traced. */
  bucket TEXT,
  note TEXT,
  /** Set when the page's address is known but the slug is not derivable from the name. */
  source_url TEXT,
  /**
   * pending — waiting to be fetched
   * held    — in the catalogue, title_id says which row
   * failed  — fetched and could not be resolved to a page; last_error says why
   * skipped — deliberately not wanted
   */
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'failed', 'skipped')),
  title_id UUID REFERENCES public.titles(id) ON DELETE SET NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A title's identity is its name and year, and the same film gets proposed by several
-- slices, so the second proposal must update the first rather than add a row.
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_identity
  ON public.catalogue_candidates (lower(name), coalesce(year, 0), type);

-- The question asked on every fetch: what is still wanted, most wanted first.
CREATE INDEX IF NOT EXISTS idx_candidates_queue
  ON public.catalogue_candidates (priority DESC, created_at) WHERE status = 'pending';

-- Read-only to the app: the public catalogue pages may want to say what is coming, and
-- nothing here is private. Writes happen from the tools over a direct connection.
ALTER TABLE public.catalogue_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read the candidate queue" ON public.catalogue_candidates FOR SELECT TO anon, authenticated USING (true);

/** What is left to do, at a glance. */
CREATE OR REPLACE VIEW public.catalogue_progress AS
  SELECT status, priority, count(*) AS titles
  FROM public.catalogue_candidates
  GROUP BY status, priority;
