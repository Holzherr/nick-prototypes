#!/usr/bin/env node
/**
 * Builds the browsing lists: the catalogue arranged by judgement rather than by query.
 *
 *   node tools/lists.mjs brief <out.json>     what is available to pick from, for a curator
 *   node tools/lists.mjs import <dir|file>    turn curated JSON into rows
 *   node tools/lists.mjs stats                what exists
 *
 * A curated file is an array of lists:
 *
 *   [{ "slug": "best-of-1999", "name": "The best of 1999", "kind": "year", "facet": "1999",
 *      "blurb": "…", "position": 30,
 *      "entries": [{ "slug": "the-matrix-1999", "note": "…" }] }]
 *
 * Entries are taken in the order given — position 1 is the top — and a title that is not in
 * the catalogue is dropped with a warning rather than failing the import, because a curator
 * working from a list of four thousand names will occasionally reach for one that is not
 * there and losing the other forty-nine entries over it helps nobody.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { query, queryJson, exec, quote, block } from './db.mjs';

const [command, arg] = process.argv.slice(2);

/** Everything a curator needs to choose from, small enough to read in one go. */
const brief = async (out) => {
  const rows = await queryJson(`
    select json_agg(json_build_object(
      'slug', slug, 'name', name, 'year', year, 'type', type::text,
      'genres', genres, 'tones', tones, 'themes', themes,
      'countries', countries, 'director', director
    ) order by year desc nulls last, name) as data
    from public.titles where catalogue_version > 0;`);
  await writeFile(out, JSON.stringify(rows, null, 1));
  console.log(`${rows.length} title(s) written to ${out}.`);
};

const readCurated = async (path) => {
  const stat = await readdir(path).catch(() => null);
  const files = stat ? stat.filter((f) => f.endsWith('.json')).map((f) => join(path, f)) : [path];
  const lists = [];
  for (const file of files) {
    try {
      lists.push(...JSON.parse(await readFile(file, 'utf8')));
    } catch (error) {
      console.log(`  ?  ${file} — ${error.message}`);
    }
  }
  return lists;
};

const importLists = async (path) => {
  const lists = await readCurated(path);
  const held = new Map((await queryJson(`select json_agg(json_build_object('slug', slug, 'id', id)) as data from public.titles;`)).map((t) => [t.slug, t.id]));

  const statements = [];
  let entries = 0;
  let missing = 0;
  for (const list of lists) {
    if (!list.slug || !list.name || !list.kind) {
      console.log(`  ?  a list is missing slug, name or kind — skipped`);
      continue;
    }
    const chosen = [];
    for (const entry of list.entries ?? []) {
      const id = held.get(entry.slug);
      if (!id) { missing += 1; continue; }
      if (chosen.some((c) => c.id === id)) continue;
      chosen.push({ id, note: entry.note ?? null });
    }
    if (chosen.length < 5) {
      console.log(`  ?  ${list.slug} — only ${chosen.length} of its entries are in the catalogue, skipped`);
      continue;
    }

    statements.push(
      `insert into public.title_lists (slug, name, blurb, kind, facet, position) values (` +
        `${quote(list.slug)}, ${quote(list.name)}, ${list.blurb ? quote(list.blurb) : 'null'}, ` +
        `${quote(list.kind)}, ${list.facet ? quote(list.facet) : 'null'}, ${Number(list.position ?? 100)}) ` +
        `on conflict (slug) do update set name = excluded.name, blurb = excluded.blurb, ` +
        `kind = excluded.kind, facet = excluded.facet, position = excluded.position, updated_at = now();`,
    );
    // Rebuilt rather than merged: a list is an order, and half an old order mixed into a new
    // one is not a list anybody wrote.
    statements.push(`delete from public.title_list_entries where list_id = (select id from public.title_lists where slug = ${quote(list.slug)});`);
    const values = chosen.map((c, i) => `((select id from public.title_lists where slug = ${quote(list.slug)}), ${quote(c.id)}::uuid, ${i + 1}, ${c.note ? quote(c.note) : 'null'})`);
    statements.push(`insert into public.title_list_entries (list_id, title_id, position, note) values ${values.join(', ')};`);
    entries += chosen.length;
    console.log(`  +  ${list.name} — ${chosen.length}`);
  }

  if (!statements.length) { console.log('Nothing to import.'); return; }
  await exec(block(statements));
  console.log(`\n${lists.length} list(s), ${entries} entr(ies). ${missing} named title(s) are not in the catalogue.`);
};

const stats = async () => {
  const rows = await query(`select l.kind, count(distinct l.id) as lists, count(e.title_id) as entries
    from public.title_lists l left join public.title_list_entries e on e.list_id = l.id
    group by l.kind order by l.kind;`);
  for (const row of rows) console.log(`  ${row.kind.padEnd(8)} ${String(row.lists).padStart(4)} list(s)  ${row.entries} entries`);
};

if (command === 'brief') await brief(arg ?? 'lists-brief.json');
else if (command === 'import') await importLists(arg);
else if (command === 'stats') await stats();
else console.log('Usage: lists.mjs brief <out.json> | import <dir|file> | stats');
