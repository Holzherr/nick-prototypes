import { describe, expect, it, vi } from 'vitest';
import { captureLinkProblem, clearLinkProblem, takeLinkProblem } from './link-problem';

const at = (hash: string) => {
  const replaceState = vi.fn();
  const win = { location: { hash, pathname: '/maths/', search: '' }, history: { replaceState } } as unknown as Window;
  return { win, replaceState };
};

describe('a refused email link', () => {
  it('explains an expired or reused link and sends the visitor to sign in', () => {
    const { win, replaceState } = at('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');
    expect(captureLinkProblem(win)).toMatch(/expired or was already used/);
    expect(replaceState).toHaveBeenCalledWith(null, '', '/maths/#/login');
    expect(takeLinkProblem()).toMatch(/expired/);
    clearLinkProblem();
    expect(takeLinkProblem()).toBeNull();
  });

  it('survives the reload a first visit gets when the offline worker takes over', async () => {
    const { win } = at('#error=access_denied&error_code=otp_expired');
    captureLinkProblem(win);
    vi.resetModules(); // a fresh page load: module memory gone, sessionStorage kept
    const fresh = await import('./link-problem');
    expect(fresh.takeLinkProblem()).toMatch(/expired/);
    fresh.clearLinkProblem();
  });

  it('passes on what Supabase said for any other failure', () => {
    const { win } = at('#error=server_error&error_description=Database+error');
    expect(captureLinkProblem(win)).toMatch(/\(Database error\)/);
  });

  it('leaves ordinary routes and successful sign-ins alone', () => {
    for (const hash of ['#/home', '#/resources/sheet?id=x&name=Tara', '#access_token=a&refresh_token=b&type=signup']) {
      const { win, replaceState } = at(hash);
      expect(captureLinkProblem(win)).toBeNull();
      expect(replaceState).not.toHaveBeenCalled();
    }
  });
});
