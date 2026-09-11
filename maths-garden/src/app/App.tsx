import { useState } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import AuthScreen from '@/features/auth/AuthScreen';
import { ProfilesScreen } from '@/features/children/components/ProfilesScreen';
import { useChildren } from '@/features/children/use-children';
import { GardenApp } from '@/features/garden/GardenApp';
import { createRepo } from '@/features/progress/repo';
import { supabaseRemote } from '@/features/progress/supabase-remote';
import { ResourcesScreen } from '@/features/resources/ResourcesScreen';
import { optionsFromParams } from '@/features/resources/subitising/cards';
import { SubitisingCardsScreen } from '@/features/resources/subitising/SubitisingCardsScreen';
import { FloatingHearts } from '@/shared/layout/FloatingHearts';
import { Splash } from '@/shared/layout/Splash';
import { readJSON, writeJSON } from '@/shared/utils/storage';
import { useHashRoute } from './use-hash-route';

const repo = createRepo(supabaseRemote, localStorage);
const ACTIVE_CHILD = 'maths-garden:active-child';

/** Signed in: open the remembered child (or the only one), otherwise ask who's playing. */
function Family({ userId, email }: { userId: string; email: string }) {
  const { signOut } = useAuth();
  const { profiles, loaded, create } = useChildren(userId);
  const [activeId, setActiveId] = useState<string | null>(() => readJSON(ACTIVE_CHILD, null));
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (id: string | null) => {
    setActiveId(id);
    writeJSON(ACTIVE_CHILD, id);
    setChoosing(false);
  };

  const active = choosing ? undefined : (profiles.find((c) => c.id === activeId) ?? (profiles.length === 1 ? profiles[0] : undefined));

  if (active) {
    return (
      <GardenApp
        key={active.id}
        child={active}
        repo={repo}
        onSwitchChild={() => setChoosing(true)}
        onSignOut={() => {
          open(null);
          void signOut();
        }}
      />
    );
  }
  if (!loaded) return <Splash />;
  return (
    <ProfilesScreen
      profiles={profiles}
      email={email}
      busy={busy}
      error={error}
      onPick={(child) => open(child.id)}
      onCreate={async (input) => {
        setBusy(true);
        setError(null);
        try {
          const child = await create(input);
          open(child.id);
          return true;
        } catch (err) {
          setError((err as { message?: string }).message ?? 'Could not save the profile.');
          return false;
        } finally {
          setBusy(false);
        }
      }}
      onSignOut={() => void signOut()}
    />
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <AuthScreen />;
  return <Family key={user.id} userId={user.id} email={user.email ?? ''} />;
}

export default function App() {
  const { path, params } = useHashRoute();
  if (path.startsWith('/resources')) {
    return (
      <>
        <FloatingHearts />
        {path === '/resources/subitising-cards' ? <SubitisingCardsScreen key={params.toString()} initial={optionsFromParams(params)} /> : <ResourcesScreen />}
      </>
    );
  }
  return (
    <AuthProvider>
      <FloatingHearts />
      <Root />
    </AuthProvider>
  );
}
