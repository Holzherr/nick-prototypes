import type { GuestProfile } from '@/features/progress/guest';
import { Button } from '@/shared/components/ui/button';

export interface GuestDataPanelProps {
  profiles: readonly GuestProfile[];
  /** Go back into guest mode and carry on with this play. */
  onContinueAsGuest: () => void;
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : null);

/**
 * Shown on the sign-in card when this device has guest play on it. Signing in opens an account child with
 * no history, so without this the play looks deleted at exactly the moment you are least sure of anything.
 * There is no import button here on purpose: until you are signed in there is no child to import into, so
 * this says where the play is and the app offers to move it the moment there is somewhere to put it.
 */
export function GuestDataPanel({ profiles, onContinueAsGuest }: GuestDataPanelProps) {
  if (!profiles.length) return null;
  const rounds = profiles.reduce((sum, p) => sum + p.rounds, 0);
  const stickers = profiles.reduce((sum, p) => sum + p.stickers, 0);

  return (
    <section className="mt-6 rounded-[24px] bg-sunny/25 p-4 text-left">
      <h2 className="text-lg font-semibold text-raspberry">📱 Play saved on this device</h2>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-grape/85">
        {profiles.map((profile) => (
          <li key={profile.child.id}>
            <b>
              {profile.child.avatar} {profile.child.name}
            </b>{' '}
            — {profile.rounds} round{profile.rounds === 1 ? '' : 's'}, {profile.stickers} sticker{profile.stickers === 1 ? '' : 's'}
            {when(profile.lastPlayed) ? `, last played ${when(profile.lastPlayed)}` : ''}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-grape/80">
        <b>Signing in does not touch it.</b> Once you are in, the app offers to add {rounds} round{rounds === 1 ? '' : 's'} and {stickers} sticker
        {stickers === 1 ? '' : 's'} to your child’s account — one tap, and safe to do twice.
      </p>
      <Button variant="quiet" size="sm" className="mt-3 w-full" onClick={onContinueAsGuest}>
        Or carry on without an account →
      </Button>
    </section>
  );
}
