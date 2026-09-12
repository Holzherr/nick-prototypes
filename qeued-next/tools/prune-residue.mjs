#!/usr/bin/env node
/**
 * Deletes the uncatalogued rows the Lovable import left behind.
 *
 * These were never a catalogue — they are search artefacts, four "Anna"s and an
 * "Ozark Mtn Drive-In" among them. Nothing references any of them: the guard below refuses
 * to touch a row that has a watch entry, and the set is backed up in
 * tools/data/pruned-titles-2026-09-12.json so the deletion is reversible.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/prune-residue.mjs [--dry-run]
 */
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const dryRun = process.argv.includes('--dry-run');

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const run = async () => {
  const residue = await rest('titles?select=id,name,year&catalogue_version=eq.0');
  const entries = await rest('watch_entries?select=title_id');
  const referenced = new Set(entries.map((e) => e.title_id));

  const safe = residue.filter((t) => !referenced.has(t.id));
  const held = residue.filter((t) => referenced.has(t.id));

  console.log(`${residue.length} uncatalogued row(s); ${safe.length} unreferenced, ${held.length} on someone's list.`);
  if (held.length) {
    console.log('\nKeeping (referenced by an entry):');
    for (const t of held) console.log(`  ${t.name} (${t.year ?? '?'})`);
  }
  if (!safe.length) return;

  if (dryRun) {
    console.log(`\nDry run: would delete ${safe.length} row(s), starting with ` +
      `${safe.slice(0, 5).map((t) => t.name).join(', ')}…`);
    return;
  }

  let deleted = 0;
  for (const title of safe) {
    await rest(`titles?id=eq.${title.id}`, { method: 'DELETE' });
    deleted += 1;
  }
  console.log(`\nDeleted ${deleted} row(s). Backup: tools/data/pruned-titles-2026-09-12.json`);
};

await run();
