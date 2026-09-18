import { cacheKey } from '@/features/progress/repo';
import { GUEST_CHILDREN } from '@/features/progress/guest';
import { supabase } from '@/shared/supabase/client';

/** What this device kept for the account: the upload queue, the remembered child, and cached progress. */
function forgetAccountOnDevice() {
  const guestIds = new Set<string>(
    (() => {
      try {
        return (JSON.parse(localStorage.getItem(GUEST_CHILDREN) ?? '[]') as { id: string }[]).map((c) => c.id);
      } catch {
        return [];
      }
    })(),
  );
  const prefix = cacheKey('');
  for (const key of Object.keys(localStorage)) {
    // Guest play on this device is not the account's, so it stays.
    if (key.startsWith(prefix) && !guestIds.has(key.slice(prefix.length))) localStorage.removeItem(key);
  }
  for (const key of ['maths-garden:outbox', 'maths-garden:active-child', 'maths-garden:report-sent']) localStorage.removeItem(key);
}

/**
 * Deletes the signed-in parent's account and, by cascade, every child profile and all their play. Returns an
 * error message, or null once the account is gone and this device is signed out.
 */
export async function deleteAccount(): Promise<string | null> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) return 'The account could not be deleted. Nothing was removed — try again, or email nick@nickholzherr.com.';
  forgetAccountOnDevice();
  // The session belongs to a user that no longer exists; clear it locally rather than asking the server.
  await supabase.auth.signOut({ scope: 'local' });
  return null;
}
