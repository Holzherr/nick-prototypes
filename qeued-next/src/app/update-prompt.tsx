import { useEffect } from 'react';

/**
 * Registers the service worker under a per-build URL (?v=<build>), so a CDN-cached sw.js can
 * never hide a deploy, and reloads onto the new build as soon as it takes control.
 */
export const UpdatePrompt = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || location.hostname === 'localhost') return;
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${base}sw.js?v=${__BUILD__}`, { scope: base, updateViaCache: 'none' }).catch(() => {});
    let refreshing = false;
    const onChange = () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onChange);
  }, []);
  return null;
};
