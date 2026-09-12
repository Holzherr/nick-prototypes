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
 * --stale only revisits titles whose rows have passed their 30-day expiry, which is the
 * form to put on a schedule.
 */
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

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
const limitIndex = args.indexOf('--limit');
const limit = limitIndex === -1 ? null : Number(args[limitIndex + 1]);
const dryRun = flag('dry-run');

const run = async () => {
  const titles = await rest(
    'titles?select=id,name,year,image_source_url,title_availability(expires_at),title_sources(source_url)&catalogue_version=gt.0&order=name.asc',
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

  for (const title of batch) {
    // The page we already cited: availability came from there, so it is the right source.
    const page =
      title.image_source_url?.includes('justwatch') ? title.image_source_url
      : (title.title_sources ?? []).map((s) => s.source_url).find((u) => u?.includes('justwatch'));
    if (!page) {
      noPage += 1;
      console.log(`  ?  ${title.name} — no cited page`);
      continue;
    }

    await pause(400);
    let html;
    try {
      const res = await fetch(page, { headers: { 'User-Agent': BROWSER_UA } });
      if (!res.ok) {
        console.log(`  ✗  ${title.name} — ${res.status}`);
        continue;
      }
      html = await res.text();
    } catch (e) {
      console.log(`  ✗  ${title.name} — ${e.message}`);
      continue;
    }

    const parsed = offersFrom(html);
    if (!parsed.length) {
      console.log(`  —  ${title.name} — no offers listed`);
      continue;
    }

    if (dryRun) {
      console.log(`  ${title.name}: ${parsed.map((o) => `${o.provider} (${o.offerType})`).join(', ')}`);
      continue;
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
  }

  console.log(
    dryRun
      ? `\nDry run: ${batch.length} checked, nothing written.`
      : `\nFilled ${filled} titles with ${offers} offers${noPage ? `, ${noPage} had no cited page` : ''}.`,
  );
};

await run();
