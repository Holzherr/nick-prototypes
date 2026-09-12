#!/usr/bin/env node
/**
 * Finds real poster art for catalogue titles, and never writes a URL it hasn't fetched.
 *
 * Earlier enrichment asked a model to recall image URLs, which produces plausible links to
 * nothing. Wikipedia is no good either: its pageimages API hides non-free posters, so a
 * search for one returns a cast photo or an episode list — a real image of the wrong thing,
 * which is no better than a made-up one.
 *
 * So posters come from the page already cited for the title's availability. That URL was
 * recorded when the title was researched, so the match is established and no guessing is
 * involved. Every candidate is then fetched before it is stored.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node tools/posters.mjs [--check] [--limit N] [--dry-run] [--force]
 *
 * --check re-tests stored URLs and clears any that have rotted. --force replaces art a
 * title already has.
 */
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
/** Poster width to request. JustWatch serves several sizes; s592 is sharp enough for a grid. */
const POSTER_SIZE = 's592';

const rest = async (path, init = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

/** An image is real only if it answers with image bytes. Anything else counts as not found. */
const resolves = async (url) => {
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': BROWSER_UA, Range: 'bytes=0-2047' } });
    if (!res.ok && res.status !== 206) return false;
    const type = res.headers.get('content-type') ?? '';
    await res.arrayBuffer();
    return type.startsWith('image/');
  } catch {
    return false;
  }
};

/**
 * Pull poster art out of a JustWatch title page.
 *
 * A film's page leads with the film's own poster; a series page leads with season art, so
 * the lowest season number is preferred — that is the image people recognise. Season art is
 * still the right show, which is what matters.
 */
const posterFromJustWatch = async (pageUrl) => {
  let html;
  try {
    const res = await fetch(pageUrl, { headers: { 'User-Agent': BROWSER_UA } });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const paths = [...new Set([...html.matchAll(/images\.justwatch\.com\/poster\/[^"'\s\\)]+\.jpg/g)].map((m) => m[0]))];
  if (!paths.length) return null;

  const seasonNumber = (path) => {
    const match = path.match(/season-(\d+)\.jpg$/);
    return match ? Number(match[1]) : 0;
  };
  // Non-season art first (a film, or a show's main poster), then season 1 upwards.
  paths.sort((a, b) => seasonNumber(a) - seasonNumber(b));

  for (const path of paths.slice(0, 4)) {
    const candidate = `https://${path.replace(/\/s\d+\//, `/${POSTER_SIZE}/`)}`;
    if (await resolves(candidate)) return candidate;
  }
  return null;
};

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : Number(args[i + 1]);
};
const dryRun = flag('dry-run');
const limit = value('limit');

const run = async () => {
  if (flag('check')) {
    const stored = await rest('titles?select=id,name,image_url&image_url=not.is.null');
    let broken = 0;
    for (const title of stored) {
      if (await resolves(title.image_url)) continue;
      broken += 1;
      console.log(`rotted: ${title.name}`);
      if (!dryRun) await rest(`titles?id=eq.${title.id}`, { method: 'PATCH', body: JSON.stringify({ image_url: null }) });
    }
    console.log(`\nChecked ${stored.length} stored images; ${broken} no longer resolve${dryRun ? ' (dry run)' : ' and were cleared'}.`);
    return;
  }

  const filter = flag('force') ? '' : '&image_url=is.null';
  const titles = await rest(
    `titles?select=id,name,year,image_url,title_sources(source_url,source_name)&catalogue_version=gt.0${filter}&order=name.asc`,
  );
  const batch = limit ? titles.slice(0, limit) : titles;
  console.log(`${titles.length} titles to work through (${batch.length} in this run).\n`);

  let found = 0;
  let noSource = 0;
  for (const title of batch) {
    const source = (title.title_sources ?? []).find((s) => /justwatch/i.test(s.source_url));
    if (!source) {
      noSource += 1;
      console.log(`  ?  ${title.name} — no cited page to take art from`);
      continue;
    }

    const poster = await posterFromJustWatch(source.source_url);
    if (!poster) {
      console.log(`  —  ${title.name} (${title.year ?? '?'})`);
      continue;
    }

    found += 1;
    console.log(`  ✓  ${title.name} (${title.year ?? '?'})`);
    if (dryRun) continue;
    await rest(`titles?id=eq.${title.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        image_url: poster,
        image_source_url: source.source_url,
        image_attribution: 'Artwork via JustWatch',
        image_license: 'rights-reserved',
      }),
    });
    await rest('title_sources?on_conflict=title_id,field,source_url', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ title_id: title.id, field: 'image_url', source_url: source.source_url, source_name: 'JustWatch UK' }),
    });
  }
  console.log(
    `\nFound ${found} of ${batch.length}${noSource ? `, ${noSource} had no cited page` : ''}${dryRun ? ' (dry run, nothing written)' : ''}.`,
  );
};

await run();
