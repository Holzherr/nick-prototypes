import { serviceClient } from '../_shared/db.ts';

/**
 * OAuth 2.1 for the MCP server, so an assistant connects with a button.
 *
 * Routes under /functions/v1/oauth:
 *   POST /register   Dynamic client registration (RFC 7591) — MCP clients enrol themselves
 *   GET  /authorize  Hands the user to the approval screen on qeued.com
 *   POST /token      Exchanges a one-time code plus PKCE verifier for an access token
 *   GET  /metadata   Authorization server metadata, also published as a static file
 *
 * Clients are public: an MCP client running on someone's laptop cannot keep a secret, so
 * PKCE is the only thing standing between an intercepted code and a working token, and it
 * is required rather than optional. The token handed back is an ordinary agent_tokens row —
 * this adds a way to obtain a credential, not a second kind of credential.
 */

const SITE = 'https://qeued.com';
const SELF = 'https://piwfcsvnxcmxmvfhgtbk.supabase.co/functions/v1/oauth';
const MCP_ENDPOINT = 'https://piwfcsvnxcmxmvfhgtbk.supabase.co/functions/v1/mcp';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, mcp-protocol-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const oauthError = (error: string, description: string, status = 400) =>
  json({ error, error_description: description }, status);

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

/** PKCE S256: base64url of the SHA-256 digest, compared against the stored challenge. */
const pkceChallengeFor = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const newToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const base64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `qeu_${base64}`;
};

const metadata = {
  issuer: SITE,
  authorization_endpoint: `${SELF}/authorize`,
  token_endpoint: `${SELF}/token`,
  registration_endpoint: `${SELF}/register`,
  scopes_supported: ['read', 'write'],
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
  service_documentation: `${SITE}/agents`,
};

/** Only http(s) redirects, and loopback for desktop clients. Nothing else is accepted. */
const redirectAllowed = (uri: string): boolean => {
  try {
    const url = new URL(uri);
    if (url.protocol === 'https:') return true;
    // Desktop MCP clients listen on localhost; http is unavoidable and safe there.
    return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  } catch {
    return false;
  }
};

// deno-lint-ignore no-explicit-any
const db = () => serviceClient() as any;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  // The platform strips the /functions/v1 prefix before the function sees it, and a direct
  // invocation keeps it, so tolerate both.
  const route = url.pathname.replace(/^(\/functions\/v1)?\/oauth/, '').replace(/\/$/, '') || '/';

  // Registration: an MCP client announces itself and gets an id. No secret is issued.
  if (route === '/register' && req.method === 'POST') {
    let body: { client_name?: string; redirect_uris?: string[] };
    try {
      body = await req.json();
    } catch {
      return oauthError('invalid_client_metadata', 'Body must be JSON');
    }

    const redirects = (body.redirect_uris ?? []).filter((uri) => typeof uri === 'string');
    if (!redirects.length) return oauthError('invalid_redirect_uri', 'At least one redirect_uri is required');
    const rejected = redirects.filter((uri) => !redirectAllowed(uri));
    if (rejected.length) return oauthError('invalid_redirect_uri', `Not accepted: ${rejected.join(', ')}`);

    const clientId = `qc_${crypto.randomUUID().replace(/-/g, '')}`;
    const { error } = await db().from('oauth_clients').insert({
      client_id: clientId,
      client_name: String(body.client_name ?? 'An assistant').slice(0, 120),
      redirect_uris: redirects,
    });
    if (error) return oauthError('server_error', error.message, 500);

    return json(
      {
        client_id: clientId,
        client_name: body.client_name ?? 'An assistant',
        redirect_uris: redirects,
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code'],
        response_types: ['code'],
      },
      201,
    );
  }

  // Approval happens in the app, where the user is (or can be) signed in. This endpoint
  // only validates the request before handing over, so a bad client never reaches a screen
  // that looks like consent.
  if (route === '/authorize' && req.method === 'GET') {
    const params = url.searchParams;
    const clientId = params.get('client_id') ?? '';
    const redirectUri = params.get('redirect_uri') ?? '';
    const challenge = params.get('code_challenge') ?? '';

    if (params.get('response_type') !== 'code') return oauthError('unsupported_response_type', 'Only code is supported');
    if (!challenge || params.get('code_challenge_method') !== 'S256') {
      return oauthError('invalid_request', 'PKCE with S256 is required');
    }

    const { data: client } = await db()
      .from('oauth_clients')
      .select('client_id, client_name, redirect_uris')
      .eq('client_id', clientId)
      .maybeSingle();
    if (!client) return oauthError('invalid_client', 'Unknown client_id');
    if (!client.redirect_uris.includes(redirectUri)) {
      return oauthError('invalid_redirect_uri', 'redirect_uri was not registered for this client');
    }

    const consent = new URL(`${SITE}/connect`);
    for (const key of ['client_id', 'redirect_uri', 'state', 'code_challenge', 'scope']) {
      const value = params.get(key);
      if (value) consent.searchParams.set(key, value);
    }
    return new Response(null, { status: 302, headers: { ...corsHeaders, Location: consent.toString() } });
  }

  // Code for token. The code is single-use, short-lived, and bound to both the redirect URI
  // and the PKCE verifier.
  if (route === '/token' && req.method === 'POST') {
    const form = new URLSearchParams(
      req.headers.get('content-type')?.includes('application/json')
        ? Object.entries(await req.json()).map(([k, v]) => [k, String(v)])
        : await req.text(),
    );

    if (form.get('grant_type') !== 'authorization_code') {
      return oauthError('unsupported_grant_type', 'Only authorization_code is supported');
    }
    const code = form.get('code') ?? '';
    const verifier = form.get('code_verifier') ?? '';
    const clientId = form.get('client_id') ?? '';
    const redirectUri = form.get('redirect_uri') ?? '';
    if (!code || !verifier) return oauthError('invalid_request', 'code and code_verifier are required');

    const { data: row } = await db()
      .from('oauth_codes')
      .select('code, client_id, profile_id, redirect_uri, code_challenge, scopes, expires_at, used_at')
      .eq('code', code)
      .maybeSingle();

    if (!row) return oauthError('invalid_grant', 'Unknown code');
    if (row.used_at) return oauthError('invalid_grant', 'That code has already been used');
    if (new Date(row.expires_at) < new Date()) return oauthError('invalid_grant', 'That code has expired');
    if (row.client_id !== clientId) return oauthError('invalid_grant', 'Code was issued to a different client');
    if (redirectUri && row.redirect_uri !== redirectUri) return oauthError('invalid_grant', 'redirect_uri does not match');
    if ((await pkceChallengeFor(verifier)) !== row.code_challenge) {
      return oauthError('invalid_grant', 'code_verifier does not match the challenge');
    }

    // Burn the code before minting anything, so a race cannot yield two tokens.
    const { error: burnError } = await db()
      .from('oauth_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('code', code)
      .is('used_at', null);
    if (burnError) return oauthError('server_error', burnError.message, 500);

    const { data: client } = await db().from('oauth_clients').select('client_name').eq('client_id', clientId).maybeSingle();

    const token = newToken();
    const { error } = await db().from('agent_tokens').insert({
      token_hash: await sha256(token),
      profile_id: row.profile_id,
      label: client?.client_name ?? 'An assistant',
      scopes: row.scopes ?? ['read', 'write'],
      client_id: clientId,
    });
    if (error) return oauthError('server_error', error.message, 500);

    await db().from('oauth_clients').update({ last_used_at: new Date().toISOString() }).eq('client_id', clientId);

    return json({
      access_token: token,
      token_type: 'Bearer',
      scope: (row.scopes ?? ['read', 'write']).join(' '),
    });
  }

  if ((route === '/metadata' || route === '/') && req.method === 'GET') {
    return json({ ...metadata, resource: MCP_ENDPOINT });
  }

  return oauthError('invalid_request', `Nothing at ${route}`, 404);
});
