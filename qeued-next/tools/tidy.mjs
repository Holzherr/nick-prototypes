#!/usr/bin/env node
/**
 * Fixes what the scrape got wrong, in the two ways it gets things wrong.
 *
 * The first is mechanical: cast lists come back with the same actor two or three times,
 * because the page lists them once per credited role. Deduplication is safe to run over
 * everything and needs no judgement.
 *
 * The second is not mechanical, so it is not automated. data/corrections-*.json holds
 * per-title overwrites with a written reason each — a runtime that is wrong rather than a
 * different cut, a page that resolved to the wrong film of the same name. These overwrite
 * stored values, which is the whole point, so each one is listed explicitly rather than
 * inferred.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/tidy.mjs [--dry-run]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const here = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes('--dry-run');

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const titles = await rest('titles?select=id,slug,name,genres,cast_members,runtime_minutes,director&catalogue_version=gt.0');
const bySlug = new Map(titles.map((row) => [row.slug, row]));

/**
 * The same genre arrived under two spellings from different pages, which splits a viewer's
 * taste in half for no reason: 91 titles are "Science-Fiction" and 7 are "Sci-Fi". Only
 * exact duplicates are merged here — a rare genre is not the same thing as a wrong one.
 */
const GENRE_ALIASES = { 'sci-fi': 'Science-Fiction', 'science fiction': 'Science-Fiction', 'music &amp; musical': 'Music & Musical' };
const canonicalGenre = (genre) => GENRE_ALIASES[String(genre).trim().toLowerCase()] ?? String(genre).replace(/&amp;/g, '&').trim();

// Order-preserving: the first credited name is the lead, and that order is worth keeping.
const deduped = (list) => {
  const seen = new Set();
  return (list ?? []).filter((name) => {
    const key = String(name).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

let dupesFixed = 0;
for (const row of titles) {
  const cast = deduped(row.cast_members);
  const genres = deduped((row.genres ?? []).map(canonicalGenre));
  const unchanged =
    cast.join('|') === (row.cast_members ?? []).join('|') && genres.join('|') === (row.genres ?? []).join('|');
  if (unchanged) continue;
  if (dryRun) console.log(`  ${row.name}: cast ${(row.cast_members ?? []).length} → ${cast.length}, genres ${genres.join('/')}`);
  else await rest(`titles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ cast_members: cast, genres }) });
  dupesFixed += 1;
}

/**
 * A series page lists a director per episode, and the scrape joined the lot into one
 * field, so "directed by" on a long-running series reads as a cast list. There is no
 * creator credit in the source to put there instead, so the honest value is none.
 */
let directorsCleared = 0;
for (const row of titles) {
  const names = (row.director ?? '').split(',').map((n) => n.trim()).filter(Boolean);
  if (names.length <= 2) continue;
  if (dryRun) console.log(`  ${row.name}: clearing ${names.length} directors`);
  else await rest(`titles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ director: null }) });
  directorsCleared += 1;
}

const corrections = readdirSync(join(here, 'data'))
  .filter((name) => /^corrections-.*\.json$/.test(name))
  .flatMap((name) => JSON.parse(readFileSync(join(here, 'data', name), 'utf8')));

let corrected = 0;
for (const fix of corrections) {
  const row = bySlug.get(fix.slug);
  if (!row) {
    console.log(`  ?  no catalogue row for ${fix.slug}`);
    continue;
  }
  const patch = { ...(fix.fields ?? {}) };
  if (fix.remove_genres?.length) {
    // Some genre labels arrived HTML-escaped, so "Music & Musical" and "Music &amp; Musical"
    // have to compare equal or the removal silently does nothing.
    const normal = (g) => String(g).replace(/&amp;/g, '&').trim().toLowerCase();
    const drop = new Set(fix.remove_genres.map(normal));
    patch.genres = deduped(row.genres).filter((g) => !drop.has(normal(g)));
  }
  if (!Object.keys(patch).length) continue;

  console.log(`  ✎  ${row.name} — ${fix.reason}`);
  if (!dryRun) await rest(`titles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  corrected += 1;
}

console.log(
  `\n${dryRun ? 'Would tidy' : 'Tidied'} ${dupesFixed} title(s), cleared ${directorsCleared} ` +
    `episode-director dump(s), and applied ${corrected} listed correction(s).`,
);
