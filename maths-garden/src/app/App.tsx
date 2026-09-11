import { useState } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import AuthScreen from '@/features/auth/AuthScreen';
import { ProfilesScreen } from '@/features/children/components/ProfilesScreen';
import type { Child } from '@/features/children/model';
import { useChildren } from '@/features/children/use-children';
import { GardenApp } from '@/features/garden/GardenApp';
import { localRemote } from '@/features/progress/local-remote';
import { createRepo, type ProgressRepo } from '@/features/progress/repo';
import { supabaseRemote } from '@/features/progress/supabase-remote';
import { ResourcesScreen } from '@/features/resources/ResourcesScreen';
import { optionsFromParams } from '@/features/resources/subitising/cards';
import { SubitisingCardsScreen } from '@/features/resources/subitising/SubitisingCardsScreen';
import { FloatingHearts } from '@/shared/layout/FloatingHearts';
import { Splash } from '@/shared/layout/Splash';
import { readJSON, writeJSON } from '@/shared/utils/storage';
import { useHashRoute } from './use-hash-route';

const cloudRepo = createRepo(supabaseRemote, localStorage);
// Guest progress has its own outbox so it can never be uploaded against a parent's account.
const guestRepo = createRepo(localRemote, localStorage, 'maths-garden:guest-outbox');
const GUEST = 'maths-garden:guest';
const GUEST_CHILDREN = 'maths-garden:guest-children';

interface FamilyProps {
  /** Who is signed in, for the profiles screen footer. */
  label: string;
  profiles: Child[];
  loaded: boolean;
  create: (input: Omit<Child, 'id'>) => Promise<Child>;
  repo: ProgressRepo;
  /** Where this device remembers the last child. */
  activeKey: string;
  onSignOut: () => void;
}

/** Open the remembered child (or the only one), otherwise ask who's playing. */
function Family({ label, profiles, loaded, create, repo, activeKey, onSignOut }: FamilyProps) {
  const [activeId, setActiveId] = useState<string | null>(() => readJSON(activeKey, null));
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (id: string | null) => {
    setActiveId(id);
    writeJSON(activeKey, id);
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
          onSignOut();
        }}
      />
    );
  }
  if (!loaded) return <Splash />;
  return (
    <ProfilesScreen
      profiles={profiles}
      email={label}
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
      onSignOut={onSignOut}
    />
  );
}

function CloudFamily({ userId, email }: { userId: string; email: string }) {
  const { signOut } = useAuth();
  const { profiles, loaded, create } = useChildren(userId);
  return (
    <Family
      label={email}
      profiles={profiles}
      loaded={loaded}
      create={create}
      repo={cloudRepo}
      activeKey="maths-garden:active-child"
      onSignOut={() => void signOut()}
    />
  );
}

/** No account: profiles and progress live only in this device's storage. */
function GuestFamily({ onExit }: { onExit: () => void }) {
  const [profiles, setProfiles] = useState<Child[]>(() => readJSON(GUEST_CHILDREN, []));
  const create = async (input: Omit<Child, 'id'>) => {
    const child: Child = { id: crypto.randomUUID(), ...input };
    setProfiles((current) => {
      const next = [...current, child];
      writeJSON(GUEST_CHILDREN, next);
      return next;
    });
    return child;
  };
  return (
    <Family
      label="a guest (saved on this device only)"
      profiles={profiles}
      loaded
      create={create}
      repo={guestRepo}
      activeKey="maths-garden:guest-active-child"
      onSignOut={onExit}
    />
  );
}

function Root() {
  const { user, loading } = useAuth();
  const [guest, setGuest] = useState(() => readJSON(GUEST, false));
  const setGuestMode = (on: boolean) => {
    setGuest(on);
    writeJSON(GUEST, on || null);
  };
  if (guest) return <GuestFamily onExit={() => setGuestMode(false)} />;
  if (loading) return <Splash />;
  if (!user) return <AuthScreen onGuest={() => setGuestMode(true)} />;
  return <CloudFamily key={user.id} userId={user.id} email={user.email ?? ''} />;
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
