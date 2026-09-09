#!/usr/bin/env node
/**
 * One-off: copy Qeued data from the Lovable-managed Supabase project into the qeued project.
 *
 *   OLD_URL=https://zfek….supabase.co OLD_ANON=… \
 *   NEW_URL=https://piwf….supabase.co NEW_SERVICE_KEY=… \
 *   OLD_USER_ID=<uuid in the Lovable project> NEW_USER_ID=<uuid in the qeued project> \
 *   node tools/migrate-data.mjs
 *
 * Copies: every title (ids kept), the old user's watch entries + skipped recommendations
 * (user id rewritten), and the profile fields onto the new user's auto-created profile row.
 * Reads with the old anon key (RLS lets anon read titles and public-profile entries), writes
 * with the new service-role key. Idempotent: upserts on primary keys.
 */
const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};
const OLD_URL = env('OLD_URL'), OLD_ANON = env('OLD_ANON'), NEW_URL = env('NEW_URL'), NEW_KEY = env('NEW_SERVICE_KEY');
const OLD_USER = env('OLD_USER_ID'), NEW_USER = env('NEW_USER_ID');

const rest = async (base, key, path, init = {}) => {
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
const readAll = async (path) => {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const page = await rest(OLD_URL, OLD_ANON, path, { headers: { Range: `${from}-${from + 999}` } });
    out.push(...page);
    if (page.length < 1000) break;
  }
  return out;
};
const upsert = (table, rows, onConflict = 'id') =>
  rows.length
    ? rest(NEW_URL, NEW_KEY, `${table}?on_conflict=${onConflict}`, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows),
      })
    : null;

const titles = await readAll('titles?select=*');
await upsert('titles', titles);
console.log(`titles: ${titles.length}`);

const actors = await readAll('actors?select=*').catch(() => []);
await upsert('actors', actors);
const titleActors = await readAll('title_actors?select=*').catch(() => []);
await upsert('title_actors', titleActors, 'title_id,actor_id');
console.log(`actors: ${actors.length}, title_actors: ${titleActors.length}`);

const entries = await readAll(`watch_entries?select=*&user_id=eq.${OLD_USER}`);
await upsert('watch_entries', entries.map((e) => ({ ...e, user_id: NEW_USER })), 'user_id,title_id');
console.log(`watch_entries: ${entries.length}`);

const skipped = await readAll(`skipped_recommendations?select=*&user_id=eq.${OLD_USER}`).catch(() => []);
await upsert('skipped_recommendations', skipped.map((s) => ({ ...s, user_id: NEW_USER })));
console.log(`skipped_recommendations: ${skipped.length}`);

const [profile] = await readAll(`profiles?select=*&user_id=eq.${OLD_USER}`);
if (profile) {
  const { id, user_id, created_at, updated_at, ...fields } = profile;
  if (fields.avatar_url) {
    // Copy the avatar file into the new project's public `avatars` bucket.
    const img = await fetch(fields.avatar_url);
    if (img.ok) {
      const bytes = Buffer.from(await img.arrayBuffer());
      const objectPath = `avatars/${NEW_USER}/avatar.jpeg`;
      const up = await fetch(`${NEW_URL}/storage/v1/object/${objectPath}`, {
        method: 'POST',
        headers: { apikey: NEW_KEY, Authorization: `Bearer ${NEW_KEY}`, 'Content-Type': img.headers.get('content-type') ?? 'image/jpeg', 'x-upsert': 'true' },
        body: bytes,
      });
      if (!up.ok) throw new Error(`avatar upload → ${up.status} ${await up.text()}`);
      fields.avatar_url = `${NEW_URL}/storage/v1/object/public/${objectPath}?t=${Date.now()}`;
      console.log(`avatar: ${bytes.length} bytes`);
    }
  }
  await rest(NEW_URL, NEW_KEY, `profiles?user_id=eq.${NEW_USER}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fields),
  });
  console.log(`profile: ${fields.username ?? fields.name}`);
}
console.log('done');
