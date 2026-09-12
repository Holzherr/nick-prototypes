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
 */
export function AccountPanel({ email, pending, onSwitchChild, onSignOut }: AccountPanelProps) {
  const signedIn = Boolean(email);
  return (
    <section className={cn('mt-6 rounded-[28px] p-5', signedIn ? 'bg-leaf/10' : 'bg-sunny/25')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[220px] flex-1">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-raspberry">
            <span className={cn('rounded-full px-3 py-0.5 text-sm font-bold', signedIn ? 'bg-leaf text-white' : 'bg-sunny text-grape')}>
              {signedIn ? '☁️ Signed in' : '📱 This device only'}
            </span>
          </h3>
          <p className="mt-1.5 text-sm text-grape/80">
            {signedIn ? (
              <>
                Account <b className="break-all">{email}</b>. Her rounds, levels and stickers are saved to it and follow her to any device you sign in on.
              </>
            ) : (
              <>Playing as a guest. Everything is saved on this device only — if the iPad is cleared or the browser data is wiped, it goes with it.</>
            )}
          </p>
          <p className={cn('mt-1.5 text-sm font-medium', pending > 0 ? 'text-clay' : 'text-leaf-deep')}>
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
