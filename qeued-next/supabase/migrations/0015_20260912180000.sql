-- Watching a series is a position, not a flag; ordering a queue is a comparison, not a form;
-- and availability is a thing that changes rather than a fact.

-- Where someone actually is in a series. "Watching" as a single bit cannot tell you what to
-- put on next, which is the question the app exists to answer.
ALTER TABLE public.watch_entries
  ADD COLUMN IF NOT EXISTS current_season integer CHECK (current_season IS NULL OR current_season > 0),
  ADD COLUMN IF NOT EXISTS current_episode integer CHECK (current_episode IS NULL OR current_episode > 0),
  ADD COLUMN IF NOT EXISTS progress_updated_at TIMESTAMP WITH TIME ZONE,
  -- Derived from the duels below; null means never compared.
  ADD COLUMN IF NOT EXISTS queue_rank DOUBLE PRECISION;

COMMENT ON COLUMN public.watch_entries.current_episode IS 'Last episode watched, not the next one — so "next up" is always this plus one.';
COMMENT ON COLUMN public.watch_entries.queue_rank IS 'Bradley-Terry style strength from queue_duels. Higher wants watching sooner.';

-- One tap per comparison: asking "this or that" a few times orders a list that a 1-10
-- dropdown never got used for once.
CREATE TABLE IF NOT EXISTS public.queue_duels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  winner_title_id UUID REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
  loser_title_id UUID REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_titles CHECK (winner_title_id != loser_title_id)
);
CREATE INDEX IF NOT EXISTS idx_queue_duels_profile ON public.queue_duels(profile_id, created_at DESC);

ALTER TABLE public.queue_duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read duels for profiles they control" ON public.queue_duels FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())));
CREATE POLICY "Users can record duels for profiles they control" ON public.queue_duels FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())));

-- Availability rows were replaced wholesale on each refresh, which threw away the only
-- interesting part: what changed. Keeping first and last sighting turns the same data into
-- "just landed on Netflix" and "no longer streaming anywhere".
ALTER TABLE public.title_availability
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.title_availability.removed_at IS 'Set when a refresh no longer finds this offer. Rows are kept so changes can be reported.';

CREATE INDEX IF NOT EXISTS idx_title_availability_changes
  ON public.title_availability(region, first_seen_at DESC) WHERE removed_at IS NULL;

-- What a profile can currently stream, ignoring offers that have gone away.
CREATE OR REPLACE VIEW public.current_availability AS
  SELECT title_id, region, provider, offer_type, url, note, first_seen_at, last_seen_at
  FROM public.title_availability
  WHERE removed_at IS NULL;
