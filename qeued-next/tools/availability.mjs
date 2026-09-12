#!/usr/bin/env node
/**
 * Fills in where each catalogue title streams in the UK.
 *
 * Reads the page already cited for the title, so no searching or guessing is involved, and
 * takes the offers from the rendered markup: each offer block names its provider and says
 * whether it is a rental, a purchase, included with a subscription, free, or a cinema
 * listing.
 *
 * Rows are not replaced wholesale. An offer still there has its last_seen_at moved forward,
 * a new one is inserted, and one that has gone is stamped removed_at rather than deleted —
 * because "just landed on Netflix" and "no longer streaming" are the most useful things this
 * data can say, and both are invisible if each refresh erases the last.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/availability.mjs [--limit N] [--stale] [--dry-run]
 *
 * Reading the pages and writing the rows can also be separated, which needs no service key:
 *
 *   node tools/availability.mjs --gather offers.json [--only slugs.json]
 *   node tools/availability.mjs --sql offers.sql --from offers.json
 *   npx supabase db query -f offers.sql --db-url "$QEUED_DB_URL"
 *
 * --stale only revisits titles whose rows have passed their 30-day expiry, which is the
 * form to put on a schedule.
 */
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

/** Disc retailers are not streaming, and reseller channels duplicate the service itself. */
const PHYSICAL = /^(zavvi|hmv|blu-ray|dvd)/i;
const RESELLER = /(amazon channel|apple tv channel|channel)$/i;

/** One service can appear under several names and tiers; the service is what matters. */
const canonical = (raw) => {
  let name = String(raw).trim();
  name = name.replace(/\s+(standard with ads|basic with ads|premium|with ads)$/i, '');
  const map = {
    'Disney Plus': 'Disney+',
    'Apple TV Plus': 'Apple TV+',
    'Apple TV': 'Apple TV+',
    'Paramount Plus': 'Paramount+',
    'Now TV': 'NOW',
    'Now': 'NOW',
    'Amazon Prime Video': 'Prime Video',
    'MGM Plus': 'MGM+',
    'BBC iPlayer': 'BBC iPlayer',
  };
  return map[name] ?? name;
};

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A fixed number of page reads in flight, each keeping its own pause. See expand.mjs. */
const pooled = async (items, concurrency, worker) => {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const item = queue.shift();
      if (!item) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
};

/**
 * Pull the offers out of a title page.
 *
 * Order matters: a rental says "Rent", a purchase says "Buy", and a subscription with a
 * trial says "7 days free" — which must not be read as a free offer, or every service with
 * a trial looks like it costs nothing.
 */
const offersFrom = (html) => {
  const clean = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  const found = new Map();

  for (const block of clean.split(/class="offer"/).slice(1)) {
    const raw = block.match(/title="([^"]+)"/)?.[1];
    if (!raw || PHYSICAL.test(raw) || RESELLER.test(raw)) continue;

    const text = block.slice(0, 2500).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    // Promotional rails advertise other titles; they are not offers for this one.
    if (/similar (movies|shows|titles)/i.test(text)) continue;

    let offerType;
    if (/\bRent\b/.test(text)) offerType = 'rent';
    else if (/\bBuy\b/.test(text)) offerType = 'buy';
    else if (/cinema|theatres?|picturehouse|odeon|vue|everyman/i.test(raw)) offerType = 'cinema';
    else if (/free trial|days? free|try free/i.test(text)) offerType = 'subscription';
    else if (/\bFree\b/.test(text)) offerType = 'free';
    else offerType = 'subscription';

    const provider = canonical(raw);
    const price = text.match(/£\d+(?:\.\d{2})?/)?.[0] ?? null;
    found.set(`${provider}|${offerType}`, { provider, offerType, price });
  }
  return [...found.values()];
};

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const flagValue = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};
const limit = flagValue('limit') ? Number(flagValue('limit')) : null;
const dryRun = flag('dry-run');
const gatherPath = flagValue('gather');
const sqlPath = flagValue('sql');
const fromPath = flagValue('from');
const onlyPath = flagValue('only');
const concurrency = Math.max(1, Number(flagValue('concurrency') ?? 4));
if (!KEY && !sqlPath && !gatherPath) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or pass --gather/--sql)');

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;

/**
 * One statement for the whole sweep. Three things have to happen together or the history is
 * wrong: an offer still there moves its last_seen_at forward, a new one is inserted, and one
 * that has gone is stamped removed_at rather than deleted. Doing that per row in separate
 * statements would leave a window where a title looks unavailable everywhere.
 *
 * Only titles present in this sweep are touched, so a partial run never marks the rest of the
 * catalogue as gone.
 */
const sqlForOffers = (allRows) => {
  // The same title can appear twice in a sweep's input; the same offer twice would violate
  // the one-row-per-provider-and-type constraint, so collapse before anything is written.
  const unique = new Map();
  for (const row of allRows) unique.set(`${row.slug}|${row.provider}|${row.offerType}`, row);
  const rows = [...unique.values()];

  const values = rows
    .map((r) => `(${[quote(r.slug), quote(r.provider), quote(r.offerType), r.price ? quote(r.price) : 'null', quote(r.url)].join(', ')})`)
    .join(',\n    ');

  return `-- UK availability sweep. Generated by tools/availability.mjs.
with incoming (slug, provider, offer_type, note, url) as (values
    ${values}
), resolved as (
  select t.id as title_id, i.* from incoming i join public.titles t on t.slug = i.slug
), refreshed as (
  update public.title_availability a set
    last_seen_at = now(),
    removed_at = null,
    note = r.note,
    first_seen_at = case when a.removed_at is not null then now() else a.first_seen_at end,
    expires_at = now() + interval '30 days'
  from resolved r
  where a.title_id = r.title_id and a.region = 'GB' and a.provider = r.provider and a.offer_type = r.offer_type
  returning a.id
), added as (
  insert into public.title_availability (title_id, region, provider, offer_type, url, note, first_seen_at, last_seen_at)
  select r.title_id, 'GB', r.provider, r.offer_type, r.url, r.note, now(), now()
  from resolved r
  where not exists (
    select 1 from public.title_availability a
    where a.title_id = r.title_id and a.region = 'GB' and a.provider = r.provider and a.offer_type = r.offer_type
  )
  returning id
)
update public.title_availability a set removed_at = now()
where a.region = 'GB' and a.removed_at is null
  and a.title_id in (select title_id from resolved)
  and not exists (
    select 1 from resolved r
    where r.title_id = a.title_id and r.provider = a.provider and r.offer_type = a.offer_type
  );
`;
};

if (sqlPath) {
  const { readFileSync, writeFileSync } = await import('node:fs');
  if (!fromPath) throw new Error('--sql needs --from <offers.json>');
  const rows = JSON.parse(readFileSync(fromPath, 'utf8'));
  writeFileSync(sqlPath, sqlForOffers(rows));
  console.log(`Wrote ${rows.length} offer(s) to ${sqlPath}.`);
  console.log(`Apply with: npx supabase db query -f ${sqlPath} --db-url "$QEUED_DB_URL"`);
  process.exit(0);
}

const run = async () => {
  // --only carries the pages to read, so gathering needs no read access either: the file
  // expand.mjs already wrote for a wave names every title in it and where it came from.
  const titles = onlyPath
    ? JSON.parse((await import('node:fs')).readFileSync(onlyPath, 'utf8')).map((entry) => ({
        slug: entry.slug,
        name: entry.fields?.name ?? entry.name ?? entry.slug,
        image_source_url: entry.url ?? entry.fields?.image_source_url ?? null,
      }))
    : await rest(
        'titles?select=id,slug,name,year,image_source_url,title_availability(expires_at),title_sources(source_url)&catalogue_version=gt.0&order=name.asc',
      );

  const due = titles.filter((title) => {
    if (!flag('stale')) return true;
    const rows = title.title_availability ?? [];
    if (!rows.length) return true;
    return rows.every((row) => new Date(row.expires_at) < new Date());
  });

  const batch = limit ? due.slice(0, limit) : due;
  console.log(`${due.length} title(s) due; working through ${batch.length}.\n`);

  let filled = 0;
  let offers = 0;
  let noPage = 0;
  const collected = [];

  const readOne = async (title) => {
    // The page we already cited: availability came from there, so it is the right source.
    const page =
      title.image_source_url?.includes('justwatch') ? title.image_source_url
      : (title.title_sources ?? []).map((s) => s.source_url).find((u) => u?.includes('justwatch'));
    if (!page) {
      noPage += 1;
      console.log(`  ?  ${title.name} — no cited page`);
      return;
    }

    await pause(400);
    let html;
    try {
      const res = await fetch(page, { headers: { 'User-Agent': BROWSER_UA } });
      if (!res.ok) {
        console.log(`  ✗  ${title.name} — ${res.status}`);
        return;
      }
      html = await res.text();
    } catch (e) {
      console.log(`  ✗  ${title.name} — ${e.message}`);
      return;
    }

    const parsed = offersFrom(html);
    if (!parsed.length) {
      console.log(`  —  ${title.name} — no offers listed`);
      return;
    }

    if (gatherPath) {
      for (const offer of parsed) collected.push({ slug: title.slug, url: page, ...offer });
      offers += parsed.length;
      filled += 1;
      console.log(`  ✓  ${title.name} — ${parsed.length} offer(s)`);
      return;
    }

    if (dryRun) {
      console.log(`  ${title.name}: ${parsed.map((o) => `${o.provider} (${o.offerType})`).join(', ')}`);
      return;
    }

    const existing = await rest(`title_availability?select=id,provider,offer_type,removed_at&title_id=eq.${title.id}&region=eq.GB`);
    const now = new Date().toISOString();
    const seenKeys = new Set(parsed.map((o) => `${o.provider}|${o.offerType}`));

    for (const offer of parsed) {
      const match = existing.find((row) => row.provider === offer.provider && row.offer_type === offer.offerType);
      if (match) {
        // Back after a gap counts as newly available again, so first_seen_at resets.
        await rest(`title_availability?id=eq.${match.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            last_seen_at: now,
            removed_at: null,
            note: offer.price,
            ...(match.removed_at ? { first_seen_at: now } : {}),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        });
      } else {
        await rest('title_availability', {
          method: 'POST',
          body: JSON.stringify({
            title_id: title.id,
            region: 'GB',
            provider: offer.provider,
            offer_type: offer.offerType,
            url: page,
            note: offer.price,
            first_seen_at: now,
            last_seen_at: now,
          }),
        });
      }
      offers += 1;
    }

    for (const row of existing) {
      if (seenKeys.has(`${row.provider}|${row.offer_type}`) || row.removed_at) continue;
      await rest(`title_availability?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ removed_at: now }) });
    }
    await rest('title_sources?on_conflict=title_id,field,source_url', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ title_id: title.id, field: 'availability', source_url: page, source_name: 'JustWatch UK' }),
    });
    filled += 1;
    console.log(`  ✓  ${title.name} — ${parsed.length} offer(s)`);
  };

  // Reads go several at a time; the write path stays sequential.
  if (gatherPath) await pooled(batch, concurrency, readOne);
  else for (const title of batch) await readOne(title);

  if (gatherPath) {
    (await import('node:fs')).writeFileSync(gatherPath, JSON.stringify(collected, null, 1));
    console.log(`\nGathered ${offers} offer(s) across ${filled} title(s) into ${gatherPath}.`);
    return;
  }

  console.log(
    dryRun
      ? `\nDry run: ${batch.length} checked, nothing written.`
      : `\nFilled ${filled} titles with ${offers} offers${noPage ? `, ${noPage} had no cited page` : ''}.`,
  );
};

await run();
