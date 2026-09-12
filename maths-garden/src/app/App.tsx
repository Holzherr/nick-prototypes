import { useState } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import AuthScreen from '@/features/auth/AuthScreen';
import { ProfilesScreen } from '@/features/children/components/ProfilesScreen';
import type { Child } from '@/features/children/model';
import { useChildren } from '@/features/children/use-children';
import { isGameId, type GameId } from '@/features/games/catalog';
import { GardenApp } from '@/features/garden/GardenApp';
import { articleBySlug } from '@/features/marketing/articles';
import { ArticleScreen } from '@/features/marketing/components/ArticleScreen';
import { HomeScreen } from '@/features/marketing/components/HomeScreen';
import { MarketingLayout } from '@/features/marketing/components/MarketingLayout';
import { DiagnosticsScreen } from '@/features/progress/components/DiagnosticsScreen';
import { localRemote } from '@/features/progress/local-remote';
import { createRepo, type ProgressRepo } from '@/features/progress/repo';
import { supabaseRemote } from '@/features/progress/supabase-remote';
import { packFromParams } from '@/features/resources/pack';
import { PackScreen } from '@/features/resources/PackScreen';
import { ResourcesScreen } from '@/features/resources/ResourcesScreen';
import { sheetOptionsFromParams } from '@/features/resources/sheets/catalog';
import { SheetScreen } from '@/features/resources/sheets/SheetScreen';
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
  /** Signed in: the grown-ups screen offers to bring guest-mode play into the account. */
  allowGuestImport?: boolean;
  /** No account: the grown-ups screen offers signing in rather than signing out. */
  guestMode?: boolean;
  /** Opened from a QR code on a printable: start this game straight away. */
  startGame?: GameId;
  /** The signed-in parent's address, for emailed tutor reports. */
  parentEmail?: string;
  onSignOut: () => void;
}

/** Open the remembered child (or the only one), otherwise ask who's playing. */
function Family({ label, profiles, loaded, create, repo, activeKey, allowGuestImport, guestMode, startGame, parentEmail, onSignOut }: FamilyProps) {
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
        allowGuestImport={allowGuestImport}
        guestMode={guestMode}
        startGame={startGame}
        parentEmail={parentEmail}
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

function CloudFamily({ userId, email, startGame }: { userId: string; email: string; startGame?: GameId }) {
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
      allowGuestImport
      startGame={startGame}
      parentEmail={email}
      onSignOut={() => void signOut()}
    />
  );
}

/** No account: profiles and progress live only in this device's storage. */
function GuestFamily({ onExit, startGame }: { onExit: () => void; startGame?: GameId }) {
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
      guestMode
      startGame={startGame}
      onSignOut={onExit}
    />
  );
}

/**
 * Signed in — or already playing as a guest — the app opens straight into the child's garden wherever they
 * landed, which is what the iPad's home-screen icon does. A signed-out visitor gets the homepage instead,
 * unless they asked for the app or the sign-in page.
 */
function Root({ startGame, wantsApp, wantsLogin }: { startGame?: GameId; wantsApp: boolean; wantsLogin: boolean }) {
  const { user, loading } = useAuth();
  const [guest, setGuest] = useState(() => readJSON(GUEST, false));
  const setGuestMode = (on: boolean) => {
    setGuest(on);
    writeJSON(GUEST, on || null);
  };
  // A live session wins over the guest flag. That flag is sticky: tapping "carry on without an account"
  // once left it set for good, so every later open rendered the guest app even with an account signed in
  // underneath — no account name on the grown-ups screen, and no offer to bring the play across, because
  // GuestFamily passes allowGuestImport={false}. Nothing is lost by preferring the account: GardenApp
  // offers the guest play on the way in. The cost is that a guest waits on the session check, a local read.
  if (loading) return <Splash />;
  if (user) return <CloudFamily key={user.id} userId={user.id} email={user.email ?? ''} startGame={startGame} />;
  // Asking for #/login is asking for the sign-in form, so it beats the flag too. While the flag swallowed
  // that route the form could not be reached at all: the only way back to it was "Sign in to save →" on
  // the grown-ups screen, behind the sum — which is the last place a parent looking to sign in would look.
  if (guest && !wantsLogin) return <GuestFamily onExit={() => setGuestMode(false)} startGame={startGame} />;
  if (wantsApp) return <AuthScreen onGuest={() => setGuestMode(true)} />;
  return (
    <MarketingLayout>
      <HomeScreen />
    </MarketingLayout>
  );
}

function Printables({ path, params }: { path: string; params: URLSearchParams }) {
  if (path === '/resources/subitising-cards') return <SubitisingCardsScreen key={params.toString()} initial={optionsFromParams(params)} />;
  if (path === '/resources/sheet') return <SheetScreen key={params.toString()} initial={sheetOptionsFromParams(params)} />;
  if (path === '/resources/pack') return <PackScreen key={params.toString()} options={packFromParams(params)} />;
  return <ResourcesScreen />;
}

export default function App() {
  const { path, params } = useHashRoute();
  if (path.startsWith('/resources')) {
    return (
      <>
        <FloatingHearts />
        <Printables path={path} params={params} />
      </>
    );
  }
  // Public on purpose, and above AuthProvider: the moment this screen is needed most is when signing in is
  // the thing that is broken, or when a device is stuck on an old build and nothing on it says so.
  if (path === '/diagnostics') {
    return (
      <>
        <FloatingHearts />
        <DiagnosticsScreen />
      </>
    );
  }
  // The public pages need no account, so they never wait on a session.
  if (path === '/home' || path.startsWith('/guides')) {
    const article = articleBySlug(path.replace('/guides/', ''));
    return (
      <>
        <FloatingHearts />
        <MarketingLayout>{article ? <ArticleScreen article={article} /> : <HomeScreen />}</MarketingLayout>
      </>
    );
  }
  // #/play/count — the QR code on a printable opens the game that checks the same skill.
  const asked = path.startsWith('/play/') ? path.slice('/play/'.length) : '';
  return (
    <AuthProvider>
      <FloatingHearts />
      <Root
        startGame={isGameId(asked) ? asked : undefined}
        wantsApp={path === '/login' || path === '/app' || path === '/grown-ups' || path.startsWith('/play/')}
        wantsLogin={path === '/login'}
      />
    </AuthProvider>
  );
}
