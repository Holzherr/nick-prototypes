import { serviceClient } from '../_shared/db.ts';

/**
 * Qeued's MCP server: an assistant keeps its user's watchlist without the user opening the app.
 *
 * Speaks JSON-RPC 2.0 over HTTP POST (the MCP streamable-HTTP transport, answering in plain
 * JSON rather than SSE — every response here is a single result). Agents authenticate with a
 * scoped bearer token; an agent whose user has no Qeued account yet can call provision_account
 * to start a list immediately and hand its user a link to claim it later.
 */

const PROTOCOL_VERSION = '2025-06-18';
const SERVER = { name: 'qeued', version: '1.0.0' };
const SITE = 'https://qeued.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, mcp-protocol-version',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

type Json = Record<string, unknown>;
type Profile = { id: string; name: string | null; user_id: string | null; max_certification: string | null };

const rpcResult = (id: unknown, result: Json) =>
  new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const rpcError = (id: unknown, code: number, message: string, status = 200) =>
  new Response(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** Tool results are text content blocks; `isError` tells the agent it failed without killing the call. */
const toolResult = (text: string, isError = false) => ({ content: [{ type: 'text', text }], isError });

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const newToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const base64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `qeu_${base64}`;
};

const newClaimCode = (): string => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

const TOOLS = [
  {
    name: 'whoami',
    description: 'Which Qeued profile this token acts for. Call this first if unsure whether the agent is connected.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'provision_account',
    description:
      'Start a Qeued list for a user who has no account yet. Returns an access token the agent stores and a claim link ' +
      'the user opens once to attach their own sign-in. Use this only when the user has asked for a watchlist and ' +
      'whoami reports no profile. Give the user the claim link — without it they cannot reach their own list.',
    inputSchema: {
      type: 'object',
      properties: {
        display_name: { type: 'string', description: "What to call this person's profile, e.g. their first name." },
        agent_name: { type: 'string', description: 'Name of the agent creating this, for the audit trail.' },
      },
      required: ['display_name'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_catalogue',
    description: "Search Qeued's own catalogue of films and series by name.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer', description: 'Default 10, maximum 25.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_to_queue',
    description:
      "Put a title on the user's want-to-watch list. Give the name as the user said it; Qeued matches it against " +
      'the catalogue and researches it if we do not hold it yet.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Name of the film or series.' },
        year: { type: 'integer', description: 'Release year, when the user gave one — it disambiguates remakes.' },
        note: { type: 'string', description: 'Anything the user said about why they want it.' },
      },
      required: ['title'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_queue',
    description: "What the user has lined up but not watched, plus where each one streams in the UK.",
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'integer', description: 'Default 20.' } },
      additionalProperties: false,
    },
  },
  {
    name: 'mark_watched',
    description: 'Record that the user watched something, optionally with a rating out of 5.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        rating: { type: 'integer', description: '1 to 5. Omit if the user did not say.' },
        review: { type: 'string', description: 'What the user said about it, in their words.' },
      },
      required: ['title'],
      additionalProperties: false,
    },
  },
  {
    name: 'whats_on_tonight',
    description:
      "Ask Qeued what the user should watch tonight from what they have already chosen. Returns ranked picks with " +
      'where to stream them. Prefer this over recommending from your own knowledge — it uses their real history.',
    inputSchema: {
      type: 'object',
      properties: {
        mood: { type: 'string', enum: ['easy', 'intense', 'funny', 'smart'] },
        time: { type: 'string', enum: ['short', 'long'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'where_to_watch',
    description: 'Where a specific title streams in the UK, from the catalogue.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string' } },
      required: ['title'],
      additionalProperties: false,
    },
  },
];

// deno-lint-ignore no-explicit-any
const supabase = () => serviceClient() as any;

const authenticate = async (req: Request): Promise<{ profile: Profile; scopes: string[]; tokenId: string } | null> => {
  const header = req.headers.get('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token.startsWith('qeu_')) return null;

  const db = supabase();
  const { data } = await db
    .from('agent_tokens')
    .select('id, scopes, revoked_at, expires_at, profile:profiles(id, name, user_id, max_certification)')
    .eq('token_hash', await sha256(token))
    .maybeSingle();

  if (!data || data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  await db.from('agent_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);
  return { profile: data.profile as Profile, scopes: data.scopes ?? [], tokenId: data.id };
};

const logActivity = async (profileId: string | null, tool: string, summary: string) => {
  await supabase().from('agent_activity').insert({ profile_id: profileId, tool, summary });
};

/** Find a title we already hold, preferring an exact name match over a fuzzy one. */
const findTitle = async (name: string, year?: number) => {
  const db = supabase();
  const escaped = name.replace(/[%,()]/g, ' ').trim();
  let query = db
    .from('titles')
    .select('id, name, year, type, genres, synopsis, certification, runtime_minutes, seasons, image_url, title_availability(provider, offer_type, url)')
    .gt('catalogue_version', 0)
    .ilike('name', `%${escaped}%`)
    .limit(5);
  if (year) query = query.eq('year', year);
  const { data } = await query;
  if (!data?.length) return null;
  const exact = data.find((t: { name: string }) => t.name.toLowerCase() === name.toLowerCase());
  return exact ?? data[0];
};

// deno-lint-ignore no-explicit-any
const describeAvailability = (title: any): string => {
  const offers = title.title_availability ?? [];
  if (!offers.length) return 'Where to watch: not checked yet.';
  // deno-lint-ignore no-explicit-any
  const subscription = offers.filter((o: any) => o.offer_type === 'subscription' || o.offer_type === 'free');
  // deno-lint-ignore no-explicit-any
  const paid = offers.filter((o: any) => o.offer_type === 'rent' || o.offer_type === 'buy');
  const parts: string[] = [];
  // deno-lint-ignore no-explicit-any
  if (subscription.length) parts.push(`included with ${subscription.map((o: any) => o.provider).join(', ')}`);
  // deno-lint-ignore no-explicit-any
  if (paid.length) parts.push(`rent or buy from ${[...new Set(paid.map((o: any) => o.provider))].join(', ')}`);
  return `Where to watch (UK): ${parts.join('; ')}.`;
};

const callTool = async (
  name: string,
  args: Json,
  auth: Awaited<ReturnType<typeof authenticate>>,
  origin: string,
) => {
  const db = supabase();

  if (name === 'provision_account') {
    const displayName = String(args.display_name ?? '').trim();
    if (!displayName) return toolResult('display_name is required.', true);

    // A cap on how many unclaimed profiles can be created in an hour: this endpoint is
    // unauthenticated by necessity, so it is the one place that needs a brake.
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await db
      .from('agent_activity')
      .select('id', { count: 'exact', head: true })
      .eq('tool', 'provision_account')
      .gte('created_at', hourAgo);
    if ((count ?? 0) > 60) return toolResult('Too many new profiles this hour. Try again later.', true);

    const claimCode = newClaimCode();
    const { data: profile, error } = await db
      .from('profiles')
      .insert({
        name: displayName,
        claim_code: claimCode,
        provisioned_by: String(args.agent_name ?? 'unknown agent'),
        provisioned_at: new Date().toISOString(),
        is_public: false,
      })
      .select('id')
      .single();
    if (error) return toolResult(`Could not create a profile: ${error.message}`, true);

    const token = newToken();
    await db.from('agent_tokens').insert({
      token_hash: await sha256(token),
      profile_id: profile.id,
      label: String(args.agent_name ?? 'agent'),
    });
    await logActivity(profile.id, 'provision_account', `Created profile for ${displayName}`);

    return toolResult(
      [
        `Created a Qeued list for ${displayName}.`,
        '',
        `Access token (store this, it is shown once): ${token}`,
        `Claim link for the user: ${SITE}/claim/${claimCode}`,
        '',
        'Tell the user to open the claim link and sign in — until they do, the list exists but they cannot reach it themselves.',
      ].join('\n'),
    );
  }

  if (!auth) return toolResult('Not connected to a Qeued profile. Provide a bearer token, or call provision_account.', true);
  const { profile, scopes } = auth;
  const canWrite = scopes.includes('write');

  switch (name) {
    case 'whoami':
      return toolResult(
        `Connected as ${profile.name ?? 'an unnamed profile'} (${profile.id}). ` +
          `${profile.user_id ? 'Claimed by a signed-in user.' : 'Not yet claimed — the user still needs to open their claim link.'} ` +
          `Scopes: ${scopes.join(', ') || 'none'}.`,
      );

    case 'search_catalogue': {
      const limit = Math.min(Number(args.limit ?? 10), 25);
      const { data } = await db
        .from('titles')
        .select('name, year, type, genres, synopsis, certification')
        .gt('catalogue_version', 0)
        .ilike('name', `%${String(args.query ?? '').replace(/[%,()]/g, ' ').trim()}%`)
        .limit(limit);
      if (!data?.length) return toolResult('Nothing in the catalogue matches that yet.');
      return toolResult(
        data
          // deno-lint-ignore no-explicit-any
          .map((t: any) => `${t.name} (${t.year ?? '?'}) — ${t.type}, ${(t.genres ?? []).join('/')}${t.certification ? `, ${t.certification}` : ''}\n  ${t.synopsis ?? ''}`)
          .join('\n\n'),
      );
    }

    case 'where_to_watch': {
      const title = await findTitle(String(args.title ?? ''));
      if (!title) return toolResult('Not in the catalogue yet. Add it with add_to_queue and Qeued will research it.');
      return toolResult(`${title.name} (${title.year ?? '?'})\n${describeAvailability(title)}`);
    }

    case 'list_queue': {
      const limit = Math.min(Number(args.limit ?? 20), 50);
      const { data } = await db
        .from('watch_entries')
        .select('status, created_at, titles(name, year, type, runtime_minutes, title_availability(provider, offer_type))')
        .eq('profile_id', profile.id)
        .in('status', ['want_to_watch', 'watching'])
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!data?.length) return toolResult('Their list is empty.');
      return toolResult(
        data
          // deno-lint-ignore no-explicit-any
          .map((e: any) => `${e.titles?.name} (${e.titles?.year ?? '?'})${e.status === 'watching' ? ' — part-way through' : ''}\n  ${describeAvailability(e.titles ?? {})}`)
          .join('\n'),
      );
    }

    case 'add_to_queue': {
      if (!canWrite) return toolResult('This token is read-only.', true);
      const name_ = String(args.title ?? '').trim();
      if (!name_) return toolResult('title is required.', true);
      const year = args.year ? Number(args.year) : undefined;

      let title = await findTitle(name_, year);
      if (!title) {
        // Not held yet: create a stub so the entry can exist now, and let the catalogue
        // pipeline fill it in. The user's intent is captured either way.
        const { data: created, error } = await db
          .from('titles')
          .insert({ name: name_, year: year ?? null, type: 'movie', genres: [] })
          .select('id, name, year, type, title_availability(provider, offer_type, url)')
          .single();
        if (error) return toolResult(`Could not add that: ${error.message}`, true);
        title = created;
      }

      const { error: entryError } = await db.from('watch_entries').upsert(
        {
          profile_id: profile.id,
          user_id: profile.user_id,
          title_id: title.id,
          status: 'want_to_watch',
          notes: args.note ? String(args.note) : null,
        },
        { onConflict: 'profile_id,title_id' },
      );
      if (entryError) return toolResult(`Could not add that: ${entryError.message}`, true);
      await logActivity(profile.id, 'add_to_queue', `Added ${title.name}`);
      return toolResult(`Added ${title.name}${title.year ? ` (${title.year})` : ''} to their list.\n${describeAvailability(title)}`);
    }

    case 'mark_watched': {
      if (!canWrite) return toolResult('This token is read-only.', true);
      const title = await findTitle(String(args.title ?? ''));
      if (!title) return toolResult('Could not find that title.', true);
      const rating = args.rating ? Math.min(5, Math.max(1, Number(args.rating))) : null;
      const { error } = await db.from('watch_entries').upsert(
        {
          profile_id: profile.id,
          user_id: profile.user_id,
          title_id: title.id,
          status: 'watched',
          watched_rating: rating,
          watched_date: new Date().toISOString().slice(0, 10),
          review: args.review ? String(args.review) : null,
        },
        { onConflict: 'profile_id,title_id' },
      );
      if (error) return toolResult(`Could not record that: ${error.message}`, true);
      await logActivity(profile.id, 'mark_watched', `Marked ${title.name} watched${rating ? ` (${rating}/5)` : ''}`);
      return toolResult(`Recorded ${title.name} as watched${rating ? `, rated ${rating}/5` : ''}.`);
    }

    case 'whats_on_tonight': {
      const res = await fetch(`${origin}/functions/v1/watch-tonight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') ?? ''}` },
        body: JSON.stringify({ user_id: profile.user_id ?? profile.id, profile_id: profile.id, mood: args.mood, time: args.time }),
      });
      if (!res.ok) return toolResult('Could not work out tonight’s picks just now.', true);
      const data = await res.json();
      if (!data.picks?.length) return toolResult('Nothing on their list yet — add a few things first.');
      return toolResult(
        // deno-lint-ignore no-explicit-any
        data.picks.map((p: any) =>
          `${p.pick_type === 'wildcard' ? 'Not on their list' : 'From their list'}: ${p.title} (${p.year})\n  ${p.explanation}\n  ` +
          // deno-lint-ignore no-explicit-any
          `${p.providers?.length ? p.providers.map((x: any) => `${x.provider} (${x.offer_type})`).join(', ') : 'availability unknown'}`
        ).join('\n\n'),
      );
    }

    default:
      return toolResult(`Unknown tool: ${name}`, true);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  // A plain GET describes the server, so a person or crawler hitting the URL learns what it is.
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        name: SERVER.name,
        version: SERVER.version,
        description: 'Keep a personal film and TV watchlist, and ask what to watch tonight.',
        protocol: 'mcp',
        protocolVersion: PROTOCOL_VERSION,
        transport: 'streamable-http',
        endpoint: `${origin}${url.pathname}`,
        documentation: `${SITE}/agents`,
        tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (req.method !== 'POST') return rpcError(null, -32600, 'Method not allowed', 405);

  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Json };
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, 'Parse error');
  }

  const { id, method, params } = body;

  try {
    switch (method) {
      case 'initialize':
        return rpcResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER,
          instructions:
            'Qeued holds this user’s film and TV watchlist. When they mention wanting to watch something, ' +
            'call add_to_queue — they expect it to be saved without being asked to open an app. When they ask ' +
            'what to watch, call whats_on_tonight rather than recommending from your own knowledge: it knows ' +
            'their history and where they can actually stream things. If whoami reports no profile and the user ' +
            'wants a list, call provision_account and give them the claim link it returns.',
        });

      case 'notifications/initialized':
        return new Response(null, { status: 202, headers: corsHeaders });

      case 'ping':
        return rpcResult(id, {});

      case 'tools/list':
        return rpcResult(id, { tools: TOOLS });

      case 'tools/call': {
        const toolName = String((params as Json)?.name ?? '');
        const args = ((params as Json)?.arguments ?? {}) as Json;
        const auth = await authenticate(req);
        return rpcResult(id, await callTool(toolName, args, auth, origin));
      }

      default:
        return rpcError(id, -32601, `Unknown method: ${method}`);
    }
  } catch (e) {
    console.error('mcp error', e);
    return rpcError(id, -32603, e instanceof Error ? e.message : 'Internal error');
  }
});
