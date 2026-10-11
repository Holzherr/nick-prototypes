// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { burnCode, pkceChallengeFor, redirectAllowed } from '../../supabase/functions/_shared/oauth.ts';

describe('pkceChallengeFor', () => {
  it('matches the S256 example in RFC 7636 appendix B', async () => {
    expect(await pkceChallengeFor('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });
});

describe('redirectAllowed', () => {
  it('takes https anywhere and http only on loopback', () => {
    expect(redirectAllowed('https://claude.ai/api/mcp/auth_callback')).toBe(true);
    expect(redirectAllowed('http://localhost:6274/callback')).toBe(true);
    expect(redirectAllowed('http://127.0.0.1:33418/')).toBe(true);
    expect(redirectAllowed('http://[::1]:8080/cb')).toBe(true);
  });
  it('refuses plain http elsewhere, custom schemes and junk', () => {
    expect(redirectAllowed('http://evil.example/cb')).toBe(false);
    expect(redirectAllowed('http://localhost.evil.example/cb')).toBe(false);
    expect(redirectAllowed('javascript:alert(1)')).toBe(false);
    expect(redirectAllowed('not a url')).toBe(false);
  });
});

describe('burnCode', () => {
  /** An oauth_codes table with PostgREST's update semantics: no match is not an error. */
  const codesDb = () => {
    const usedAt = new Map<string, string | null>([['abc', null]]);
    return {
      from: () => {
        let patch: { used_at: string } = { used_at: '' };
        let code = '';
        const q = {
          update: (p: { used_at: string }) => { patch = p; return q; },
          eq: (_c: string, v: string) => { code = v; return q; },
          is: () => q,
          select: async () => {
            if (!usedAt.has(code) || usedAt.get(code) !== null) return { data: [], error: null };
            usedAt.set(code, patch.used_at);
            return { data: [{ code }], error: null };
          },
        };
        return q;
      },
    };
  };

  it('lets exactly one of two racing exchanges through', async () => {
    const db = codesDb();
    const results = await Promise.all([burnCode(db, 'abc'), burnCode(db, 'abc')]);
    expect(results.filter((r) => r.burned)).toHaveLength(1);
  });

  it('refuses a code that does not exist', async () => {
    expect(await burnCode(codesDb(), 'nope')).toEqual({ burned: false });
  });
});
