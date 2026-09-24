#!/usr/bin/env node
/**
 * The queue of titles the catalogue should hold but does not yet.
 *
 *   node tools/candidates.mjs import <file.json…>   add proposals, skipping what is held
 *   node tools/candidates.mjs next <n> [out.json]   the n most-wanted pending titles
 *   node tools/candidates.mjs reconcile             mark as held anything now in the catalogue
 *   node tools/candidates.mjs retry --aliased       requeue retired ones that now have an alias
 *   node tools/candidates.mjs retry --all           requeue every retired one after a resolver fix
 *   node tools/candidates.mjs fail <file.json>      record names that resolved to no page
 *   node tools/candidates.mjs failed [out.json]     every retired one, with its last error
 *   node tools/candidates.mjs stats                 what is left, by priority
 *
 * Proposals arrive from several slices at once and overlap heavily, so import is an upsert
 * on name, year and type: the second proposal of the same film raises its priority to the
 * higher of the two rather than adding a row.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { query, queryJson, exec, quote, literal, block } from './db.mjs';
import { aliasedRows } from './aliases.mjs';

const [command, ...args] = process.argv.slice(2);

/** Matches the identity used in the unique index, and the one expand.mjs matches titles on. */
const normalise = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Reads a proposal file, recovering from the one thing that goes wrong with a long
 * model-written array: a single stray character somewhere in the middle. Losing 160 real
 * titles to one bad comma is not worth it, so a file that will not parse is read object by
 * object instead, and only the broken ones are dropped.
 */
const readProposals = async (file) => {
  const text = await readFile(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch {
    const salvaged = [];
    for (const match of text.matchAll(/\{[^{}]*\}/g)) {
      try {
        salvaged.push(JSON.parse(match[0]));
      } catch {
        // one broken object, not a broken file
      }
    }
    console.log(`  ~  ${file} — not valid JSON; salvaged ${salvaged.length} entries`);
    return salvaged;
  }
};

/** A year outside this range is a typo or an invention, not a release date. */
const plausibleYear = (year) => year === null || year === undefined || (Number.isInteger(year) && year >= 1890 && year <= 2027);

const importCandidates = async (files) => {
  const proposed = new Map();
  let malformed = 0;
  for (const file of files) {
    let records;
    try {
      records = await readProposals(file);
    } catch {
      console.log(`  ✗  ${file} — unreadable, skipped`);
      continue;
    }
    for (const record of records) {
      const name = typeof record?.name === 'string' ? record.name.trim() : '';
      if (!name || name.length > 200 || !['movie', 'series'].includes(record.type) || !plausibleYear(record.year)) {
        malformed += 1;
        continue;
      }
      const key = `${normalise(record.name)}|${record.year ?? 0}|${record.type}`;
      const existing = proposed.get(key);
      // The same title from two slices keeps the higher priority and the first explanation.
      proposed.set(key, {
        ...record,
        priority: Math.max(Number(record.priority) || 3, existing?.priority ?? 0),
      });
    }
  }

  const held = await queryJson(
    "select json_agg(json_build_object('name', name, 'year', year, 'type', type)) as data from public.titles where catalogue_version > 0",
  );
  const heldKeys = new Set(held.map((t) => `${normalise(t.name)}|${t.year ?? 0}|${t.type}`));
  const fresh = [...proposed.values()].filter(
    (r) => !heldKeys.has(`${normalise(r.name)}|${r.year ?? 0}|${r.type}`),
  );

  console.log(
    `${proposed.size} distinct proposal(s) from ${files.length} file(s); ` +
      `${proposed.size - fresh.length} already held${malformed ? `, ${malformed} malformed` : ''}.`,
  );
  if (!fresh.length) return;

  const values = fresh
    .map((r) =>
      `(${[quote(r.name), literal(r.year ?? null), quote(r.type), Number(r.priority) || 3, literal(r.bucket ?? null), literal((r.why ?? r.note ?? '').slice(0, 300) || null), literal(r.url ?? null)].join(', ')})`,
    )
    .join(',\n    ');

  const written = await exec(`insert into public.catalogue_candidates (name, year, type, priority, bucket, note, source_url)
  values
    ${values}
  on conflict (lower(name), coalesce(year, 0), type) do update set
    priority = greatest(public.catalogue_candidates.priority, excluded.priority),
    bucket = coalesce(public.catalogue_candidates.bucket, excluded.bucket),
    note = coalesce(public.catalogue_candidates.note, excluded.note),
    source_url = coalesce(excluded.source_url, public.catalogue_candidates.source_url),
    updated_at = now();`);
  console.log(`Queued ${fresh.length}: ${written}`);
};

/**
 * Untried titles before retries: a title that missed once keeps its place in the queue, and
 * without this it comes back in the very next wave — spending a fetch on the same failure
 * before anything new has been tried.
 */
/**
 * Takes the next batch and claims it, so several fetch loops can work the queue at once.
 *
 * Without the claim a second loop asking the same question a minute later gets the same two
 * hundred rows, because nothing is marked until the wave finishes writing — two loops did
 * twice the work and not twice the throughput. The claim is a lease rather than a lock: a
 * loop that dies mid-wave frees its batch by itself once the lease expires, so nothing has
 * to notice it died.
 */
const next = async (count, out) => {
  const rows = await queryJson(
    `select coalesce(json_agg(json_build_object('name', name, 'year', year, 'type', type, 'url', source_url)), '[]'::json) as data
     from public.claim_candidates(${Number(count)})`,
  );
  const path = out ?? 'candidates-batch.json';
  await writeFile(path, JSON.stringify(rows, null, 1));
  console.log(`${rows.length} candidate(s) written to ${path}.`);
};

/**
 * Marks as held every candidate whose name and year are now in the catalogue.
 *
 * Run after a fetch: it is cheaper and more reliable than having the fetch report back,
 * because the catalogue is the only thing that actually knows what landed.
 */
const reconcile = async () => {
  const updated = await exec(`update public.catalogue_candidates c
    set status = 'held', title_id = t.id, claimed_at = null, updated_at = now()
    from public.titles t
    where t.catalogue_version > 0
      and lower(t.name) = lower(c.name)
      and coalesce(t.year, 0) = coalesce(c.year, 0)
      and t.type::text = c.type
      and c.status <> 'held';`);

  // The resolver may have replaced a wrong candidate year with the page's own date — that is
  // the point of it, since a model-written list gets Titane's year wrong and its name right.
  // The candidate then never matches on year and is refetched every wave for ever. Falling
  // back to name and type alone is only safe where the catalogue holds exactly one title of
  // that name and type; where it holds two, the year is the only thing separating a remake
  // from its original and a loose match would file the candidate against the wrong one.
  const byName = await exec(`update public.catalogue_candidates c
    set status = 'held', title_id = t.id, claimed_at = null, updated_at = now()
    from public.titles t
    where t.catalogue_version > 0
      and lower(t.name) = lower(c.name)
      and t.type::text = c.type
      and c.status <> 'held'
      and (select count(*) from public.titles u
           where lower(u.name) = lower(c.name) and u.type::text = c.type) = 1;`);

  console.log(`Reconciled: ${updated}${byName.endsWith(' 0') ? '' : `, and ${byName} on name alone`}`);
};

/** Records the ones a fetch could not resolve, so the next list does not re-propose them. */
const fail = async (file) => {
  const records = JSON.parse(await readFile(file, 'utf8'));
  if (!records.length) return console.log('Nothing to mark.');
  const statements = records.map(
    (r) =>
      `update public.catalogue_candidates set attempts = attempts + 1, ` +
      `last_error = ${quote(String(r.error ?? 'no page matched').slice(0, 300))}, ` +
      `status = case when attempts >= 1 then 'failed' else status end, updated_at = now() ` +
      `where lower(name) = lower(${quote(r.name)}) and coalesce(year, 0) = ${Number(r.year) || 0};`,
  );
  await exec(block(statements));
  console.log(`Recorded ${records.length} unresolved candidate(s). A second failure retires one.`);
};

const FAILED_ROWS = `select coalesce(json_agg(json_build_object('name', name, 'year', year, 'type', type, 'attempts', attempts, 'last_error', last_error) order by priority desc, name), '[]'::json) as data
     from public.catalogue_candidates where status = 'failed'`;

/**
 * Puts retired candidates back in the queue.
 *
 * A candidate is retired after two failures, which is right when the resolver is a constant.
 * It is not when the resolver improves: every title that failed for a reason since fixed is
 * sitting there marked impossible. `--all` requeues every one, and is for a change to how
 * titles are resolved; without a flag the command only says how many that would be, because
 * a full wave over hundreds of known misses is an easy thing to start by accident.
 *
 * `--aliased` requeues only the rows that have gained a second name in tools/data/aliases.json:
 * a retired row with no alias would fail again for the same reason, and requeueing it spends
 * a fetch on a known miss. This is the one to run after writing aliases.
 */
const retry = async (flags) => {
  const failed = await queryJson(FAILED_ROWS);
  if (flags.includes('--aliased')) {
    const chosen = aliasedRows(failed);
    if (chosen.length) {
      await exec(block(chosen.map(
        (r) =>
          `update public.catalogue_candidates set status = 'pending', attempts = 0, last_error = null, updated_at = now() ` +
          `where status = 'failed' and lower(name) = lower(${quote(r.name)}) and coalesce(year, 0) = ${Number(r.year) || 0} and type = ${quote(r.type)};`,
      )));
    }
    console.log(`Requeued ${chosen.length} retired candidate(s) with an alias; left ${failed.length - chosen.length} alone.`);
    return;
  }
  if (!flags.includes('--all')) {
    console.log(`${failed.length} retired candidate(s) would be requeued. Nothing written: pass --all to requeue every one, or --aliased for only those with an alias.`);
    process.exit(1);
  }
  const reset = await exec(
    `update public.catalogue_candidates set status = 'pending', attempts = 0, last_error = null, updated_at = now() where status = 'failed';`,
  );
  console.log(`Requeued: ${reset}`);
};

/**
 * Writes out every retired candidate with why it was retired, so the next pass writing
 * aliases works from the real list rather than from a sample of it.
 */
const failed = async (out) => {
  const rows = await queryJson(FAILED_ROWS);
  const path = out ?? 'candidates-failed.json';
  await writeFile(path, JSON.stringify(rows, null, 1));
  console.log(`${rows.length} retired candidate(s) written to ${path}.`);
};

const stats = async () => {
  const rows = await query(
    `select status, priority, count(*)::int as titles from public.catalogue_candidates group by 1, 2 order by 1, 2 desc`,
  );
  const held = await query(`select count(*)::int as titles from public.titles where catalogue_version > 0`);
  console.log(`Catalogue: ${held[0]?.titles ?? 0} titles held.\n`);
  for (const row of rows) console.log(`  ${row.status.padEnd(8)} priority ${row.priority}  ${row.titles}`);
  const pending = rows.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.titles, 0);
  console.log(`\n${pending} still wanted.`);
};

const commands = {
  import: () => importCandidates(args),
  next: () => next(args[0] ?? 100, args[1]),
  reconcile,
  retry: () => retry(args),
  fail: () => fail(args[0]),
  failed: () => failed(args[0]),
  stats,
};

if (!commands[command]) {
  console.log('Usage: candidates.mjs import <files…> | next <n> [out] | reconcile | retry --aliased|--all | fail <file> | failed [out] | stats');
  process.exit(1);
}
await commands[command]();
