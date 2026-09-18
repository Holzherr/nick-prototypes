import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/supabase/client', () => ({ cloudConfigured: true }));

const { googleEnabled } = await import('./providers');
const answer = (body: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, json: async () => body }) as unknown as typeof fetch;

describe('whether to offer Google sign-in', () => {
  it('follows the provider switch in Supabase', async () => {
    expect(await googleEnabled(answer({ external: { google: true } }))).toBe(true);
    expect(await googleEnabled(answer({ external: { google: false } }))).toBe(false);
  });

  it('hides the button when the answer is missing or the request fails', async () => {
    expect(await googleEnabled(answer({}, false))).toBe(false);
    expect(await googleEnabled(vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch)).toBe(false);
  });
});
