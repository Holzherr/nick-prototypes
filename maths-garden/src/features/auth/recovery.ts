/**
 * A password-reset link signs the parent in and lands on the site with `type=recovery` in the hash. That visit
 * must end on "choose a new password", not in the garden — otherwise the reset quietly does nothing and the
 * old password is still the only one.
 *
 * Remembered in sessionStorage because a first visit reloads once when the offline worker takes over (see
 * link-problem.ts), and the hash is gone by then.
 */
const KEY = 'maths-garden:recovering';

const session = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** Called at boot, before Supabase reads and clears the hash. */
export function captureRecovery(hash: string = window.location.hash) {
  if (/(^|[#&])type=recovery(&|$)/.test(hash)) markRecovery();
}

export const markRecovery = () => session()?.setItem(KEY, '1');
export const isRecovering = () => session()?.getItem(KEY) === '1';
export const finishRecovery = () => session()?.removeItem(KEY);
