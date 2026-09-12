#!/usr/bin/env node
/**
 * Applies written catalogue entries to the titles already in the catalogue.
 *
 * The synopses in data/synopses-*.json are written for Qeued rather than copied, so there
 * is no page to cite for them; the facts alongside (episode length, seasons, countries,
 * languages) are only written where the writer was confident, and a null is left as a null.
 *
 * Nothing already in the database is overwritten. A field is filled only when the stored
 * value is missing, so a later hand-edit always wins over this file and re-running is safe.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/enrich.mjs [--file data/x.json] [--dry-run]
 *
 * Or, without a service key, emit the statements and apply them over the database
 * connection the Supabase CLI already has:
 *
 *   node tools/enrich.mjs --sql out.sql
 *   npx supabase db query -f out.sql --db-url "$QEUED_DB_URL"
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fileIndex = args.indexOf('--file');
const dirIndex = args.indexOf('--dir');
const applyDirect = args.includes('--apply');
const sqlIndex = args.indexOf('--sql');
const sqlPath = sqlIndex === -1 ? null : args[sqlIndex + 1];
if (!KEY && !sqlPath && !applyDirect) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or pass --sql <file>, or --apply)');
}

/**
 * The tag vocabularies, repeated here from migration 0018 so a bad tag is caught before it
 * reaches the database rather than after. An open vocabulary makes overlap meaningless —
 * "funny" and "comedic" would count as different tastes — so anything unrecognised is a
 * failure, not a warning.
 */
const TONES = new Set(
  'bleak tense melancholy warm funny playful romantic unsettling uplifting cool earnest absurd'.split(' '),
);
const THEMES = new Set(
  ('family marriage parenthood friendship coming-of-age grief class politics war crime justice revenge survival ' +
    'workplace ambition faith technology identity memory addiction art money power isolation espionage ' +
    'nature sport music history race').split(' '),
);

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

/** Files to apply: one named explicitly, or every written-entry file in data/. */
const sourceFiles =
  dirIndex !== -1
    ? readdirSync(args[dirIndex + 1])
        .filter((name) => name.endsWith('.json'))
        .map((name) => join(args[dirIndex + 1], name))
    : fileIndex !== -1
      ? [join(here, args[fileIndex + 1])]
      : readdirSync(join(here, 'data'))
          .filter((name) => /^(synopses|tags)-.*\.json$/.test(name))
          .map((name) => join(here, 'data', name));

// Prose and tags are written separately and merged per title, so each file can carry only
// the fields it is responsible for.
const records = new Map();
for (const file of sourceFiles) {
  for (const record of JSON.parse(readFileSync(file, 'utf8'))) {
    if (record?.slug) records.set(record.slug, { ...(records.get(record.slug) ?? {}), ...record });
  }
}
const badTags = [];
for (const [slug, record] of records) {
  for (const tag of record.tones ?? []) if (!TONES.has(tag)) badTags.push(`${slug}: tone "${tag}"`);
  for (const tag of record.themes ?? []) if (!THEMES.has(tag)) badTags.push(`${slug}: theme "${tag}"`);
}
if (badTags.length) {
  throw new Error(`Tags outside the vocabulary — fix the source file, not this list:\n  ${badTags.join('\n  ')}`);
}

console.log(`${records.size} written entr(ies) from ${sourceFiles.length} file(s).\n`);

/** Empty arrays count as missing; a stored value of any kind does not. */
const missing = (value) => value === null || value === undefined || (Array.isArray(value) && value.length === 0);

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;
const textArray = (values) => (values?.length ? `ARRAY[${values.map(quote).join(', ')}]::text[]` : 'NULL::text[]');
const text = (value) => (value ? quote(value) : 'NULL') + '::text';
const int = (value) => (value ? String(Number(value)) : 'NULL') + '::integer';

/**
 * One statement, not one per title: the CLI's query channel sends a file as a single
 * prepared statement, and a single UPDATE ... FROM (VALUES …) is the better shape anyway —
 * every title moves together or none does.
 *
 * The "only fill what is empty" rule lives in the SET list rather than in a decision made
 * here, so the check and the write happen in the same statement and a value written in
 * between cannot be clobbered.
 */
const singleStatement = (rows) => {
  const values = rows
    .map((r) =>
      `(${[quote(r.slug), text(r.synopsis), int(r.runtime_minutes), int(r.seasons), int(r.episodes),
        textArray(r.countries), textArray(r.languages), textArray(r.tones), textArray(r.themes)].join(', ')})`,
    )
    .join(',\n  ');

  const fill = (field) => `${field} = case when cardinality(t.${field}) = 0 then coalesce(v.${field}, t.${field}) else t.${field} end`;

  return [
    '-- Written entries applied to the catalogue. Generated by tools/enrich.mjs.',
    'update public.titles t set',
    '  synopsis = coalesce(t.synopsis, v.synopsis),',
    '  runtime_minutes = coalesce(t.runtime_minutes, v.runtime_minutes),',
    '  seasons = coalesce(t.seasons, v.seasons),',
    '  episodes = coalesce(t.episodes, v.episodes),',
    `  ${fill('countries')},`,
    `  ${fill('languages')},`,
    `  ${fill('tones')},`,
    `  ${fill('themes')},`,
    '  catalogue_version = t.catalogue_version + 1',
    'from (values',
    `  ${values}`,
    ') as v(slug, synopsis, runtime_minutes, seasons, episodes, countries, languages, tones, themes)',
    'where t.slug = v.slug and t.catalogue_version > 0;',
    '',
  ].join('\n');
};

if (sqlPath || applyDirect) {
  const rows = [...records.values()];
  const sql = singleStatement(rows);
  if (applyDirect) {
    const { exec } = await import('./db.mjs');
    console.log(`Applying ${rows.length} title(s): ${await exec(sql)}`);
  } else {
    writeFileSync(sqlPath, sql);
    console.log(`Wrote one statement covering ${rows.length} title(s) to ${sqlPath}.`);
    console.log(`Apply with: npx supabase db query -f ${sqlPath} --db-url "$QEUED_DB_URL"`);
  }
} else {

const titles = await rest(
  'titles?select=id,slug,name,type,synopsis,runtime_minutes,seasons,episodes,countries,languages,tones,themes,catalogue_version&catalogue_version=gt.0',
);
const bySlug = new Map(titles.map((row) => [row.slug, row]));

const counts = { synopsis: 0, runtime_minutes: 0, seasons: 0, episodes: 0, countries: 0, languages: 0, tones: 0, themes: 0 };
let updated = 0;
const unmatched = [];

for (const [slug, record] of records) {
  const row = bySlug.get(slug);
  if (!row) {
    unmatched.push(slug);
    continue;
  }

  const patch = {};
  for (const field of Object.keys(counts)) {
    const value = record[field];
    if (missing(value) || !missing(row[field])) continue;
    patch[field] = value;
    counts[field] += 1;
  }
  if (!Object.keys(patch).length) continue;

  if (dryRun) {
    console.log(`  ${row.name} ← ${Object.keys(patch).join(', ')}`);
  } else {
    patch.catalogue_version = (row.catalogue_version ?? 0) + 1;
    await rest(`titles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }
  updated += 1;
}

console.log(
  `${dryRun ? 'Would update' : 'Updated'} ${updated} title(s): ` +
    Object.entries(counts)
      .map(([field, n]) => `${field} ${n}`)
      .join(', '),
);
if (unmatched.length) console.log(`\nNo catalogue row for: ${unmatched.join(', ')}`);

}
