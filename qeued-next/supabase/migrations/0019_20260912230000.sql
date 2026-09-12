-- Five more themes, added because the catalogue grew into subjects the vocabulary had no
-- word for.
--
-- The first wave was 464 titles of mostly English-language prestige drama, and 25 themes
-- covered it. Adding thirty documentaries, twenty-five animations and thirty non-English
-- titles exposed the gaps immediately: a nature series, a sport documentary and a concert
-- film were all being forced into `art` or `ambition`, which makes those tags mean less for
-- every title already carrying them. `race` and `history` were flagged repeatedly as
-- subjects with no home during the first tagging pass.
--
-- The vocabulary stays closed. It grows deliberately, and tools/enrich.mjs rejects anything
-- outside it before a write.

COMMENT ON COLUMN public.titles.themes IS
  'What it is about, from a closed vocabulary: family, marriage, parenthood, friendship, coming-of-age, grief, class, politics, war, crime, justice, revenge, survival, workplace, ambition, faith, technology, identity, memory, addiction, art, money, power, isolation, espionage, nature, sport, music, history, race.';
