#!/usr/bin/env node
/**
 * Grows the catalogue: takes a list of titles, finds each one's page, and records the facts.
 *
 * Facts come from the page's schema.org block — certificate, runtime, cast, director,
 * genres, country, release date — so nothing is recalled from memory and every field has a
 * citation. Poster art is taken from the same page and fetched before it is stored. The
 * page's own synopsis is deliberately NOT copied: qeued's synopses are written for qeued,
 * so this leaves the field empty and `catalogue.mjs todo` reports it as outstanding.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/expand.mjs titles.json [--dry-run] [--limit N]
 *
 * The slow half is the network, so it can be run on its own and written later — which also
 * means a failed write costs no re-scraping, and no service key is needed at all:
 *
 *   node tools/expand.mjs titles.json --gather gathered.json
 *   node tools/expand.mjs --sql wave.sql --from gathered.json
 *   npx supabase db query -f wave.sql --db-url "$QEUED_DB_URL"
 *
 * Input is a JSON array of { name, year, type } — the script resolves each to a page,
 * verifies the name and year match what came back, and skips anything it cannot confirm.
 * A record may also carry `aliases`, other names to try once its own has failed; a record
 * without one gets whatever tools/data/aliases.json lists for it, which is usually nothing.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { aliasesFor } from './aliases.mjs';

const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const POSTER_SIZE = 's592';

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Diacritics are folded, so a page filed as "Shōgun" still matches a list saying "Shogun".
 *
 * Apostrophes are deleted rather than turned into a separator, the same way `slugify` treats
 * them. They used to become a space, which meant the name we derived from a page's own slug
 * ("howls-moving-castle" → "howls moving castle") could never equal the name we derived from
 * the title we were looking for ("Howl's Moving Castle" → "howl s moving castle"), and every
 * possessive in the catalogue failed to resolve.
 */
const normalise = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * The same name with every space closed up, for comparing across a word break nobody agrees
 * on: we hold "Goodbye, Lenin!" and JustWatch files "Good Bye Lenin!", we say "Spider-Man"
 * and a page says "Spider Man". Condensed, those are the same string. It is only ever used
 * to accept a match the spaced comparison already nearly made, never to widen one.
 */
const condense = (value) => normalise(value).replace(/ /g, '');

/** The same name with every article removed, in any language we are likely to meet. */
const ARTICLES = new Set(['the', 'a', 'an', 'le', 'la', 'les', 'el', 'los', 'las', 'il', 'lo', 'der', 'die', 'das', 'den', 'de', 'het', 'o', 'os', 'as', 'um', 'una', 'un', 'uma']);
const bareWords = (value) =>
  normalise(value)
    .split(' ')
    .filter((word) => word && !ARTICLES.has(word))
    .join('');
/**
 * Apostrophes vanish rather than becoming separators, so "Winter's Bone" is winters-bone.
 *
 * Accents are folded for the same reason: without that, every non-alphanumeric character
 * becomes a hyphen and Amélie is filed at am-lie, Tár at t-r, Caché at cach.
 */
const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Levenshtein, uncapped — titles are short, so the full matrix costs nothing. */
const editDistance = (a, b) => {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
};

/**
 * The names a title might be filed under, given how we hold it.
 *
 * A candidate list routinely carries an alternative in brackets — "Uzak (Distant)" — and
 * JustWatch files the work under one of the two, never both. Trying each separately costs a
 * request and turns a miss into a match.
 */
const namesFor = (name) => {
  const outer = String(name).replace(/\s*\([^)]*\)\s*$/, '').trim();
  const inner = /\(([^)]+)\)\s*$/.exec(String(name))?.[1]?.trim();
  // JustWatch files a show once and lists its seasons on that page, so a candidate naming a
  // season — "Jujutsu Kaisen Season 2" — has no page of its own and only the show does.
  const unseasoned = [String(name), outer].map((value) =>
    String(value).replace(/[\s:,-]*\b(season|series)\s*\d+\s*$/i, '').trim(),
  );
  return [...new Set([String(name).trim(), outer, inner, ...unseasoned].filter(Boolean))];
};

/**
 * The page's own spelling of a name, where ours differs only in how it is written.
 *
 * Candidate lists add and drop leading articles freely — Minions arrives as "The Minions",
 * The Thin Blue Line as "Thin Blue Line" — and close up spaces ("Wildchild"). The page is
 * the cited source, so where the two names are the same string once an article and the
 * spaces are set aside, the page's form is the right one to store. Returns null when they
 * differ by anything more, which is most of the time: a page's name is often the
 * original-language title ("Hauru no ugoku shiro") and must never overwrite ours.
 */
const preferredName = (theirs, ours) => {
  const a = normalise(theirs);
  const b = normalise(ours);
  if (!a || !b || a === b) return null;
  if (condense(a) !== condense(b) && bareWords(a) !== bareWords(b)) return null;
  return decodeEntities(String(theirs)).trim();
};

/**
 * Whether a page's name and the one being looked for describe the same work.
 *
 * 'exact' where they agree outright. 'near' where they differ the way titles routinely
 * differ between a catalogue and a streaming guide: a dropped leading segment (Laputa:
 * Castle in the Sky is filed as Castle in the Sky), a trailing subtitle, or a spelling
 * variant (Three Colours: Blue against Three Colors: Blue). Anything else is null.
 *
 * A 'near' match is only ever accepted with the year agreeing exactly, because "The Hunting"
 * is a near match for "The Hunting Ground" and they are different films. The length floor on
 * the spelling rule keeps short titles from collapsing into each other — Heat and Heart are
 * one edit apart.
 */
const nameAgreement = (theirs, ours) => {
  const a = normalise(theirs);
  const b = normalise(ours);
  if (!a || !b) return null;
  if (a === b || condense(a) === condense(b)) return 'exact';
  if (a.startsWith(`${b} `) || b.startsWith(`${a} `)) return 'near';
  if (a.endsWith(` ${b}`) || b.endsWith(` ${a}`)) return 'near';
  // Articles drift in and out anywhere in a title, not just at the front: we hold "The House
  // of the Flying Daggers" against a page's "House of Flying Daggers", and "El Aura" against
  // "The Aura". Dropping every article from both sides makes those the same string, and the
  // exact-year rule on a near match keeps it from over-reaching.
  if (bareWords(a) === bareWords(b)) return 'exact';
  const [x, y] = [condense(a), condense(b)];
  if (Math.min(x.length, y.length) >= 8 && editDistance(x, y) <= 2) return 'near';
  return null;
};

/** "PT1H48M0S" → 108. Series durations are per episode, which is what we want. */
const minutesFrom = (duration) => {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?/.exec(String(duration ?? ''));
  if (!match) return null;
  const minutes = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  return minutes || null;
};

/** JustWatch mixes real genres with editorial tags; the tags are not useful to us. */
const TAG_GENRES = /^(made in|based on|kids|action & adventure|mystery & thriller)/i;
/**
 * The page's markup reaches the JSON-LD block with its entities intact, so a director comes
 * back as `Gavin O&#x27;Connor` and a genre as `War &amp; Military` — and occasionally
 * double-escaped, where an already-escaped string was escaped again. Decoded twice, which is
 * what unpicks that.
 */
const decodeEntities = (value) => {
  if (typeof value !== 'string') return value;
  const pairs = [['&amp;', '&'], ['&#x27;', "'"], ['&#39;', "'"], ['&quot;', '"'], ['&#x2F;', '/'], ['&nbsp;', ' '], ['&lt;', '<'], ['&gt;', '>']];
  let text = value;
  for (let pass = 0; pass < 2; pass += 1) {
    for (const [entity, plain] of pairs) text = text.split(entity).join(plain);
  }
  return text;
};

const tidyGenres = (genres) =>
  [...new Set((genres ?? []).map(decodeEntities)
    .filter((g) => !/^made in|^based on/i.test(g))
    .map((g) => (g === 'Mystery & Thriller' ? 'Thriller' : g === 'Action & Adventure' ? 'Action' : g))
    .filter((g) => !TAG_GENRES.test(g) || ['Thriller', 'Action'].includes(g)))];

const resolves = async (url) => {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA, Range: 'bytes=0-2047' } });
    if (!res.ok && res.status !== 206) return false;
    const type = res.headers.get('content-type') ?? '';
    await res.arrayBuffer();
    return type.startsWith('image/');
  } catch {
    return false;
  }
};

const posterFrom = async (html) => {
  const paths = [...new Set([...html.matchAll(/images\.justwatch\.com\/poster\/[^"'\s\\)]+\.jpg/g)].map((m) => m[0]))];
  const seasonNumber = (path) => Number(path.match(/season-(\d+)\.jpg$/)?.[1] ?? 0);
  paths.sort((a, b) => seasonNumber(a) - seasonNumber(b));
  for (const path of paths.slice(0, 4)) {
    const candidate = `https://${path.replace(/\/s\d+\//, `/${POSTER_SIZE}/`)}`;
    if (await resolves(candidate)) return candidate;
  }
  return null;
};

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `worker` over `items` with a fixed number in flight.
 *
 * Building a catalogue of thousands one page at a time takes hours of waiting on the
 * network for a machine that is otherwise idle. A few at once is both much faster and
 * still gentle — each worker keeps its own pause, so the request rate is the concurrency
 * divided by the pause, not a burst.
 */
const pooled = async (items, concurrency, worker) => {
  const queue = [...items.entries()];
  const results = new Array(items.length);
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const next = queue.shift();
      if (!next) return;
      const [index, item] = next;
      results[index] = await worker(item);
    }
  });
  await Promise.all(runners);
  return results;
};

/**
 * Fetch a candidate page and return its schema.org record, or null if it isn't there.
 * A bulk run trips rate limiting, and a throttled response is indistinguishable from a
 * missing page unless we retry — so a non-404 failure is given a second chance.
 */
const fetchRecord = async (url, attempt = 0) => {
  let html;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA } });
    if (res.status === 404) return null;
    if (!res.ok) {
      if (attempt >= 2) return null;
      await pause(2000 * (attempt + 1));
      return fetchRecord(url, attempt + 1);
    }
    html = await res.text();
  } catch {
    if (attempt >= 2) return null;
    await pause(2000 * (attempt + 1));
    return fetchRecord(url, attempt + 1);
  }
  // Two things made real pages look missing: only the first block was read, and the tag was
  // expected to start with its type attribute — JustWatch puts data-vue-meta first, so every
  // page it server-renders that way was skipped.
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let graph;
    try {
      graph = JSON.parse(match[1]);
    } catch {
      continue;
    }
    const found = (graph['@graph'] ?? [graph]).find((n) => n['@type'] === 'Movie' || n['@type'] === 'TVSeries');
    if (found) return { node: found, html };
  }
  return null;
};

/**
 * Asks JustWatch what it calls a title, when the slug cannot be guessed from the name.
 *
 * Most pages are at a predictable slug, but a large minority are not, and they are not the
 * obscure ones: "Dr. Strangelove" is filed under its full title, Demon Slayer under Kimetsu
 * no Yaiba, Star Wars under Episode IV, and every ampersand and accent produces a slug
 * nobody would derive. That was a third of a wave failing on titles that plainly exist.
 *
 * The year does the disambiguating — a bare "Star Wars" matches several films and only one
 * of them came out in 1977 — so a candidate with no year has to match its title exactly.
 */
const searchForPage = async (name, year, type, { trustNameOverYear = true } = {}) => {
  const wanted = type === 'series' ? 'SHOW' : 'MOVIE';
  const address = (node) => `https://www.justwatch.com${node.content.fullPath}`;
  let results;
  try {
    const res = await fetch('https://apis.justwatch.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': BROWSER_UA },
      body: JSON.stringify({
        operationName: 'GetSuggestedTitles',
        variables: { country: 'GB', language: 'en', first: 8, filter: { searchQuery: name } },
        query: `query GetSuggestedTitles($country: Country!, $language: Language!, $first: Int!, $filter: TitleFilter) {
          popularTitles(country: $country, first: $first, filter: $filter) {
            edges { node { ... on MovieOrShow {
              objectType
              content(country: $country, language: $language) { title originalReleaseYear fullPath }
            } } }
          }
        }`,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    results = (json?.data?.popularTitles?.edges ?? []).map((edge) => edge.node).filter((node) => node?.content);
  } catch {
    return null;
  }

  // A candidate list is written by a model, and its weakest field is the year: Titane is
  // listed at 2016 and released in 2021, Nobody Knows at 2001 and released in 2004. Where
  // exactly one result carries the name outright, the name is the better evidence and the
  // page's own date replaces the one we were given. Where two results do — The Thing, Dune,
  // any remake — the year is the only thing separating them and it has to hold.
  const exactMatches = results.filter(
    (node) => node.objectType === wanted && [node.content.title, node.content.fullPath.split('/').pop() ?? '']
      .some((candidate) => nameAgreement(candidate, name) === 'exact'),
  );

  for (const node of results) {
    if (node.objectType !== wanted) continue;
    // The returned title is sometimes the original-language one while the slug carries the
    // English name — Demon Slayer comes back as "Kimetsu no Yaiba" at /demon-slayer-…, and
    // Man with a Movie Camera as "Chelovek s kino-apparatom". Either may be the match.
    const names = [node.content.title, node.content.fullPath.split('/').pop() ?? ''];
    const agreements = names.map((candidate) => nameAgreement(candidate, name)).filter(Boolean);
    if (!agreements.length) continue;

    // An exact title match can tolerate the usual year drift. A near one cannot: "The
    // Hunting" is a prefix of "The Hunting Ground", and two years of slack was enough to
    // accept the wrong film. Where the names only resemble each other, the year has to agree.
    const exactName = agreements.includes('exact');
    const theirYear = node.content.originalReleaseYear;
    if (!year) {
      if (exactName) return { url: address(node) };
      continue;
    }
    if (!theirYear) continue;
    const slack = exactName ? (type === 'series' ? 3 : 2) : 0;
    if (Math.abs(theirYear - year) <= slack) return { url: address(node) };
    if (trustNameOverYear && exactName && exactMatches.length === 1) return { url: address(node), correctedYear: theirYear };
  }

  // Nothing matched by name. JustWatch indexes a work's other titles even though it only
  // ever shows one, so a search for "Nueve Reinas" comes back as Nine Queens and "Apur
  // Sansar" as The World of Apu — the right page under a name that shares no words with
  // ours. Its own search made that connection; what we can add is a year.
  //
  // The year has to agree exactly, and that is what makes this safe rather than reckless:
  // the same search also offers Line of Duty for "Antonia's Line" and Dune for "Chronique
  // d'un Été", and every one of those misses by decades. The result must also lead its
  // type, since a translation is what the guide thinks the query means, not an afterthought.
  if (!year) return null;
  const leading = results.find((node) => node.objectType === wanted);
  if (leading && leading.content.originalReleaseYear === year) {
    return { url: address(leading), translated: true };
  }
  return null;
};

/**
 * Resolve a title to its page. Slugs are predictable but not unique, so remakes need the
 * year appended; anything whose name or year disagrees with the page is rejected rather
 * than guessed at.
 */
/**
 * A name that names a season is a series by construction, whatever else it resembles.
 *
 * "Part" is deliberately not here. A season is never part of a film's title, but a part
 * routinely is — The Hunger Games: Mockingjay Part 1 and Dune: Part Two are the whole names
 * of the works, and stripping the suffix would hunt for films that do not exist.
 */
const SEASONED = /\b(season|series)\s*\d+\s*$/i;

/**
 * A title under its own name first, then under each alias it was given.
 *
 * The search already reaches a page filed under a translation when the year agrees exactly
 * (see searchForPage), so an alias is for the case that defeats it: the leading result for
 * "Hotaru no haka" is the 2005 remake of Grave of the Fireflies, not the 1988 film, and the
 * year rule rightly refuses it. Someone who knows the English name writes it down once in
 * tools/data/aliases.json, and it is tried here as a name in its own right, cross-type
 * fallback included. A candidate with no alias costs nothing extra: the loop is empty.
 *
 * What comes back is still filed under the candidate's own name and year. The alias found
 * the page; it is not what the catalogue holds the work as, and identity is name and year.
 */
const resolveTitle = async (entry) => {
  const found = await resolveNamed(entry);
  if (found) return found;
  for (const alias of entry.aliases ?? aliasesFor(entry)) {
    const viaAlias = await resolveNamed({ name: alias, year: entry.year, type: entry.type });
    if (viaAlias) return { ...viaAlias, correctedName: null, correctedYear: null, alias };
  }
  return null;
};

const resolveNamed = async (entry) => {
  const found = await resolveAs(entry, entry.type);
  if (found || entry.url) return found;
  // Never cross types for a name that carried a season suffix. "Attack on Titan Season 4"
  // reduces to "Attack on Titan", which misses the anime on year and then matches a
  // low-budget American film of that name exactly — a wrong record built out of two rules
  // that are each right on their own.
  if (SEASONED.test(String(entry.name))) return null;
  // A candidate list gets the type wrong often enough to matter: A Taste of Honey and
  // Accidental Love arrive typed as series and are films, Deux Frères likewise. The other
  // type is worth one more request, and it is safe because the name and year still have to
  // agree — the type was never what made a match trustworthy.
  const other = entry.type === 'series' ? 'movie' : 'series';
  const crossed = await resolveAs(entry, other);
  // The page decides what this is. Storing the candidate's type would file A Taste of Honey,
  // a film, on the television shelf — worse than not holding it at all.
  return crossed && { ...crossed, correctedType: other };
};

const resolveAs = async ({ name, year, url: given }, type) => {
  const path = type === 'series' ? 'tv-series' : 'movie';
  const aliases = namesFor(name);
  // Some pages file a work under its subtitle ("Dune: Part One") or drop a leading article.
  const slugs = [...new Set(aliases.flatMap((alias) => {
    const base = slugify(alias);
    const withoutArticle = base.replace(/^(the|a|an)-/, '');
    return [base, `${base}-${year}`, withoutArticle, `${withoutArticle}-${year}`];
  }))];
  // A record may carry the page's address outright, for the titles whose slug is not
  // derivable from the name. It is tried first and still has to pass the same checks.
  const candidates = [...(given ? [given] : []), ...slugs.map((slug) => `https://www.justwatch.com/uk/${path}/${slug}`)];

  for (const url of candidates) {
    const found = await fetchRecord(url);
    if (!found) continue;

    const { node } = found;
    // A record that names its page has already been resolved deliberately, and the page's
    // own title is often the original-language one — "Cinema Paradiso" is filed as "Nuovo
    // Cinema Paradiso", "Trapped" as "Ófærð". Trust the address, still check the year.
    if (given && url === given) {
      const pageYear = Number(String(node.dateCreated ?? '').slice(0, 4));
      if (year && pageYear && Math.abs(pageYear - year) > (type === 'series' ? 1 : 2)) continue;
      return { url, ...found };
    }

    // We are only here because a slug derived from our own name had a page, so the name
    // check is confirming rather than searching — a variant spelling still has to bring the
    // exact year with it.
    const matched = aliases.find((alias) => nameAgreement(node.name, alias));
    if (!matched) continue;
    const agreement = nameAgreement(node.name, matched);
    const pageYear = Number(String(node.dateCreated ?? '').slice(0, 4));
    // Series pages date from the first season, films from release; allow a couple of years
    // of drift for late UK releases, and reject anything further out as the wrong work.
    // A series' year is the softest fact in a candidate list: Rumpole of the Bailey is dated
    // from its 1975 pilot here and its 1978 first series everywhere else, and a model writing
    // the list will pick either. An exact name on a series is strong enough to carry that.
    const slack = agreement === 'exact' ? (type === 'series' ? 3 : 2) : 0;
    if (year && pageYear && Math.abs(pageYear - year) > slack) continue;
    // Where the match came from a reduced form of the name — a bracket opened, a season
    // suffix dropped — the page is the show and its name is the one to keep. Storing
    // "Jujutsu Kaisen Season 2" against the Jujutsu Kaisen page would file a second copy of
    // a show we already hold.
    const reduced = matched !== String(name).trim();
    const corrected = reduced ? decodeEntities(String(node.name)).trim() : preferredName(node.name, name);
    // Having decided the page is the work rather than the season, its date is the work's too
    // — otherwise Jujutsu Kaisen lands at 2023 beside the 2020 record of the same show.
    return { url, correctedName: corrected, correctedYear: reduced ? pageYear || null : null, ...found };
  }

  // Nothing at a derivable slug. Ask what it is filed as, then read that page — trusting the
  // address the way an explicitly supplied one is trusted, since the search already matched
  // on title and year.
  if (given) return null;
  let searched = null;
  for (const alias of aliases) {
    // Trusting the name over the year is only safe for the name as it was actually given.
    // An alias pulled out of a bracket is a fragment — "Uzak (Distant)" yields "Distant",
    // which is the whole title of an unrelated 2024 film, and overriding the year there
    // files the wrong work under the right name.
    searched = await searchForPage(alias, year, type, { trustNameOverYear: alias === name.trim() });
    if (searched) { searched.alias = alias; break; }
  }
  if (!searched) return null;
  const found = await fetchRecord(searched.url);
  if (!found) return null;
  const reduced = searched.translated
    || (searched.alias !== undefined && searched.alias !== String(name).trim());
  const viaAlias = reduced
    ? decodeEntities(String(found.node.name)).trim()
    : preferredName(found.node.name, name);
  const pageYear = Number(String(found.node.dateCreated ?? '').slice(0, 4));
  // The search matched on title and year, so the address is trusted the way an explicitly
  // supplied one is — except where the search deliberately overrode a wrong year, in which
  // case the page's own date is the fact and is handed back to be stored instead.
  if (searched.correctedYear) {
    return { url: searched.url, correctedYear: pageYear || searched.correctedYear, correctedName: viaAlias, ...found };
  }
  if (year && pageYear && Math.abs(pageYear - year) > (type === 'series' ? 3 : 2)) return null;
  return { url: searched.url, correctedName: viaAlias, correctedYear: reduced ? pageYear || null : null, ...found };
};

const args = process.argv.slice(2);
const flagValue = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};
const flagValues = new Set(['limit', 'gather', 'sql', 'from'].map(flagValue).filter(Boolean));
const input = args.find((a) => !a.startsWith('--') && !flagValues.has(a));
const dryRun = args.includes('--dry-run');
const limit = flagValue('limit') ? Number(flagValue('limit')) : null;
const gatherPath = flagValue('gather');
const sqlPath = flagValue('sql');
const fromPath = flagValue('from');
const missesPath = flagValue('misses');
const concurrency = Math.max(1, Number(flagValue('concurrency') ?? 4));
if (!KEY && !gatherPath && !sqlPath) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or pass --gather/--sql)');

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;
const sqlValue = (value) => {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return value.length ? `ARRAY[${value.map(quote).join(', ')}]::text[]` : `'{}'::text[]`;
  if (typeof value === 'number') return String(value);
  return quote(value);
};

/**
 * Gathered records become one INSERT each plus its citations, inside a DO block: the query
 * channel takes a file as a single statement, and a wave should land whole or not at all.
 *
 * A title already present is updated rather than duplicated — the slug is the identity, and
 * re-running a wave after fixing one entry must not leave two rows behind.
 */
/**
 * An expression yielding a slug nothing else has taken.
 *
 * Slugs are unique and two different works can want the same one — Amelie and Amélie fold
 * together, and so do a film and the series named after it. The whole wave is a single
 * transaction, so one collision used to throw away every title in the batch. This picks the
 * bare slug where it is free and the first numbered variant where it is not, which is the
 * convention the catalogue already carries from an earlier collision (winter-s-bone-2010-2).
 */
const freeSlug = (slug) =>
  `(select g.candidate from (select case when i = 1 then ${quote(slug)} else ${quote(slug)} || '-' || i end as candidate ` +
  `from generate_series(1, 20) as i) as g where not exists (select 1 from public.titles x where x.slug = g.candidate) limit 1)`;

const sqlForGathered = (records) => {
  const statements = [];
  for (const { slug, url, fields } of records) {
    const columns = Object.keys(fields);
    // A title's identity is its name and year, not its slug — an earlier collision left one
    // row as "winter-s-bone-2010-2", and matching on slug alone would file a second copy.
    const match = `lower(name) = lower(${quote(fields.name)}) and year is not distinct from ${sqlValue(fields.year ?? null)}`;

    statements.push(
      `update public.titles set ${columns.map((c) => `${c} = ${sqlValue(fields[c])}`).join(', ')}, ` +
        `catalogue_version = catalogue_version + 1 where ${match};`,
    );
    statements.push(
      `insert into public.titles (slug, catalogue_version, ${columns.join(', ')}) ` +
        `select ${freeSlug(slug)}, 1, ${columns.map((c) => sqlValue(fields[c])).join(', ')} ` +
        `where not exists (select 1 from public.titles where ${match});`,
    );

    const cited = ['certification', 'runtime_minutes', 'cast_members', 'genres', 'image_url'].filter(
      (field) => fields[field] !== null && fields[field] !== undefined,
    );
    if (!cited.length) continue;
    statements.push(
      `insert into public.title_sources (title_id, field, source_url, source_name) ` +
        `select t.id, f.field, ${quote(url)}, 'JustWatch UK' from public.titles t, ` +
        `unnest(ARRAY[${cited.map(quote).join(', ')}]) as f(field) where ${match} ` +
        `on conflict (title_id, field, source_url) do nothing;`,
    );
  }
  return ['-- Catalogue wave. Generated by tools/expand.mjs.', 'do $wave$ begin', ...statements.map((l) => `  ${l}`), 'end $wave$;', ''].join('\n');
};

if (sqlPath) {
  if (!fromPath) throw new Error('--sql needs --from <gathered.json>');
  const gathered = JSON.parse(await readFile(fromPath, 'utf8'));
  await writeFile(sqlPath, sqlForGathered(gathered));
  console.log(`Wrote ${gathered.length} title(s) to ${sqlPath}.`);
  console.log(`Apply with: npx supabase db query -f ${sqlPath} --db-url "$QEUED_DB_URL"`);
  process.exit(0);
}

const run = async () => {
  if (!input) throw new Error('Usage: expand.mjs titles.json [--dry-run] [--limit N]');
  const wanted = JSON.parse(await readFile(input, 'utf8'));
  const batch = limit ? wanted.slice(0, limit) : wanted;

  // Gathering touches nothing, so it does not need to know what is already stored.
  const existing = gatherPath ? [] : await rest('titles?select=id,name,year');
  const seen = new Map(existing.map((t) => [`${normalise(t.name)}|${t.year}`, t.id]));
  const gathered = [];
  const misses = [];

  let added = 0;
  let updated = 0;
  let missed = 0;

  /** Everything that only reads: the page, the poster, and the facts on it. */
  const fetchOne = async (entry) => {
    await pause(400);
    const resolved = await resolveTitle(entry);
    if (!resolved) {
      missed += 1;
      misses.push({ name: entry.name, year: entry.year, type: entry.type, error: 'no page matched' });
      const tried = entry.aliases ?? aliasesFor(entry);
      console.log(`  ?  ${entry.name} (${entry.year}) — no page matched${tried.length ? `, nor as ${tried.join(', ')}` : ''}`);
      return null;
    }

    const { node, html, url, correctedYear, correctedName, correctedType, alias } = resolved;
    const poster = await posterFrom(html);
    const cast = (node.actor ?? [])
      .map((role) => decodeEntities(role.actor?.name ?? role.name))
      .filter(Boolean)
      .slice(0, 8);

    const fields = {
      name: correctedName ?? entry.name,
      year: correctedYear ?? entry.year ?? (Number(String(node.dateCreated ?? '').slice(0, 4)) || null),
      type: correctedType ?? entry.type,
      genres: tidyGenres(node.genre),
      certification: node.contentRating ?? null,
      runtime_minutes: minutesFrom(node.duration),
      countries: node.countryOfOrigin ? [node.countryOfOrigin].flat() : [],
      director: (node.director ?? []).map((d) => decodeEntities(d.name)).filter(Boolean).join(', ') || null,
      cast_members: cast.length ? cast : null,
      image_url: poster,
      image_source_url: poster ? url : null,
      image_attribution: poster ? 'Artwork via JustWatch' : null,
      image_license: poster ? 'rights-reserved' : null,
      catalogued_at: new Date().toISOString(),
    };
    if (!fields.year) delete fields.year;

    const slug = `${slugify(entry.name)}-${fields.year ?? entry.year}`;
    console.log(`  +  ${entry.name} (${fields.year})${alias ? ` — via ${alias}` : ''}${poster ? '' : ' — NO POSTER'}`);
    added += 1;
    return { entry, slug, url, fields };
  };

  // Reading is safe to do several at a time; writing is not, so only the gather path uses
  // the pool and the write path keeps its one-at-a-time loop.
  if (gatherPath) {
    const found = await pooled(batch, concurrency, fetchOne);
    for (const record of found) {
      if (record) gathered.push({ slug: record.slug, url: record.url, fields: record.fields });
    }
  }

  for (const entry of gatherPath ? [] : batch) {
    const record = await fetchOne(entry);
    if (!record) continue;
    const { slug, url, fields } = record;

    const key = `${normalise(entry.name)}|${fields.year ?? entry.year}`;
    const existingId = seen.get(key);

    if (dryRun) {
      console.log(
        `  ${existingId ? '~' : '+'}  ${entry.name} (${fields.year}) — ${fields.certification ?? 'no cert'}, ` +
          `${fields.runtime_minutes ?? '?'} min, ${fields.genres.join('/')}${poster ? ', poster' : ', NO POSTER'}`,
      );
      continue;
    }

    let titleId = existingId;
    if (titleId) {
      const [current] = await rest(`titles?select=catalogue_version&id=eq.${titleId}`);
      await rest(`titles?id=eq.${titleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...fields, catalogue_version: (current?.catalogue_version ?? 0) + 1 }),
      });
      updated += 1;
    } else {
      const [row] = await rest('titles', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ ...fields, slug, catalogue_version: 1 }),
      });
      titleId = row.id;
      added += 1;
    }
    console.log(`  ${existingId ? '~' : '+'}  ${entry.name} (${fields.year})`);

    for (const field of ['certification', 'runtime_minutes', 'cast_members', 'genres', 'image_url']) {
      if (fields[field] === null || fields[field] === undefined) continue;
      await rest('title_sources?on_conflict=title_id,field,source_url', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ title_id: titleId, field, source_url: url, source_name: 'JustWatch UK' }),
      });
    }
  }

  // A run of several hundred always has misses, and a terminal is the wrong place to keep
  // them: written down, the queue can retire the names that have no page and retry the rest.
  if (missesPath) await writeFile(missesPath, JSON.stringify(misses, null, 1));

  if (gatherPath) {
    await writeFile(gatherPath, JSON.stringify(gathered, null, 1));
    console.log(`\nGathered ${added} title(s) into ${gatherPath}, ${missed} unmatched.`);
    console.log(`Next: node tools/expand.mjs --sql wave.sql --from ${gatherPath}`);
    return;
  }

  console.log(
    dryRun
      ? `\nDry run: ${batch.length} checked, ${missed} unmatched, nothing written.`
      : `\nAdded ${added}, updated ${updated}, ${missed} unmatched.`,
  );
};

await run();
