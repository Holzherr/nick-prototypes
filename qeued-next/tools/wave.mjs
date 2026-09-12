#!/usr/bin/env node
/**
 * Fetches the next batch of wanted titles, end to end.
 *
 *   QEUED_DB_URL=… node tools/wave.mjs [--size 150] [--keep]
 *
 * Takes the most-wanted pending candidates, reads each one's page, writes the facts and the
 * UK offers, then reconciles the queue: what landed becomes `held`, what could not be
 * resolved gets an attempt recorded and is retired on the second failure.
 *
 * The whole thing is resumable by construction. Every step writes its output to a file, and
 * the queue is the only state that matters — interrupt a wave halfway and the next run picks
 * up the candidates that are still pending, having already skipped the ones that landed.
 */
import { execFile } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from './db.mjs';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const flagValue = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};
const size = Number(flagValue('size') ?? 150);
const keep = args.includes('--keep');

const work = join(tmpdir(), `qeued-wave-${Date.now()}`);
const file = (name) => join(work, name);

/** Runs one of the sibling tools and streams its output, so a long wave is watchable. */
const tool = async (script, toolArgs) => {
  const child = execFile('node', [join(here, script), ...toolArgs], { maxBuffer: 64 * 1024 * 1024 });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  await new Promise((resolve, reject) => {
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
};

const apply = async (path) => {
  const sql = await readFile(path, 'utf8');
  if (!sql.trim()) return;
  console.log(`  → ${await exec(sql)}`);
};

const jsonLength = async (path) => {
  try {
    return JSON.parse(await readFile(path, 'utf8')).length;
  } catch {
    return 0;
  }
};

await run('mkdir', ['-p', work]);

console.log(`\n— Taking the ${size} most-wanted pending titles`);
await tool('candidates.mjs', ['next', String(size), file('batch.json')]);
if (!(await jsonLength(file('batch.json')))) {
  console.log('Nothing pending. Import more candidates first.');
  process.exit(0);
}

console.log('\n— Reading each title’s page');
await tool('expand.mjs', [file('batch.json'), '--gather', file('gathered.json'), '--misses', file('misses.json')]);

const found = await jsonLength(file('gathered.json'));
if (found) {
  console.log('\n— Writing the facts');
  await tool('expand.mjs', ['--sql', file('titles.sql'), '--from', file('gathered.json')]);
  await apply(file('titles.sql'));

  console.log('\n— Reading where each one streams');
  await tool('availability.mjs', ['--gather', file('offers.json'), '--only', file('gathered.json')]);
  if (await jsonLength(file('offers.json'))) {
    await tool('availability.mjs', ['--sql', file('offers.sql'), '--from', file('offers.json')]);
    await apply(file('offers.sql'));
  }
}

console.log('\n— Reconciling the queue');
await tool('candidates.mjs', ['reconcile']);
if (await jsonLength(file('misses.json'))) await tool('candidates.mjs', ['fail', file('misses.json')]);
await tool('candidates.mjs', ['stats']);

if (keep) console.log(`\nWorking files kept in ${work}`);
else await rm(work, { recursive: true, force: true });
