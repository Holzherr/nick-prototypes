#!/usr/bin/env node
/**
 * Grows the catalogue: takes a list of titles, finds each one's page, and records the facts.
 *
 * Facts come from the page's schema.org block — certificate, runtime, cast, director,
 * genres, country, release date — so nothing is recalled from memory and every field has a
 * citation. Poster art is taken from the same page and fetched before it is stored. The
 * page's own synopsis is deliberately NOT copied: Qeued's synopses are written for Qeued,
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
 */
import { readFile, writeFile } from 'node:fs/promises';

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

/** Diacritics are folded, so a page filed as "Shōgun" still matches a list saying "Shogun". */
const normalise = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
/** Apostrophes vanish rather than becoming separators: "Winter's Bone" is winters-bone. */
const slugify = (value) =>
  String(value).toLowerCase().replace(/['\u2019]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** "PT1H48M0S" → 108. Series durations are per episode, which is what we want. */
const minutesFrom = (duration) => {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?/.exec(String(duration ?? ''));
  if (!match) return null;
  const minutes = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  return minutes || null;
};

/** JustWatch mixes real genres with editorial tags; the tags are not useful to us. */
const TAG_GENRES = /^(made in|based on|kids|action & adventure|mystery & thriller)/i;
const tidyGenres = (genres) =>
  [...new Set((genres ?? [])
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
 * Resolve a title to its page. Slugs are predictable but not unique, so remakes need the
 * year appended; anything whose name or year disagrees with the page is rejected rather
 * than guessed at.
 */
const resolveTitle = async ({ name, year, type, url: given }) => {
  const path = type === 'series' ? 'tv-series' : 'movie';
  const base = slugify(name);
  // Some pages file a work under its subtitle ("Dune: Part One") or drop a leading article.
  const withoutArticle = base.replace(/^(the|a|an)-/, '');
  const slugs = [...new Set([base, `${base}-${year}`, withoutArticle, `${withoutArticle}-${year}`])];
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

    // An exact name, or ours followed by a subtitle: "Dune" may be filed as "Dune: Part One".
    const pageName = normalise(node.name);
    const wanted = normalise(name);
    if (pageName !== wanted && !pageName.startsWith(`${wanted} `)) continue;
    const pageYear = Number(String(node.dateCreated ?? '').slice(0, 4));
    // Series pages date from the first season, films from release; allow a year of drift
    // for late UK releases, and reject anything further out as the wrong work.
    if (year && pageYear && Math.abs(pageYear - year) > (type === 'series' ? 1 : 2)) continue;
    return { url, ...found };
  }
  return null;
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
        `select ${quote(slug)}, 1, ${columns.map((c) => sqlValue(fields[c])).join(', ')} ` +
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
      console.log(`  ?  ${entry.name} (${entry.year}) — no page matched`);
      return null;
    }

    const { node, html, url } = resolved;
    const poster = await posterFrom(html);
    const cast = (node.actor ?? [])
      .map((role) => role.actor?.name ?? role.name)
      .filter(Boolean)
      .slice(0, 8);

    const fields = {
      name: entry.name,
      year: entry.year ?? (Number(String(node.dateCreated ?? '').slice(0, 4)) || null),
      type: entry.type,
      genres: tidyGenres(node.genre),
      certification: node.contentRating ?? null,
      runtime_minutes: minutesFrom(node.duration),
      countries: node.countryOfOrigin ? [node.countryOfOrigin].flat() : [],
      director: (node.director ?? []).map((d) => d.name).filter(Boolean).join(', ') || null,
      cast_members: cast.length ? cast : null,
      image_url: poster,
      image_source_url: poster ? url : null,
      image_attribution: poster ? 'Artwork via JustWatch' : null,
      image_license: poster ? 'rights-reserved' : null,
      catalogued_at: new Date().toISOString(),
    };
    if (!fields.year) delete fields.year;

    const slug = `${slugify(entry.name)}-${fields.year ?? entry.year}`;
    console.log(`  +  ${entry.name} (${fields.year})${poster ? '' : ' — NO POSTER'}`);
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
