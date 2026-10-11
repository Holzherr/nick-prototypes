/**
 * The OAuth checks the token endpoint relies on, kept free of Deno globals so vitest can
 * load them directly.
 */

/** PKCE S256: base64url of the SHA-256 digest, compared against the stored challenge. */
export const pkceChallengeFor = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/** Only https redirects, and http on loopback for desktop clients. Nothing else is accepted. */
export const redirectAllowed = (uri: string): boolean => {
  try {
    const url = new URL(uri);
    if (url.protocol === 'https:') return true;
    // Desktop MCP clients listen on localhost; http is unavoidable and safe there.
    return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  } catch {
    return false;
  }
};

/**
 * Marks a code used, and says whether this call is the one that did. Two exchanges racing
 * on one code both pass the earlier used_at read; only the update that matched the unused
 * row may mint a token. An update matching nothing is not an error to PostgREST, so the
 * row has to be asked back for.
 */
export const burnCode = async (
  // deno-lint-ignore no-explicit-any
  db: { from: (table: string) => any },
  code: string,
  now = new Date(),
): Promise<{ burned: boolean; error?: string }> => {
  const { data, error } = await db
    .from('oauth_codes')
    .update({ used_at: now.toISOString() })
    .eq('code', code)
    .is('used_at', null)
    .select('code');
  if (error) return { burned: false, error: error.message };
  return { burned: Array.isArray(data) && data.length === 1 };
};
