import { possessive } from '@/features/children/model';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { GuestProfile } from '../guest';

export interface ImportPromptScreenProps {
  childName: string;
  childAvatar: string;
  profiles: readonly GuestProfile[];
  busy?: boolean;
  /** Set once an import has finished. */
  imported?: { name: string; rounds: number; stickers: number } | null;
  onImport: (profile: GuestProfile) => void;
  /** Skip for now; the offer stays on the grown-ups screen. */
  onSkip: () => void;
  /** Carry on into the garden after the confirmation. */
  onDone: () => void;
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : null);

/**
 * Shown the first time a signed-in parent opens a child whose device still has guest play on it — before
 * the garden, not behind the grown-ups sum. Guest progress is invisible once you sign in (it belongs to a
 * different child id), so without this it looks exactly like the app lost it.
 */
export function ImportPromptScreen({ childName, childAvatar, profiles, busy = false, imported = null, onImport, onSkip, onDone }: ImportPromptScreenProps) {
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[520px]">
        {imported ? (
          <>
            <p className="text-center text-6xl">✓</p>
            <h1 className="mt-3 text-center text-3xl font-bold text-raspberry">Safe and sound</h1>
            <p className="mt-2 text-center text-grape/80">
              {imported.rounds} round{imported.rounds === 1 ? '' : 's'} and {imported.stickers} sticker{imported.stickers === 1 ? '' : 's'} are now on{' '}
              {possessive(childName)} account. They will sync to your other devices, and nothing is left only on this iPad.
            </p>
            <Button size="lg" className="mt-7 w-full" onClick={onDone}>
              Let’s play {childAvatar}
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-6xl">🧳</p>
            <h1 className="mt-3 text-center text-3xl font-bold text-raspberry">There’s play saved on this iPad</h1>
            <p className="mt-2 text-center text-grape/80">
              It was played without an account, so it is on this device only — and it will not show up in {possessive(childName)} garden until it is brought
              across. Nothing is lost either way, and adding it twice changes nothing.
            </p>

            <ul className="mt-5 flex flex-col gap-3">
              {profiles.map((profile) => (
                <li key={profile.child.id} className="rounded-[24px] bg-blush/70 p-4">
                  <b className="text-lg">
                    {profile.child.avatar} {profile.child.name}
                  </b>
                  <p className="text-sm text-grape/75">
                    {profile.rounds} round{profile.rounds === 1 ? '' : 's'} on {profile.days} day{profile.days === 1 ? '' : 's'} · {profile.stickers} sticker
                    {profile.stickers === 1 ? '' : 's'}
                    {when(profile.lastPlayed) ? ` · last played ${when(profile.lastPlayed)}` : ''}
                  </p>
                  <Button size="md" className="mt-3 w-full" disabled={busy} onClick={() => onImport(profile)}>
                    {busy ? 'Adding…' : `Add to ${possessive(childName)} garden`}
                  </Button>
                </li>
              ))}
            </ul>

            <Button variant="ghost" size="md" className="mt-4 w-full" disabled={busy} onClick={onSkip}>
              Not now
            </Button>
            <p className="mt-1 text-center text-xs text-grape/55">You can do it later from ⚙️ Grown-ups. It stays on the device until you do.</p>
          </>
        )}
      </Card>
    </div>
  );
}
