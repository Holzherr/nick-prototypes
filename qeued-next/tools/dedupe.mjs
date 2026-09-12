#!/usr/bin/env node
/**
 * Finds the same work catalogued twice and keeps one copy.
 *
 *   QEUED_DB_URL=… node tools/dedupe.mjs [--apply]
 *
 * A title's identity is its name and year, which holds until two sources disagree about the
 * year — a festival premiere against a release, a series dated from its commission rather
 * than its broadcast. Then the same film arrives twice: La Notte as 1960 and 1961, The
 * Brutalist as 2023 and 2024.
 *
 * The copy with more in it wins: a synopsis first, then tags, then offers, then whichever
 * was catalogued first. Nothing is deleted while a watch entry points at it — someone's list
 * matters more than a tidy catalogue, and the merge can wait for a human.
 */
import { queryJson, exec, block, quote } from './db.mjs';

const apply = process.argv.includes('--apply');

const pairs = await queryJson(`
  select json_agg(json_build_object(
    'a', json_build_object('id', a.id, 'slug', a.slug, 'year', a.year, 'synopsis', a.synopsis is not null,
                           'tags', cardinality(a.tones), 'catalogued', a.catalogued_at,
                           'offers', (select count(*) from public.title_availability v where v.title_id = a.id),
                           'entries', (select count(*) from public.watch_entries w where w.title_id = a.id)),
    'b', json_build_object('id', b.id, 'slug', b.slug, 'year', b.year, 'synopsis', b.synopsis is not null,
                           'tags', cardinality(b.tones), 'catalogued', b.catalogued_at,
                           'offers', (select count(*) from public.title_availability v where v.title_id = b.id),
                           'entries', (select count(*) from public.watch_entries w where w.title_id = b.id)),
    'name', a.name
  )) as data
  from public.titles a
  join public.titles b
    on lower(a.name) = lower(b.name) and a.type = b.type and a.id < b.id
   and abs(coalesce(a.year, 0) - coalesce(b.year, 0)) <= 2
  where a.catalogue_version > 0 and b.catalogue_version > 0`);

if (!pairs.length) {
  console.log('No duplicates.');
  process.exit(0);
}

/** More complete wins, and a tie goes to whichever was catalogued first. */
const richer = (one, other) =>
  Number(other.synopsis) - Number(one.synopsis) ||
  other.tags - one.tags ||
  other.offers - one.offers ||
  String(one.catalogued ?? '').localeCompare(String(other.catalogued ?? ''));

const drops = [];
for (const pair of pairs) {
  const [keep, drop] = [pair.a, pair.b].sort(richer);
  if (drop.entries > 0) {
    console.log(`  !  ${pair.name}: ${drop.slug} has ${drop.entries} watch entr(ies) — left alone`);
    continue;
  }
  console.log(`  ✂  ${pair.name}: keeping ${keep.slug}, dropping ${drop.slug}`);
  drops.push(drop);
}

if (!drops.length || !apply) {
  console.log(`\n${drops.length} duplicate(s) ${apply ? 'to drop' : 'found — pass --apply to remove them'}.`);
  process.exit(0);
}

// The candidate row that produced the dropped title has to point at the keeper instead.
// Setting it back to pending looks tidier and is wrong: the next wave re-fetches the same
// title under the same year and puts the duplicate straight back.
await exec(
  block([
    ...pairs
      .filter((pair) => drops.some((d) => d.id === pair.a.id || d.id === pair.b.id))
      .flatMap((pair) => {
        const [keep, drop] = [pair.a, pair.b].sort(richer);
        return drops.some((d) => d.id === drop.id)
          ? [`update public.catalogue_candidates set title_id = ${quote(keep.id)}, status = 'held' where title_id = ${quote(drop.id)};`]
          : [];
      }),
    ...drops.map((d) => `delete from public.titles where id = ${quote(d.id)};`),
  ]),
);
console.log(`\nRemoved ${drops.length} duplicate(s).`);
