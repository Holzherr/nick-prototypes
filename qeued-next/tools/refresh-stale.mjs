#!/usr/bin/env node
/**
 * Revisits the UK offers that have passed their 30-day expiry, with no service key.
 *
 * Chains the three no-key steps availability.mjs already has — gather the cited pages, emit
 * the SQL, apply it over the connection the Supabase CLI holds — into the one command a
 * weekly schedule can run:
 *
 *   QEUED_DB_URL=… node tools/refresh-stale.mjs [--dry-run] [--stale-list <file>]
 *
 * --stale-list takes the titles from a file in the shape `availability.mjs --only` reads
 * instead of asking the database. --dry-run leaves offers.sql on disk and applies nothing,
 * so with both flags the run opens no database connection at all.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, query, queryJson, quote } from './db.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/** The predicate `--stale` applies: nothing on file, or the newest row past its expiry. */
export const isStale = (rows, now = new Date()) => !rows.some((row) => new Date(row.expires_at) >= now);
export const staleTitles = (titles, now = new Date()) => titles.filter((t) => isStale(t.title_availability ?? [], now));

/** Every published title, the page availability.mjs would read for it, and its rows' expiries. */
const TITLES_SQL = `select json_agg(t order by t.name) as data from (
  select t.slug, t.name,
    coalesce(case when t.image_source_url like '%justwatch%' then t.image_source_url end,
      (select s.source_url from public.title_sources s where s.title_id = t.id and s.source_url like '%justwatch%' limit 1)) as url,
    coalesce((select json_agg(json_build_object('expires_at', a.expires_at)) from public.title_availability a where a.title_id = t.id), '[]'::json) as title_availability
  from public.titles t where t.catalogue_version > 0) t`;

/** One row per offer row this run touched, told apart by which timestamp the sweep moved. */
const countsSql = (since) => `select
  count(*) filter (where first_seen_at >= ${quote(since)}) as inserted,
  count(*) filter (where last_seen_at >= ${quote(since)} and first_seen_at < ${quote(since)}) as refreshed,
  count(*) filter (where removed_at >= ${quote(since)}) as removed
  from public.title_availability`;

const availability = (...args) =>
  new Promise((done, fail) => {
    spawn(process.execPath, [join(here, 'availability.mjs'), ...args], { stdio: 'inherit' }).on('exit', (code) =>
      code === 0 ? done() : fail(new Error(`availability.mjs ${args[0]} exited ${code}`)),
    );
  });

/** The real steps. `gather` reads JustWatch, `sql` writes offers.sql, `apply` writes the rows. */
const steps = {
  gather: async (stale) => {
    const dir = mkdtempSync(join(tmpdir(), 'qeued-stale-'));
    const only = join(dir, 'stale.json');
    const path = join(dir, 'offers.json');
    writeFileSync(only, JSON.stringify(stale));
    await availability('--gather', path, '--only', only);
    return { path, offers: JSON.parse(readFileSync(path, 'utf8')).length };
  },
  sql: async (gatheredPath) => {
    await availability('--sql', 'offers.sql', '--from', gatheredPath);
    return resolve('offers.sql');
  },
  apply: async (sqlPath) => {
    const [{ started_at }] = await query('select now() as started_at');
    await exec(readFileSync(sqlPath, 'utf8'));
    return (await query(countsSql(started_at)))[0];
  },
};

/**
 * The steps in order. They are passed in so a test can prove an empty list returns before
 * the first page is read; `apply` is swapped for a dry run.
 */
export const refresh = async (stale, { gather, sql, apply }) => {
  if (!stale.length) {
    console.log('0 title(s) stale; nothing revisited.');
    return { revisited: 0, offers: 0 };
  }
  const gathered = await gather(stale);
  if (!gathered.offers) {
    console.log(`Revisited ${stale.length} title(s); no page listed an offer, so nothing is written.`);
    return { revisited: stale.length, offers: 0 };
  }
  const counts = await apply(await sql(gathered.path));
  console.log(
    counts
      ? `Revisited ${stale.length} title(s), ${gathered.offers} offer(s): ${counts.inserted} inserted, ${counts.refreshed} moved forward, ${counts.removed} stamped removed.`
      : `Dry run: revisited ${stale.length} title(s), ${gathered.offers} offer(s); nothing applied.`,
  );
  return { revisited: stale.length, offers: gathered.offers, ...counts };
};

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const listPath = args.includes('--stale-list') ? args[args.indexOf('--stale-list') + 1] : null;
  const stale = listPath ? JSON.parse(readFileSync(listPath, 'utf8')) : staleTitles(await queryJson(TITLES_SQL));
  const dryApply = async (sqlPath) => console.log(`Left ${sqlPath} on disk.`);
  await refresh(stale, { ...steps, apply: args.includes('--dry-run') ? dryApply : steps.apply });
}
