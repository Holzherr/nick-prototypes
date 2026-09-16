import { useState } from 'react';
import { AppIcon } from '@/shared/brand/AppIcon';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { Child } from '../model';
import { ChildForm } from './ChildForm';

export interface ProfilesScreenProps {
  profiles: readonly Child[];
  /** The signed-in address, or what a guest is playing as. */
  email: string;
  /** Playing without an account: there is nothing to sign out of, so the row offers signing in instead. */
  guestMode?: boolean;
  busy?: boolean;
  error?: string | null;
  onPick: (child: Child) => void;
  /** Resolves true when the profile was saved. */
  onCreate: (input: Omit<Child, 'id'>) => Promise<boolean>;
  /** Sign out, or — as a guest — go and sign in. */
  onSignOut: () => void;
}

/**
 * Unicorn tile and "Who's playing?" with a big avatar button per child plus "Add a child"; with no children
 * yet it opens straight on the add form. The account row sits at the bottom.
 *
 * That row used to offer "Sign out" whoever was looking at it. A guest has no account to sign out of, so on
 * the screen a signed-out visitor actually lands on, the only account action on the page invited them to
 * leave something they had never joined — while the thing they wanted, signing in, had no button at all.
 */
export function ProfilesScreen({ profiles, email, guestMode = false, busy, error, onPick, onCreate, onSignOut }: ProfilesScreenProps) {
  const [adding, setAdding] = useState(false);
  const firstChild = profiles.length === 0;
  const showForm = adding || firstChild;

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[560px] text-center">
        <AppIcon size={72} />
        <h1 className="mt-4 text-3xl font-bold text-raspberry">{firstChild ? 'Add your child' : showForm ? 'Add a child' : 'Who’s playing?'}</h1>
        {firstChild && <p className="mt-1 text-grape/70">Scores and stickers save to their profile. This device opens straight into it next time.</p>}

        {showForm ? (
          <div className="mt-6">
            <ChildForm
              busy={busy}
              error={error}
              onSubmit={async (input) => {
                if (await onCreate(input)) setAdding(false);
              }}
              onCancel={firstChild ? undefined : () => setAdding(false)}
            />
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap justify-center gap-5">
              {profiles.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onPick(child)}
                  className="flex w-32 flex-col items-center gap-2 rounded-[28px] bg-blush p-4 candy-petal [--candy:8px] transition-transform active:translate-y-1 active:[--candy:3px]"
                >
                  <span className="text-6xl leading-none">{child.avatar}</span>
                  <span className="text-xl font-semibold">{child.name}</span>
                </button>
              ))}
            </div>
            <Button variant="quiet" className="mt-8" onClick={() => setAdding(true)}>
              + Add a child
            </Button>
          </>
        )}

        <div className="mt-8 rounded-[24px] bg-blush/70 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-bubble">{guestMode ? 'No account' : 'Account'}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-[180px] flex-1 break-all text-sm text-grape/85">{email}</p>
            {guestMode ? (
              <Button size="sm" onClick={onSignOut}>
                Sign in to save →
              </Button>
            ) : (
              <Button variant="quiet" size="sm" onClick={onSignOut}>
                Sign out
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
