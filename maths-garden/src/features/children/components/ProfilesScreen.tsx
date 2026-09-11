import { useState } from 'react';
import { AppIcon } from '@/shared/brand/AppIcon';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { Child } from '../model';
import { ChildForm } from './ChildForm';

export interface ProfilesScreenProps {
  profiles: readonly Child[];
  email: string;
  busy?: boolean;
  error?: string | null;
  onPick: (child: Child) => void;
  /** Resolves true when the profile was saved. */
  onCreate: (input: Omit<Child, 'id'>) => Promise<boolean>;
  onSignOut: () => void;
}

/**
 * Unicorn tile and "Who's playing?" with a big avatar button per child plus "Add a child"; with no children
 * yet it opens straight on the add form. The signed-in email and Sign out sit at the bottom.
 */
export function ProfilesScreen({ profiles, email, busy, error, onPick, onCreate, onSignOut }: ProfilesScreenProps) {
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

        <p className="mt-8 text-sm text-grape/60">
          Signed in as {email} ·{' '}
          <button type="button" className="underline" onClick={onSignOut}>
            Sign out
          </button>
        </p>
      </Card>
    </div>
  );
}
