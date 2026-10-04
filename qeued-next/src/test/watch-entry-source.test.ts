import { expect, it } from 'vitest';
import snapshot from '../../supabase/migrations/0025_agent_snapshot.sql?raw';
import migration from '../../supabase/migrations/0027_watch_entry_source.sql?raw';

// The agent_snapshot body with full-line comments dropped: 0027 copies 0025's sections without them.
const body = (sql: string) => sql.slice(sql.indexOf('with win as ('), sql.indexOf('\n$$;', sql.indexOf('with win as ('))).replace(/^\s*--.*\n/gm, '');

it('0027 adds a set-once source and recs_taken, leaving the three 0025 sections as they were', () => {
  const values = migration.match(/add column if not exists source text\s+constraint watch_entries_source_check check \(source in \(([^)]+)\)\)/)?.[1];
  expect(values?.split(', ')).toEqual(["'recommendation'", "'tonight'", "'search'", "'title_page'", "'manual'"]);
  expect(migration).not.toMatch(/^\s*(update|grant) /im);
  expect(migration).toMatch(/if old\.source is not null then\s+new\.source := old\.source;/);
  expect(migration).toMatch(/before update on public\.watch_entries for each row execute function public\.keep_watch_entry_source\(\);/);
  const [ctes, select] = body(snapshot).split('\nselect jsonb_build_object(\n');
  expect(body(migration)).toContain(ctes);
  expect(body(migration)).toContain(select.slice(0, select.lastIndexOf('\n);')));
  expect(body(migration)).toMatch(/md5\(e\.profile_id::text\) as profile, count\(\*\) as taken[^;]+and e\.source in \('recommendation', 'tonight'\)/);
  expect(body(migration)).toMatch(/'recs_taken', \(select coalesce\(jsonb_agg\(to_jsonb\(x\)\), '\[\]'::jsonb\) from recs_taken x\)/);
  expect(body(migration)).not.toMatch(/public\.profiles/);
});
