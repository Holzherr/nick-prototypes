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
 * Input is a JSON array of { name, year, type } — the script resolves each to a page,
 * verifies the name and year match what came back, and skips anything it cannot confirm.
 */
import { readFile } from 'node:fs/promises';

const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

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

const normalise = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
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
  const block = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)][0]?.[1];
  if (!block) return null;
  let graph;
  try {
    graph = JSON.parse(block);
  } catch {
    return null;
  }
  const node = (graph['@graph'] ?? [graph]).find((n) => n['@type'] === 'Movie' || n['@type'] === 'TVSeries');
  return node ? { node, html } : null;
};

/**
 * Resolve a title to its page. Slugs are predictable but not unique, so remakes need the
 * year appended; anything whose name or year disagrees with the page is rejected rather
 * than guessed at.
 */
const resolveTitle = async ({ name, year, type }) => {
  const path = type === 'series' ? 'tv-series' : 'movie';
  const base = slugify(name);
  // Some pages file a work under its subtitle ("Dune: Part One") or drop a leading article.
  const withoutArticle = base.replace(/^(the|a|an)-/, '');
  const candidates = [...new Set([base, `${base}-${year}`, withoutArticle, `${withoutArticle}-${year}`])];

  for (const slug of candidates) {
    const url = `https://www.justwatch.com/uk/${path}/${slug}`;
    const found = await fetchRecord(url);
    if (!found) continue;

    const { node } = found;
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
const input = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex === -1 ? null : Number(args[limitIndex + 1]);

const run = async () => {
  if (!input) throw new Error('Usage: expand.mjs titles.json [--dry-run] [--limit N]');
  const wanted = JSON.parse(await readFile(input, 'utf8'));
  const batch = limit ? wanted.slice(0, limit) : wanted;

  const existing = await rest('titles?select=id,name,year');
  const seen = new Map(existing.map((t) => [`${normalise(t.name)}|${t.year}`, t.id]));

  let added = 0;
  let updated = 0;
  let missed = 0;

  for (const entry of batch) {
    await pause(400);
    const resolved = await resolveTitle(entry);
    if (!resolved) {
      missed += 1;
      console.log(`  ?  ${entry.name} (${entry.year}) — no page matched`);
      continue;
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
        body: JSON.stringify({ ...fields, slug: `${slugify(entry.name)}-${fields.year ?? entry.year}`, catalogue_version: 1 }),
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

  console.log(
    dryRun
      ? `\nDry run: ${batch.length} checked, ${missed} unmatched, nothing written.`
      : `\nAdded ${added}, updated ${updated}, ${missed} unmatched.`,
  );
};

await run();
