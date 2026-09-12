#!/usr/bin/env node
/**
 * Regenerates model-scored recommendation slates, away from anyone waiting.
 *
 * Serving a request never calls the model: get-recommendations ranks saved data and returns
 * immediately. This is the other half — it asks for the scored version of each profile's
 * slate and leaves it in the cache, so the next visit reads a better list at the same speed.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/refresh-slates.mjs [--profile <id>] [--dry-run]
 *
 * Run it on a schedule. Each profile costs one large model call, so cadence is a cost dial:
 * daily is ample for a list that changes a few times a week.
 */
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const only = args.includes('--profile') ? args[args.indexOf('--profile') + 1] : null;

const rest = async (path) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
};

const run = async () => {
  // Only profiles with something on their list: a slate needs a history to rank against.
  const profiles = await rest('profiles?select=id,name,user_id,owner_user_id');
  const entries = await rest('watch_entries?select=profile_id');
  const active = new Set(entries.map((e) => e.profile_id));
  const targets = profiles.filter((p) => (only ? p.id === only : active.has(p.id)));

  if (!targets.length) {
    console.log('No profiles with entries to refresh.');
    return;
  }
  console.log(`Refreshing ${targets.length} slate(s).\n`);

  for (const profile of targets) {
    if (dryRun) {
      console.log(`  would refresh ${profile.name ?? profile.id}`);
      continue;
    }
    const started = Date.now();
    const res = await fetch(`${URL_BASE}/functions/v1/get-recommendations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: profile.user_id ?? profile.owner_user_id ?? profile.id,
        profile_id: profile.id,
        mode: 'refresh',
      }),
    });
    const seconds = Math.round((Date.now() - started) / 1000);
    if (!res.ok) {
      console.log(`  ✗ ${profile.name ?? profile.id} — ${res.status} ${(await res.text()).slice(0, 120)}`);
      continue;
    }
    const data = await res.json();
    console.log(`  ✓ ${profile.name ?? profile.id} — ${data.personal?.length ?? 0} picks in ${seconds}s`);
  }
};

await run();
