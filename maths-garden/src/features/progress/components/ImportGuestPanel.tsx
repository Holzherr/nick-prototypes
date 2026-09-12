import { Button } from '@/shared/components/ui/button';
import type { GuestProfile } from '../guest';

export interface ImportGuestPanelProps {
  /** The account child the progress would be added to. */
  childName: string;
  profiles: readonly GuestProfile[];
  busy?: boolean;
  /** Set once an import has finished, for the confirmation line. */
  imported?: { name: string; rounds: number; stickers: number } | null;
  onImport: (profile: GuestProfile) => void;
  onDismiss: () => void;
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : null);

/**
 * Sunny panel on the grown-ups screen when guest-mode play is still sitting on this device: what was
 * played, and one button per guest profile to copy it onto the signed-in child. Importing twice is safe.
 */
export function ImportGuestPanel({ childName, profiles, busy = false, imported = null, onImport, onDismiss }: ImportGuestPanelProps) {
  if (imported) {
    return (
      <section className="mt-6 rounded-[28px] bg-leaf/15 p-5">
        <h3 className="text-2xl font-semibold text-leaf-deep">✓ Guest progress added</h3>
        <p className="mt-1 text-sm text-grape/80">
          {imported.rounds} round{imported.rounds === 1 ? '' : 's'} and {imported.stickers} sticker{imported.stickers === 1 ? '' : 's'} from {imported.name}’s guest
          play are now on {childName}’s account and uploading. The guest copy stays on this iPad until you sign out of guest mode.
        </p>
      </section>
    );
  }
  if (!profiles.length) return null;

  return (
    <section className="mt-6 rounded-[28px] bg-sunny/25 p-5">
      <h3 className="text-2xl font-semibold text-raspberry">Guest progress on this iPad</h3>
      <p className="mt-1 text-sm text-grape/80">
        Play from guest mode is saved on the device only. Add it to {childName}’s account so it syncs and is safe if the iPad is cleared.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {profiles.map((profile) => (
          <li key={profile.child.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
            <span className="text-sm">
              <b className="text-base">
                {profile.child.avatar} {profile.child.name}
              </b>
              <span className="block text-grape/70">
                {profile.rounds} round{profile.rounds === 1 ? '' : 's'} on {profile.days} day{profile.days === 1 ? '' : 's'} · {profile.stickers} sticker
                {profile.stickers === 1 ? '' : 's'}
                {when(profile.lastPlayed) ? ` · last played ${when(profile.lastPlayed)}` : ''}
              </span>
            </span>
            <Button size="sm" disabled={busy} onClick={() => onImport(profile)}>
              {busy ? 'Adding…' : `Add to ${childName}’s account`}
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2" onClick={onDismiss}>
        Not now
      </Button>
    </section>
  );
}
