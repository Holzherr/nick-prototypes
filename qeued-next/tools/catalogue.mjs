#!/usr/bin/env node
/**
 * Catalogue pipeline: fill Qeued's own title records from researched sources.
 *
 * Bulk research happens outside the app (an assistant with search tools drives this
 * script); the app only researches on demand, when a user asks for a title we don't hold.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/catalogue.mjs todo [--limit 20] [--json]
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/catalogue.mjs write records.json [--dry-run]
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/catalogue.mjs stats
 *
 * `todo` lists titles whose record is missing or stale, newest queue entries first, and
 * says which fields are absent. `write` upserts researched records: title facts, the
 * source citation behind each field, and current streaming availability. Idempotent —
 * re-running with the same records rewrites the same rows.
 *
 * Record shape (see RECORD_FIELDS for the full list of writable columns):
 *   {
 *     "id": "<uuid, omit to match on name+year>", "name": "Devs", "year": 2020,
 *     "type": "series", "synopsis": "<written for Qeued, never copied>",
 *     "genres": ["Drama"], "certification": "15", "runtime_minutes": 50,
 *     "seasons": 1, "episodes": 8, "cast_members": ["Sonoya Mizuno"],
 *     "image_url": "…", "image_license": "CC-BY-SA-4.0", "image_attribution": "…",
 *     "sources": [{ "field": "synopsis", "url": "…", "name": "Wikipedia" }],
 *     "availability": [{ "provider": "Disney+", "offer_type": "subscription", "url": "…" }]
 *   }
 */
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

/** Columns the pipeline is allowed to write. Anything else in a record is rejected. */
const RECORD_FIELDS = [
  'name', 'type', 'year', 'slug', 'synopsis', 'tagline', 'description', 'genres', 'certification',
  'countries', 'languages', 'runtime_minutes', 'seasons', 'episodes', 'production_status',
  'director', 'cast_members', 'imdb_rating', 'rt_rating', 'imdb_url', 'rt_url',
  'image_url', 'image_license', 'image_attribution', 'image_source_url',
];
/** A record is only complete once these are present — they drive `todo`. */
const REQUIRED = ['synopsis', 'genres', 'certification', 'runtime_minutes', 'image_url'];
const OFFER_TYPES = ['subscription', 'rent', 'buy', 'free', 'cinema'];

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const slugify = (name, year) =>
  `${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}${year ? `-${year}` : ''}`;

/** Titles in someone's queue come first: those are the ones a person will actually open. */
const todo = async ({ limit, json }) => {
  const titles = await rest(`titles?select=id,name,year,type,slug,${REQUIRED.join(',')},catalogue_version&order=created_at.asc`);
  const queued = new Set(
    (await rest('watch_entries?select=title_id')).map((e) => e.title_id),
  );
  const pending = titles
    .map((t) => ({ ...t, missing: REQUIRED.filter((f) => t[f] === null || t[f] === undefined || (Array.isArray(t[f]) && !t[f].length)) }))
    .filter((t) => t.missing.length || t.catalogue_version === 0)
    .sort((a, b) => Number(queued.has(b.id)) - Number(queued.has(a.id)));
  const out = limit ? pending.slice(0, limit) : pending;
  if (json) return console.log(JSON.stringify(out.map(({ id, name, year, type, missing }) => ({ id, name, year, type, missing })), null, 2));
  console.log(`${pending.length} titles need work (${out.length} shown)\n`);
  for (const t of out) {
    console.log(`${queued.has(t.id) ? '*' : ' '} ${t.name} (${t.year ?? '?'}) [${t.type}]  ${t.id}`);
    console.log(`    missing: ${t.missing.join(', ') || 'nothing — version 0, needs a rewrite'}`);
  }
  if (!json && out.length) console.log('\n* = someone has this in their queue');
};

const resolveId = async (record) => {
  if (record.id) return record.id;
  const q = `titles?select=id&name=eq.${encodeURIComponent(record.name)}` + (record.year ? `&year=eq.${record.year}` : '');
  const [found] = await rest(q);
  return found?.id ?? null;
};

const write = async (path, { dryRun }) => {
  const records = JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile(path, 'utf8')));
  if (!Array.isArray(records)) throw new Error('Expected a JSON array of records');
  let written = 0, created = 0, offers = 0, citations = 0;

  for (const record of records) {
    const unknown = Object.keys(record).filter((k) => !RECORD_FIELDS.includes(k) && !['id', 'sources', 'availability'].includes(k));
    if (unknown.length) throw new Error(`${record.name}: unknown field(s) ${unknown.join(', ')}`);
    if (!record.name && !record.id) throw new Error('A record needs a name or an id');
    for (const offer of record.availability ?? []) {
      if (!OFFER_TYPES.includes(offer.offer_type)) throw new Error(`${record.name}: bad offer_type ${offer.offer_type}`);
      if (!offer.provider) throw new Error(`${record.name}: an availability entry has no provider`);
    }
    if (record.image_url && !record.image_license) throw new Error(`${record.name}: image_url needs image_license`);

    const id = await resolveId(record);
    const fields = Object.fromEntries(RECORD_FIELDS.filter((f) => record[f] !== undefined).map((f) => [f, record[f]]));
    if (record.name) fields.slug ??= slugify(record.name, record.year);
    fields.catalogued_at = new Date().toISOString();

    if (dryRun) {
      console.log(`${id ? 'update' : 'create'} ${record.name} — ${Object.keys(fields).length} fields, ` +
        `${(record.sources ?? []).length} citations, ${(record.availability ?? []).length} offers`);
      continue;
    }

    let titleId = id;
    if (titleId) {
      const [current] = await rest(`titles?select=catalogue_version&id=eq.${titleId}`);
      await rest(`titles?id=eq.${titleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...fields, catalogue_version: (current?.catalogue_version ?? 0) + 1 }),
      });
    } else {
      const [row] = await rest('titles', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ ...fields, catalogue_version: 1 }),
      });
      titleId = row.id;
      created += 1;
    }
    written += 1;

    for (const source of record.sources ?? []) {
      await rest('title_sources?on_conflict=title_id,field,source_url', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ title_id: titleId, field: source.field, source_url: source.url, source_name: source.name ?? null }),
      });
      citations += 1;
    }

    // Availability is a full replacement per region: a provider that dropped the title
    // must disappear, not linger.
    const regions = [...new Set((record.availability ?? []).map((o) => o.region ?? 'GB'))];
    for (const region of regions) {
      await rest(`title_availability?title_id=eq.${titleId}&region=eq.${region}`, { method: 'DELETE' });
    }
    for (const offer of record.availability ?? []) {
      await rest('title_availability', {
        method: 'POST',
        body: JSON.stringify({
          title_id: titleId, region: offer.region ?? 'GB', provider: offer.provider,
          offer_type: offer.offer_type, url: offer.url ?? null, note: offer.note ?? null,
        }),
      });
      offers += 1;
    }
  }
  console.log(dryRun
    ? `\nDry run: ${records.length} records checked, nothing written.`
    : `Wrote ${written} titles (${created} new), ${citations} citations, ${offers} offers.`);
};

const stats = async () => {
  const count = async (q) => {
    const res = await fetch(`${URL_BASE}/rest/v1/${q}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact', Range: '0-0' },
    });
    return Number(res.headers.get('content-range')?.split('/')[1] ?? 0);
  };
  const total = await count('titles?select=id');
  const done = await count('titles?select=id&catalogue_version=gt.0');
  const rows = await Promise.all(REQUIRED.map(async (f) => [f, total - (await count(`titles?select=id&${f}=is.null`))]));
  console.log(`${done}/${total} titles catalogued\n`);
  for (const [field, filled] of rows) console.log(`  ${field.padEnd(18)} ${filled}/${total}`);
  console.log(`\n  availability rows   ${await count('title_availability?select=id')}`);
  console.log(`  citations           ${await count('title_sources?select=id')}`);
};

const [command, ...rest_args] = process.argv.slice(2);
const flag = (name) => rest_args.includes(`--${name}`);
const value = (name) => { const i = rest_args.indexOf(`--${name}`); return i === -1 ? null : Number(rest_args[i + 1]); };

const commands = {
  todo: () => todo({ limit: value('limit'), json: flag('json') }),
  write: () => write(rest_args.find((a) => !a.startsWith('--')), { dryRun: flag('dry-run') }),
  stats,
};
if (!commands[command]) {
  console.error('Usage: catalogue.mjs todo [--limit N] [--json] | write <file.json> [--dry-run] | stats');
  process.exit(1);
}
await commands[command]();
