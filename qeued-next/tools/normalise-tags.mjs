#!/usr/bin/env node
/**
 * Brings a batch of tag research back inside the vocabulary.
 *
 *   node tools/normalise-tags.mjs <dir> [--retag retag.json]
 *
 * A closed vocabulary is only closed if something enforces it, and enrich.mjs refuses a batch
 * containing a tag it does not recognise. That is the right guard, but it makes one invented
 * word cost a whole batch, so this sits in front of it.
 *
 * Two things happen. A handful of near-misses are mapped, because they are the same claim in
 * different words — the commonest by far is `romance` used as a theme, which our own brief
 * says is a tone. Everything else unrecognised is dropped rather than guessed at. A title
 * left with no tone or fewer than two themes is written out for re-tagging, since a thin tag
 * set is worse than none: it reads as a confident claim that a title is about very little.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TONES = new Set(
  'bleak tense melancholy warm funny playful romantic unsettling uplifting cool earnest absurd'.split(' '),
);
const THEMES = new Set(
  ('family marriage parenthood friendship coming-of-age grief class politics war crime justice revenge survival ' +
    'workplace ambition faith technology identity memory addiction art money power isolation espionage ' +
    'nature sport music history race').split(' '),
);

/** Only where the intent is unambiguous and the vocabulary already has the word. */
const TONE_ALIASES = { dark: 'bleak', grieving: 'melancholy', angry: 'tense', uncomfortable: 'unsettling', epic: null };
const THEME_ALIASES = { environment: 'nature', environmentalism: 'nature', climate: 'nature', religion: 'faith', media: 'art' };
/** A theme the tagger meant as a tone. Moved rather than dropped. */
const THEME_TO_TONE = { romance: 'romantic', love: 'romantic', humor: 'funny', satire: 'absurd' };

const [dir, ...args] = process.argv.slice(2);
if (!dir) {
  console.log('Usage: normalise-tags.mjs <dir> [--retag retag.json]');
  process.exit(1);
}
const retagIndex = args.indexOf('--retag');
const retagPath = retagIndex === -1 ? null : args[retagIndex + 1];

let dropped = 0;
let moved = 0;
let mapped = 0;
const thin = [];

for (const file of readdirSync(dir).filter((name) => /^out-\d+\.json$/.test(name))) {
  const path = join(dir, file);
  let records;
  try {
    records = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    console.log(`  ✗  ${file} — not valid JSON`);
    continue;
  }

  for (const record of records) {
    const tones = new Set();
    const themes = new Set();

    for (const raw of record.tones ?? []) {
      const tag = TONES.has(raw) ? raw : TONE_ALIASES[raw];
      if (tag) {
        if (tag !== raw) mapped += 1;
        tones.add(tag);
      } else dropped += 1;
    }

    for (const raw of record.themes ?? []) {
      if (THEMES.has(raw)) {
        themes.add(raw);
        continue;
      }
      if (THEME_TO_TONE[raw]) {
        tones.add(THEME_TO_TONE[raw]);
        moved += 1;
        continue;
      }
      const tag = THEME_ALIASES[raw];
      if (tag) {
        themes.add(tag);
        mapped += 1;
      } else dropped += 1;
    }

    record.tones = [...tones].slice(0, 3);
    record.themes = [...themes].slice(0, 4);
  }

  // A thin record is removed from the batch rather than written: one theme reads as a
  // confident claim that a title is about very little, which is worse than no claim at all.
  const keep = records.filter((record) => {
    const ok = record.tones.length > 0 && record.themes.length >= 2;
    if (!ok) thin.push(record.slug);
    return ok;
  });
  writeFileSync(path, JSON.stringify(keep, null, 1));
}

console.log(`Mapped ${mapped}, moved ${moved} theme(s) to tones, dropped ${dropped} unrecognised.`);
if (thin.length) {
  console.log(`${thin.length} title(s) dropped from the batch as too thin.`);
  if (retagPath) {
    writeFileSync(retagPath, JSON.stringify(thin, null, 1));
    console.log(`Slugs written to ${retagPath}; clear their tags and run the pass again.`);
  }
}
