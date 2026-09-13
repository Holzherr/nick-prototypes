-- Lists: the catalogue arranged by somebody's judgement rather than by a query.
--
-- A watchlist app is a browsing surface before it is a search one. "What should we watch"
-- is answered better by "the fifteen best things released in 1999" than by a genre filter,
-- which is why IMDb's Top 250 and Letterboxd's lists are the part of those sites people
-- actually use.
--
-- Qeued cannot copy that shape, because the thing underneath it is an aggregated user
-- rating and Qeued has no users to aggregate. It holds 46 IMDb scores out of four thousand
-- titles, left over from a previous life, and importing the rest would be licensed data —
-- which is the one thing this catalogue was built to avoid.
--
-- So the lists are editorial. Each one is a position somebody took, with a sentence saying
-- why, and an order that means something. That is a different product from a leaderboard
-- and a more honest one: a ranking derived from a score nobody here computed would be a
-- borrowed opinion wearing a number.

CREATE TABLE IF NOT EXISTS public.title_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  /** One or two sentences in the house voice, shown under the title. */
  blurb TEXT,
  /**
   * year    — the best of a single year
   * decade  — the best of a decade
   * genre   — a genre, tone or theme
   * place   — a country or region
   * pick    — an editorial selection that fits none of the above
   */
  kind TEXT NOT NULL CHECK (kind IN ('year', 'decade', 'genre', 'place', 'pick')),
  /** What the list is of, for grouping: '1999', '1990s', 'Horror', 'South Korea'. */
  facet TEXT,
  /** Lower sorts first on the index. */
  position INTEGER NOT NULL DEFAULT 100,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.title_list_entries (
  list_id UUID NOT NULL REFERENCES public.title_lists(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  /** 1 is the top of the list. Order is the whole point; ties are not allowed. */
  position INTEGER NOT NULL,
  /** Why this one, in a line. Optional, but a list of bare titles says very little. */
  note TEXT,
  PRIMARY KEY (list_id, title_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_list_entries_order ON public.title_list_entries (list_id, position);
CREATE INDEX IF NOT EXISTS idx_list_entries_title ON public.title_list_entries (title_id);
CREATE INDEX IF NOT EXISTS idx_lists_kind ON public.title_lists (kind, position) WHERE published;

ALTER TABLE public.title_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_list_entries ENABLE ROW LEVEL SECURITY;

-- Lists are public reading, like the catalogue they arrange. Writing happens outside the
-- app, the same way the catalogue is built.
CREATE POLICY "Anyone can read published lists" ON public.title_lists
  FOR SELECT USING (published);
CREATE POLICY "Anyone can read entries of published lists" ON public.title_list_entries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.title_lists l WHERE l.id = list_id AND l.published));

GRANT SELECT ON public.title_lists TO anon, authenticated;
GRANT SELECT ON public.title_list_entries TO anon, authenticated;
