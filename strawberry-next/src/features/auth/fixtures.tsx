import type { Session, User } from '@supabase/supabase-js';
import { AuthContext, type AuthState } from './AuthContext';

/** Invented — nick-prototypes is public, so no real account ever appears in a story or test. */
export const signedOutAuth: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
};

export const signedInAuth: AuthState = {
  ...signedOutAuth,
  user: { id: 'u_demo', email: 'sam@example.com', user_metadata: {} } as unknown as User,
  session: {} as Session,
  profile: {
    id: 'u_demo',
    display_name: 'Sam Reyes',
    avatar_url: null,
    bio: 'Cooks too much pasta.',
    handle: 'sam',
  },
};

/** Storybook decorator: hands a component a fixed auth state instead of a live Supabase session. */
export const withAuth =
  (state: AuthState = signedOutAuth) =>
  (Story: React.ComponentType) => (
    <AuthContext.Provider value={state}>
      <Story />
    </AuthContext.Provider>
  );
