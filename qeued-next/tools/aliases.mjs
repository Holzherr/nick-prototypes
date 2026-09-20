#!/usr/bin/env node
/**
 * Second names for candidates the resolver retired under the wrong one.
 *
 * A candidate is proposed under one name and the resolver only ever tries that one, so a
 * real film proposed under its original-language title is recorded as impossible when the
 * UK page is filed under the English one, or the other way round. `tools/data/aliases.json`
 * lists, by hand, the other names to try: one record per candidate, and every record with
 * the reason it exists, the same convention as `tools/data/corrections-*.json`.
 *
 *   node tools/aliases.mjs check [aliases.json]   validate the file; exits non-zero on a problem
 *   node tools/aliases.mjs apply <batch.json>     add an `aliases` array to each record of a batch
 *   node tools/aliases.mjs test                   unit tests on the row filter, no network, no database
 *
 * expand.mjs reads the shipped file itself, so a wave picks aliases up without `apply`;
 * `apply` is for a batch somebody wants to read before it runs. candidates.mjs uses the
 * same file to decide which retired rows `retry --aliased` puts back in the queue.
 */
import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const ALIASES_FILE = join(here, 'data', 'aliases.json');

/** Matches the identity candidates.mjs keys on: accents folded, case and punctuation ignored. */
export const normalise = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** The name, year and type as one string: the identity a candidate row and an alias record share. */
export const keyFor = ({ name, year, type }) => `${normalise(name)}|${year ?? 0}|${type}`;

/**
 * Everything wrong with a list of alias records, as one line each; empty when it is clean.
 *
 * Two records for the same name, year and type would leave the resolver trying one set of
 * names and silently ignoring the other, and a record with no `why` is a correction nobody
 * can check later — the same rule the corrections files follow.
 */
export const problemsIn = (records) => {
  const problems = [];
  if (!Array.isArray(records)) return ['the file is not a JSON array'];
  const seen = new Map();
  records.forEach((record, index) => {
    const at = `#${index + 1}${record?.name ? ` (${record.name})` : ''}`;
    if (typeof record?.name !== 'string' || !record.name.trim()) problems.push(`${at}: name must be a non-empty string`);
    if (record?.year !== null && !Number.isInteger(record?.year)) problems.push(`${at}: year must be an integer or null`);
    if (!['movie', 'series'].includes(record?.type)) problems.push(`${at}: type must be movie or series`);
    if (!Array.isArray(record?.aliases) || !record.aliases.length) problems.push(`${at}: aliases must be a non-empty array`);
    else if (record.aliases.some((alias) => typeof alias !== 'string' || !alias.trim())) problems.push(`${at}: every alias must be a non-empty string`);
    if (typeof record?.why !== 'string' || !record.why.trim()) problems.push(`${at}: why is missing`);
    const key = keyFor(record ?? {});
    if (seen.has(key)) problems.push(`${at}: repeats #${seen.get(key)} — same name, year and type`);
    else seen.set(key, index + 1);
  });
  return problems;
};

let shippedRecords = null;
/** The shipped file, read once. */
const shipped = () => {
  shippedRecords ??= JSON.parse(readFileSync(ALIASES_FILE, 'utf8'));
  return shippedRecords;
};

/** The other names to try for a candidate; empty for a candidate nobody has written one for. */
export const aliasesFor = (candidate, records = shipped()) => {
  const key = keyFor(candidate);
  return records.find((record) => keyFor(record) === key)?.aliases ?? [];
};

/** The identity of every candidate that has an alias. */
export const aliasedKeys = (records = shipped()) => new Set(records.map(keyFor));

/**
 * Only the rows with an alias. This is the filter behind `candidates.mjs retry --aliased`:
 * a retired row with no second name to try would fail again for the same reason, and
 * requeueing it spends a fetch on a known miss.
 */
export const aliasedRows = (rows, keys = aliasedKeys()) => rows.filter((row) => keys.has(keyFor(row)));

const check = async (file = ALIASES_FILE) => {
  let records;
  try {
    records = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    console.log(`${file}: ${error.message}`);
    process.exit(1);
  }
  const problems = problemsIn(records);
  for (const problem of problems) console.log(`  ✗  ${problem}`);
  if (problems.length) {
    console.log(`${file}: ${problems.length} problem(s).`);
    process.exit(1);
  }
  const aliases = records.reduce((sum, record) => sum + record.aliases.length, 0);
  console.log(`${file}: ${records.length} record(s), ${aliases} alias(es), no problems.`);
};

const apply = async (batchFile, out) => {
  if (!batchFile) throw new Error('Usage: aliases.mjs apply <batch.json> [out.json]');
  const batch = JSON.parse(await readFile(batchFile, 'utf8'));
  const records = batch.map((record) => ({ ...record, aliases: aliasesFor(record) }));
  const withAliases = records.filter((record) => record.aliases.length).length;
  const path = out ?? batchFile;
  await writeFile(path, JSON.stringify(records, null, 1));
  console.log(`${withAliases} of ${records.length} record(s) given aliases; written to ${path}.`);
};

/** The unit tests. Plain assertions rather than vitest, whose config only looks under src/. */
const test = async () => {
  const { strict: assert } = await import('node:assert');
  const fixtures = [
    { name: 'Vargtimmen', year: 1968, type: 'movie', aliases: ['Hour of the Wolf'], why: 'test' },
    { name: 'Dekalog', year: 1989, type: 'series', aliases: ['The Decalogue'], why: 'test' },
  ];
  const keys = aliasedKeys(fixtures);
  let passed = 0;
  const it = (name, fn) => {
    fn();
    passed += 1;
    console.log(`  ✓  ${name}`);
  };

  it('a failed row with no alias is not selected', () => {
    const rows = [
      { name: 'Vargtimmen', year: 1968, type: 'movie', status: 'failed' },
      { name: 'The Lantern Ledger', year: 1993, type: 'movie', status: 'failed' },
    ];
    assert.deepEqual(aliasedRows(rows, keys).map((row) => row.name), ['Vargtimmen']);
  });
  it('a row is matched on name, year and type together', () => {
    const rows = [
      { name: 'Vargtimmen', year: 1969, type: 'movie' },
      { name: 'Vargtimmen', year: 1968, type: 'series' },
      { name: 'Dekalog', year: 1989, type: 'series' },
    ];
    assert.deepEqual(aliasedRows(rows, keys).map((row) => row.name), ['Dekalog']);
  });
  it('matching folds case, accents and punctuation the way the queue does', () => {
    assert.deepEqual(aliasedRows([{ name: 'VARGTIMMEN!', year: 1968, type: 'movie' }], keys).length, 1);
    assert.deepEqual(aliasesFor({ name: 'dekalog', year: 1989, type: 'series' }, fixtures), ['The Decalogue']);
  });
  it('a candidate nobody wrote an alias for gets an empty list', () => {
    assert.deepEqual(aliasesFor({ name: 'The Lantern Ledger', year: 1993, type: 'movie' }, fixtures), []);
    assert.deepEqual(aliasedRows([], keys), []);
  });
  it('check rejects a repeated name+year+type and a missing why', () => {
    const bad = JSON.parse(readFileSync(join(here, 'data', 'aliases-bad.fixture.json'), 'utf8'));
    const problems = problemsIn(bad);
    assert.equal(problems.filter((p) => p.includes('repeats')).length, 1);
    assert.equal(problems.filter((p) => p.includes('why is missing')).length, 1);
  });
  it('check accepts the shipped file', () => {
    assert.deepEqual(problemsIn(shipped()), []);
    assert.deepEqual(aliasesFor({ name: 'Vargtimmen', year: 1968, type: 'movie' }), ['Hour of the Wolf']);
    assert.deepEqual(aliasesFor({ name: 'Dekalog', year: 1989, type: 'series' }), ['The Decalogue']);
  });
  console.log(`${passed} test(s) passed.`);
};

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [command, ...args] = process.argv.slice(2);
  const commands = {
    check: () => check(args[0]),
    apply: () => apply(args[0], args[1]),
    test,
  };
  if (!commands[command]) {
    console.log('Usage: aliases.mjs check [file] | apply <batch.json> [out.json] | test');
    process.exit(1);
  }
  await commands[command]();
}
