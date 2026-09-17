import { useEffect } from 'react';

/** How often an open tab asks whether a newer build exists. */
const CHECK_EVERY_MS = 60_000;

/**
 * Registers the service worker under a per-build URL (?v=<build>), so a CDN-cached sw.js can
 * never hide a deploy, and reloads onto the new build as soon as it takes control.
 *
 * It also keeps asking. Registration alone only checks at page load, and this app is a single page with
 * hash routes: a tab left open all day moves between the garden, the grown-ups screen and the printables
 * without ever loading again, so it can sit on a build from hours ago while being clicked through the
 * whole time. Twice in one afternoon that looked exactly like a broken feature — the code was live and
 * the tab was not. So the tab asks on a timer, and whenever it comes back to the foreground, which is the
 * moment someone is about to look at it.
 *
 * Reloading mid-round is survivable: a half-finished round is kept and the garden offers to carry on.
 */
export const UpdatePrompt = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || location.hostname === 'localhost') return;
    const base = import.meta.env.BASE_URL;

    let registration: ServiceWorkerRegistration | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;

    const check = () => {
      // A failed check is nothing to act on: the next one is a minute away.
      void registration?.update().catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    navigator.serviceWorker
      .register(`${base}sw.js?v=${__BUILD__}`, { scope: base, updateViaCache: 'none' })
      .then((reg) => {
        registration = reg;
        timer = setInterval(check, CHECK_EVERY_MS);
        document.addEventListener('visibilitychange', onVisible);
      })
      .catch(() => {});

    let refreshing = false;
    const onChange = () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
      document.removeEventListener('visibilitychange', onVisible);
      if (timer) clearInterval(timer);
    };
  }, []);
  return null;
};
