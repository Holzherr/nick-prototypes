import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

export interface AccountPanelProps {
  /** The signed-in parent's address; missing when playing as a guest. */
  email?: string;
  /** Changes still waiting to upload. */
  pending: number;
  onSwitchChild: () => void;
  /** Sign out, or — as a guest — go and sign in. */
  onSignOut: () => void;
}

/**
 * Who is signed in, and whether this child's play is actually safe. With one child the app opens straight
 * into her garden, so the profiles screen never appears — which left no way at all to tell a signed-in
 * session from a guest one, or to see which account you were on.
 *
 * The status leads the screen. It used to be a small pale pill with the address buried mid-sentence, which
 * read as a footnote next to the buttons below it — a parent glancing at this screen could not answer "am I
 * signed in, and as whom?" without reading a paragraph. Now the state is a full-width bar and the account
 * name is the largest thing in the panel, so the answer arrives before anything else on the page.
 */
export function AccountPanel({ email, pending, onSwitchChild, onSignOut }: AccountPanelProps) {
  const signedIn = Boolean(email);
  return (
    <section className={cn('mt-6 overflow-hidden rounded-[28px]', signedIn ? 'bg-leaf/10' : 'bg-sunny/25')}>
      <p className={cn('px-5 py-2 text-sm font-bold tracking-wide', signedIn ? 'bg-leaf text-white' : 'bg-sunny text-grape')}>
        {signedIn ? '☁️ Signed in' : '📱 Guest — this device only'}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="min-w-[220px] flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-grape/55">{signedIn ? 'Account' : 'No account'}</p>
          <p className={cn('mt-0.5 break-all text-xl font-semibold', signedIn ? 'text-raspberry' : 'text-grape/75')}>{signedIn ? email : 'Not signed in'}</p>
          <p className="mt-2 text-sm text-grape/80">
            {signedIn
              ? 'Her rounds, levels and stickers are saved to this account and follow her to any device you sign in on.'
              : 'Everything is saved on this device only — if the iPad is cleared or the browser data is wiped, it goes with it.'}
          </p>
          <p className={cn('mt-1.5 text-sm font-medium', !signedIn ? 'text-grape/80' : pending > 0 ? 'text-clay' : 'text-leaf-deep')}>
            {!signedIn
              ? 'Sign in and this play can come with you — nothing is lost.'
              : pending > 0
                ? `${pending} change${pending === 1 ? '' : 's'} still to upload. They go up as soon as there is signal.`
                : '✓ Everything is uploaded.'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="quiet" size="sm" onClick={onSwitchChild}>
            Switch or add child
          </Button>
          {signedIn ? (
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={onSignOut}>
              Sign in to save →
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
