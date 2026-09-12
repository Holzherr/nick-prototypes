#!/usr/bin/env node
/**
 * Splits what still needs writing into chunk files, one per researcher.
 *
 *   QEUED_DB_URL=… node tools/todo.mjs synopsis --out work/ --chunk 60
 *   QEUED_DB_URL=… node tools/todo.mjs tags     --out work/ --chunk 100
 *
 * Two fields are written here rather than scraped — the synopsis, because Qeued's are
 * written for Qeued rather than copied, and the tone and theme tags, because no page
 * carries them. Both are done by research in batches, so this exists to cut the work up.
 *
 * Each chunk carries exactly what the brief for that field needs and nothing else: a
 * synopsis writer wants the cast and the cited page, a tagger wants the synopsis.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { queryJson } from './db.mjs';

const [field, ...args] = process.argv.slice(2);
const flagValue = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const shapes = {
  synopsis: {
    columns:
      "'slug', slug, 'name', name, 'year', year, 'type', type, 'genres', genres, " +
      "'director', director, 'cast', cast_members[1:5], 'rating', certification, " +
      "'runtime', runtime_minutes, 'src', image_source_url",
    where: 'synopsis is null',
    chunk: 60,
  },
  tags: {
    columns:
      "'slug', slug, 'name', name, 'year', year, 'type', type, 'genres', genres, 'synopsis', synopsis",
    where: 'cardinality(tones) = 0',
    chunk: 100,
  },
};

const shape = shapes[field];
if (!shape) {
  console.log('Usage: todo.mjs synopsis|tags [--out dir] [--chunk n] [--min-priority n]');
  process.exit(1);
}

const out = flagValue('out', 'todo');
const chunkSize = Number(flagValue('chunk', shape.chunk));
const minPriority = flagValue('min-priority', null);

// Priority lives on the candidate row, not the title, so the join is how "do the canonical
// ones first" is expressed once a title has landed.
const priorityFilter = minPriority
  ? ` and exists (select 1 from public.catalogue_candidates c where c.title_id = t.id and c.priority >= ${Number(minPriority)})`
  : '';

const rows = await queryJson(
  `select json_agg(json_build_object(${shape.columns}) order by name) as data
   from public.titles t
   where catalogue_version > 0 and ${shape.where}${priorityFilter}`,
);

if (!rows.length) {
  console.log(`Nothing needs a ${field}.`);
  process.exit(0);
}

await mkdir(out, { recursive: true });
const chunks = Math.ceil(rows.length / chunkSize);
for (let i = 0; i < chunks; i += 1) {
  const slice = rows.slice(i * chunkSize, (i + 1) * chunkSize);
  const path = join(out, `${field}-${String(i + 1).padStart(2, '0')}.json`);
  await writeFile(path, JSON.stringify(slice, null, 1));
  console.log(`${path}  ${slice.length}  ${slice[0].name} → ${slice[slice.length - 1].name}`);
}
console.log(`\n${rows.length} title(s) need a ${field}, in ${chunks} chunk(s) of up to ${chunkSize}.`);
