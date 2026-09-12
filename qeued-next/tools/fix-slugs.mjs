#!/usr/bin/env node
/**
 * Repairs slugs that lost their accented letters.
 *
 *   QEUED_DB_URL=… node tools/fix-slugs.mjs [--apply]
 *
 * Slugging replaced every non-alphanumeric character with a hyphen, which is right for
 * punctuation and wrong for letters: Amélie was filed at am-lie, Tár at t-r, Caché at cach.
 * expand folds accents now; this fixes what it already wrote.
 *
 * Only titles whose name contains a non-ASCII character are considered, and only where the
 * corrected slug is free — a slug is a public address, and this is not licence to rewrite
 * every one that no longer matches the rule that produced it.
 */
import { queryJson, exec, block, quote } from './db.mjs';

const apply = process.argv.includes('--apply');

const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const rows = await queryJson(
  `select json_agg(json_build_object('id', id, 'slug', slug, 'name', name, 'year', year)) as data
   from public.titles where catalogue_version > 0 and name !~ '^[[:ascii:]]*$'`,
);
const taken = new Set(
  await queryJson(`select json_agg(slug) as data from public.titles`),
);

const fixes = [];
for (const row of rows) {
  const wanted = `${slugify(row.name)}${row.year ? `-${row.year}` : ''}`;
  if (wanted === row.slug) continue;
  if (taken.has(wanted)) {
    console.log(`  !  ${row.slug} → ${wanted} is taken, left alone`);
    continue;
  }
  console.log(`  ✎  ${row.slug} → ${wanted}   (${row.name})`);
  fixes.push({ id: row.id, slug: wanted });
  taken.add(wanted);
}

if (!fixes.length) {
  console.log('\nEvery accented title is where it should be.');
  process.exit(0);
}
if (!apply) {
  console.log(`\n${fixes.length} slug(s) to fix — pass --apply.`);
  process.exit(0);
}

await exec(block(fixes.map((f) => `update public.titles set slug = ${quote(f.slug)} where id = ${quote(f.id)};`)));
console.log(`\nFixed ${fixes.length} slug(s).`);
