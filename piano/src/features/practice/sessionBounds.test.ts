import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Builder sessions cannot run Postgres, so the migration is checked by reading it. */
const sql = readFileSync('supabase/migrations/0003_piano_sessions_bounds.sql', 'utf8');
const code = sql.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').replace(/\s+/g, ' ');

describe('0003_piano_sessions_bounds.sql', () => {
  it('bounds piece_id, session_id and correct_presses with constraints that leave old rows alone', () => {
    expect(code).toContain('check (char_length(piece_id) between 1 and 64) not valid');
    expect(code).toContain('check (char_length(session_id) between 1 and 64) not valid');
    expect(code).toContain('check (correct_presses between 0 and 500) not valid');
  });
  it('keeps day within one day of today on both the insert and the update policy', () => {
    const day = 'with check (day between current_date - 1 and current_date + 1)';
    expect(code).toContain(`alter policy "devices record a session" on public.piano_sessions ${day}`);
    expect(code).toContain(`alter policy "devices extend a session" on public.piano_sessions ${day}`);
  });
  it('refuses an update that changes device_id, session_id or day', () => {
    for (const column of ['device_id', 'session_id', 'day']) expect(code).toContain(`new.${column} is distinct from old.${column}`);
    expect(code).toContain('raise exception');
    expect(code).toContain('create or replace trigger piano_sessions_keep_keys before update on public.piano_sessions for each row execute function public.piano_sessions_keep_keys()');
  });
  it('holds nothing deploy-watch treats as destructive', () => {
    expect(code).not.toMatch(/\b(drop|revoke|truncate)\b|\bdelete\s+from\b|disable\s+row\s+level\s+security/i);
  });
});
