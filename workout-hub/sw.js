// TigerWorkouts moved to https://tigerworkouts.com. A phone that installed the app from this
// address still runs the old worker, which serves its cached copy of the app. The browser checks
// this file for changes on each visit; this version replaces the old worker, deletes everything it
// cached, removes itself and reloads open pages — which then fetch index.html, a redirect.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
  })());
});
