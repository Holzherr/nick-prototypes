-- Tone and theme as data, so the ranker stops inferring both from genre.
--
-- The scoring engine has always had five axes, but two of them — tone and theme — were
-- computed from the same number: how much a title's genres overlap the viewer's genre mix.
-- That makes a bleak procedural and a warm family comedy indistinguishable the moment they
-- share the word "Drama", and it is why the deterministic path ranked worse than the
-- model-scored one. These two columns give each axis its own evidence.
--
-- Both use a closed vocabulary. An open one drifts — "funny", "comedic", "humorous" — and
-- overlap between two titles stops meaning anything.

ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS tones text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS themes text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.titles.tones IS
  'How it feels, from a closed vocabulary: bleak, tense, melancholy, warm, funny, playful, romantic, unsettling, uplifting, cool, earnest, absurd.';
COMMENT ON COLUMN public.titles.themes IS
  'What it is about, from a closed vocabulary: family, marriage, parenthood, friendship, coming-of-age, grief, class, politics, war, crime, justice, revenge, survival, workplace, ambition, faith, technology, identity, memory, addiction, art, money, power, isolation, espionage.';

-- Overlap is the whole point of these columns, so index for containment queries.
CREATE INDEX IF NOT EXISTS idx_titles_tones ON public.titles USING gin (tones);
CREATE INDEX IF NOT EXISTS idx_titles_themes ON public.titles USING gin (themes);
