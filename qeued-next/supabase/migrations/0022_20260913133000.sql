-- Reduces a title to what two catalogue entries for the same work will always share.
--
-- Deduplication matched names exactly, which missed the duplicates that actually occur. The
-- same work arrives from two candidate lists spelled differently and both get catalogued:
-- Harlan County USA against Harlan County U.S.A., My Neighbor Totoro against My Neighbour
-- Totoro, Three Colours: Blue against Three Colors: Blue, Dr. Strangelove against its full
-- title. None of those pairs are two works.
--
-- Case, accents and punctuation are set aside, and the handful of British spellings that
-- differ in a way no other rule catches are folded to one side. The list is deliberately
-- short and explicit: a general -our to -or rule would collapse hour, four and your.

CREATE OR REPLACE FUNCTION public.comparable_name(value TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT regexp_replace(
    replace(replace(replace(replace(replace(
      translate(
        lower(coalesce(value, '')),
        'áàâäãåéèêëíìîïóòôöõúùûüñçøæßœ',
        'aaaaaaeeeeiiiiooooouuuuncoasoe'
      ),
      'colour', 'color'), 'honour', 'honor'), 'neighbour', 'neighbor'),
      'theatre', 'theater'), 'defence', 'defense'),
    '[^a-z0-9]', '', 'g')
$$;

COMMENT ON FUNCTION public.comparable_name(TEXT) IS
  'Title reduced for duplicate detection: case, accents, punctuation and a few British spellings set aside.';
