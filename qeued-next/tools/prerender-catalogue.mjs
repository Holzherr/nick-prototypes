#!/usr/bin/env node
/**
 * Writes the public catalogue as static pages, plus the files that let agents find it.
 *
 * Qeued is a client-rendered SPA on GitHub Pages, so a crawler — or an assistant fetching a
 * URL — gets an empty shell. This runs after the Vite build and emits one real HTML page per
 * catalogued title: the SPA shell, with the head filled in and the facts repeated in markup
 * that needs no JavaScript. The app still takes over on load; nobody sees the static copy.
 *
 *   SUPABASE_URL=… SUPABASE_ANON_KEY=… node tools/prerender-catalogue.mjs [dist]
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const SITE = 'https://qeued.com';
const MCP_ENDPOINT = 'https://piwfcsvnxcmxmvfhgtbk.supabase.co/functions/v1/mcp';
const URL_BASE = process.env.SUPABASE_URL ?? 'https://piwfcsvnxcmxmvfhgtbk.supabase.co';
const KEY = process.env.SUPABASE_ANON_KEY;

const escape = (value) =>
  String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rest = async (path) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
};

/** schema.org so search engines and agents can read the record without parsing prose. */
const jsonLd = (title, stats) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': title.type === 'series' ? 'TVSeries' : 'Movie',
    name: title.name,
    description: title.synopsis ?? undefined,
    datePublished: title.year ? String(title.year) : undefined,
    genre: title.genres?.length ? title.genres : undefined,
    contentRating: title.certification ?? undefined,
    image: title.image_url ?? undefined,
    url: `${SITE}/titles/${title.slug}`,
    numberOfSeasons: title.seasons ?? undefined,
    numberOfEpisodes: title.episodes ?? undefined,
    actor: title.cast_members?.length ? title.cast_members.map((name) => ({ '@type': 'Person', name })) : undefined,
    director: title.director ? { '@type': 'Person', name: title.director } : undefined,
    timeRequired: title.runtime_minutes ? `PT${title.runtime_minutes}M` : undefined,
  };
  if (stats?.watchers >= 3 && stats.average) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: stats.average,
      ratingCount: stats.watchers,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return JSON.stringify(data, (_key, value) => (value === undefined ? undefined : value));
};

const availabilityMarkup = (offers) => {
  if (!offers?.length) return '';
  const grouped = new Map();
  for (const offer of offers) {
    if (!grouped.has(offer.offer_type)) grouped.set(offer.offer_type, []);
    grouped.get(offer.offer_type).push(offer.provider);
  }
  const rows = [...grouped.entries()]
    .map(([type, providers]) => `<li>${escape(type)}: ${escape([...new Set(providers)].join(', '))}</li>`)
    .join('');
  return `<h2>Where to watch (UK)</h2><ul>${rows}</ul>`;
};

const page = (shell, title, stats) => {
  const heading = `${title.name}${title.year ? ` (${title.year})` : ''}`;
  const description = (title.synopsis ?? `${heading} on Qeued.`).slice(0, 300);
  const facts = [
    title.type === 'series' ? 'Series' : 'Film',
    title.certification,
    title.runtime_minutes ? `${title.runtime_minutes} min` : null,
    title.seasons ? `${title.seasons} season${title.seasons > 1 ? 's' : ''}` : null,
    title.genres?.join(', '),
  ].filter(Boolean);

  const head = [
    `<title>${escape(heading)} — Qeued</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<link rel="canonical" href="${SITE}/titles/${escape(title.slug)}">`,
    `<meta property="og:title" content="${escape(heading)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:type" content="video.${title.type === 'series' ? 'tv_show' : 'movie'}">`,
    title.image_url ? `<meta property="og:image" content="${escape(title.image_url)}">` : '',
    `<script type="application/ld+json">${jsonLd(title, stats)}</script>`,
  ].filter(Boolean).join('\n    ');

  // The static copy lives in noscript: crawlers and plain fetches read it, and it can never
  // flash in front of someone whose browser runs the app.
  const body = [
    `<h1>${escape(heading)}</h1>`,
    `<p>${escape(facts.join(' · '))}</p>`,
    title.synopsis ? `<p>${escape(title.synopsis)}</p>` : '',
    title.director ? `<p>Directed by ${escape(title.director)}</p>` : '',
    title.cast_members?.length ? `<p>Starring ${escape(title.cast_members.slice(0, 6).join(', '))}</p>` : '',
    availabilityMarkup(title.title_availability),
    stats?.watchers ? `<p>${stats.watchers} Qeued ${stats.watchers === 1 ? 'member has' : 'members have'} watched this${stats.average ? `, averaging ${stats.average} out of 5` : ''}.</p>` : '',
    title.title_sources?.length
      ? `<h2>Sources</h2><ul>${title.title_sources.slice(0, 8).map((s) => `<li><a href="${escape(s.source_url)}" rel="nofollow">${escape(s.source_name ?? s.source_url)}</a> — ${escape(s.field)}</li>`).join('')}</ul>`
      : '',
  ].filter(Boolean).join('\n      ');

  // Swap the shell's whole <title> element for our head block in one go: replacing the tags
  // separately would match the closing tag of the title we just injected.
  return shell
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace('</body>', `  <noscript>\n      ${body}\n    </noscript>\n  </body>`);
};

const run = async () => {
  if (!KEY) throw new Error('Missing SUPABASE_ANON_KEY');
  const shell = await readFile(join(DIST, 'index.html'), 'utf8');

  const titles = await rest(
    'titles?select=id,slug,name,year,type,genres,synopsis,certification,runtime_minutes,seasons,episodes,director,cast_members,image_url,title_availability(provider,offer_type),title_sources(field,source_url,source_name)&catalogue_version=gt.0&order=name.asc',
  );

  // Aggregate signal, never anyone's individual history: a count and a mean, and only once
  // enough people have watched it that neither points at a person.
  const entries = await rest('watch_entries?select=title_id,status,watched_rating');
  const stats = new Map();
  for (const entry of entries) {
    if (entry.status !== 'watched') continue;
    const current = stats.get(entry.title_id) ?? { watchers: 0, ratings: [] };
    current.watchers += 1;
    if (entry.watched_rating) current.ratings.push(entry.watched_rating);
    stats.set(entry.title_id, current);
  }
  for (const value of stats.values()) {
    value.average = value.ratings.length
      ? Math.round((value.ratings.reduce((a, b) => a + b, 0) / value.ratings.length) * 10) / 10
      : null;
  }

  for (const title of titles) {
    if (!title.slug) continue;
    const dir = join(DIST, 'titles', title.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), page(shell, title, stats.get(title.id)));
  }

  const urls = [
    `${SITE}/`,
    `${SITE}/agents`,
    ...titles.filter((t) => t.slug).map((t) => `${SITE}/titles/${t.slug}`),
  ];
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${escape(u)}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
  );

  await writeFile(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

  // For assistants reading the site rather than crawling it.
  await writeFile(
    join(DIST, 'llms.txt'),
    [
      '# Qeued',
      '',
      '> A personal watchlist for films and series: what someone wants to watch, what they have seen,',
      '> and where each title streams in the UK. Every record is written for Qeued from researched',
      '> sources, with citations kept per field.',
      '',
      '## For agents',
      '',
      `Qeued exposes an MCP server so an assistant can keep its user's list directly:`,
      '',
      `- MCP endpoint: ${MCP_ENDPOINT} (streamable HTTP, JSON-RPC 2.0)`,
      `- Docs: ${SITE}/agents`,
      '- Tools: whoami, provision_account, search_catalogue, add_to_queue, list_queue, mark_watched,',
      '  whats_on_tonight, where_to_watch',
      '',
      'A user with no Qeued account does not block you: call provision_account to start a list',
      'immediately and hand the user the claim link it returns.',
      '',
      '## Catalogue',
      '',
      `- Sitemap: ${SITE}/sitemap.xml`,
      `- Each title: ${SITE}/titles/<slug> with schema.org Movie or TVSeries JSON-LD`,
      `- Titles catalogued: ${titles.length}`,
      '',
    ].join('\n'),
  );

  await mkdir(join(DIST, '.well-known'), { recursive: true });
  await writeFile(
    join(DIST, '.well-known', 'mcp.json'),
    JSON.stringify(
      {
        name: 'qeued',
        description: "Keep a personal film and TV watchlist, and ask what to watch tonight.",
        version: '1.0.0',
        endpoint: MCP_ENDPOINT,
        transport: 'streamable-http',
        protocolVersion: '2025-06-18',
        authentication: { type: 'bearer', description: 'Issue a token at https://qeued.com/agents, or call provision_account for a new user.' },
        documentation: `${SITE}/agents`,
      },
      null,
      2,
    ) + '\n',
  );

  console.log(`Prerendered ${titles.length} titles, sitemap, robots.txt, llms.txt and .well-known/mcp.json`);
};

await run();
