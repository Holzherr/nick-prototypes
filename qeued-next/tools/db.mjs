/**
 * A database connection for the catalogue tools that needs no service-role key.
 *
 * Both of Qeued's repositories are public, so the service key should not sit on disk here.
 * The Supabase CLI already holds a working connection, and `supabase db query` will run
 * arbitrary SQL over it, so that is what these tools use.
 *
 *   export QEUED_DB_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:5432/postgres"
 *
 * One caveat shapes everything built on this: the CLI sends a file as a SINGLE prepared
 * statement. Several statements in one call are rejected, so anything that needs more than
 * one goes inside a `do $$ … $$` block, which has the useful side effect of making a batch
 * land whole or not at all.
 */
import { execFile } from 'node:child_process';
import { writeFile, unlink } from 'node:fs/promises';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = promisify(execFile);

const dbUrl = () => {
  const url = process.env.QEUED_DB_URL;
  if (!url) throw new Error('Missing QEUED_DB_URL — see the comment at the top of tools/db.mjs');
  return url;
};

const callCli = async (args) => {
  const { stdout } = await run('npx', ['--yes', 'supabase@latest', 'db', 'query', ...args, '--db-url', dbUrl()], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return stdout;
};

/** The CLI prints a line of its own before the JSON; the payload starts at the first brace. */
const parse = (stdout) => {
  const start = stdout.indexOf('{');
  if (start === -1) return { rows: [], raw: stdout.trim() };
  try {
    return JSON.parse(stdout.slice(start));
  } catch {
    return { rows: [], raw: stdout.trim() };
  }
};

/** Rows from a SELECT. Anything returned here was written by a tool, not by a user. */
export const query = async (sql) => parse(await callCli([sql])).rows ?? [];

/**
 * One row from a SELECT that aggregates into a single json column, which is how these tools
 * move a few thousand records without paging: `select json_agg(...) as data from …`.
 */
export const queryJson = async (sql) => {
  const rows = await query(sql);
  return rows[0]?.data ?? [];
};

/**
 * A statement with no rows to return.
 *
 * Always via a file, for two reasons: generated SQL routinely exceeds what argv will carry,
 * and a statement that opens with a `--` comment is read by the CLI as a flag rather than as
 * SQL.
 */
export const exec = async (sql) => {
  const path = join(tmpdir(), `qeued-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  await writeFile(path, sql);
  try {
    return parse(await callCli(['-f', path])).raw ?? '';
  } finally {
    await unlink(path).catch(() => {});
  }
};

/** Single-quoted SQL literal. Everything these tools write goes through here. */
export const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;

/** A value in any of the shapes the catalogue stores: null, number, text, or text[]. */
export const literal = (value) => {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return value.length ? `ARRAY[${value.map(quote).join(', ')}]::text[]` : `'{}'::text[]`;
  if (typeof value === 'number') return String(value);
  return quote(value);
};

/** Wraps several statements so they reach the query channel as one, and commit as one. */
export const block = (statements) => `do $qeued$ begin\n  ${statements.join('\n  ')}\nend $qeued$;`;
