import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Root decides, for every open of the app, which of four things a person sees. It has broken twice:
 * the guest flag was checked before the signed-in user, so a live session rendered the guest app; and
 * it was checked before the route, so #/login could not be reached at all from a device that had ever
 * tapped guest mode — the sign-in form simply was not there.
 *
 * Neither failure could be caught below this level, and both shipped green.
 */
const getSession = vi.fn();
const onAuthStateChange = vi.fn((_cb: unknown) => ({ data: { subscription: { unsubscribe: vi.fn() } } }));

vi.mock('@/shared/supabase/client', () => ({
  cloudConfigured: true,
  supabase: {
    auth: {
      getSession: () => getSession(),
      onAuthStateChange: (cb: unknown) => onAuthStateChange(cb as never),
      signOut: vi.fn(),
    },
  },
}));

// The children hook talks to the server; the routing decision is what is under test, not the fetch.
vi.mock('@/features/children/use-children', () => ({
  useChildren: () => ({ profiles: [{ id: 'child-1', name: 'Tara', avatar: '🦄' }], loaded: true, create: vi.fn() }),
}));

const signedIn = { data: { session: { user: { id: 'user-1', email: 'nick@example.com' } } } };
const signedOut = { data: { session: null } };

const open = async (hash: string) => {
  window.location.hash = hash;
  const { default: App } = await import('./App');
  render(<App />);
};

describe('which screen an open of the app lands on', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    getSession.mockResolvedValue(signedOut);
  });
  afterEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('shows the sign-in form at #/login', async () => {
    await open('#/login');
    await waitFor(() => expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument());
  });

  it('still shows the sign-in form at #/login when guest mode was tapped before', async () => {
    // The exact state that made signing in impossible: the flag is sticky, and it used to win the route.
    localStorage.setItem('maths-garden:guest', 'true');
    await open('#/login');
    await waitFor(() => expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument());
  });

  it('prefers a live session over the guest flag', async () => {
    localStorage.setItem('maths-garden:guest', 'true');
    getSession.mockResolvedValue(signedIn);
    await open('#/app');
    // The signed-in app renders the child's garden, never the guest one.
    await waitFor(() => expect(screen.queryByText(/Guest mode/i)).not.toBeInTheDocument());
  });

  it('gives a signed-out visitor the homepage, not the app', async () => {
    await open('#/home');
    await waitFor(() => expect(screen.queryByPlaceholderText(/email/i)).not.toBeInTheDocument());
  });
});
