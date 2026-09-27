# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-13 Nick: scores stay in beats, not seconds, so tempo is a display concern.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 builder: main.tsx never unmounts App, so nothing in usePractice may rely on unmount or cleanup for persistence; write to localStorage at the moment of the event.
- 2026-09-25 builder: piano_sessions has insert and update policies for anon and no select policy, so a plain UPDATE whose WHERE reads the row matches nothing (Postgres applies SELECT policies to it); the client must upsert (insert … on conflict do update, PostgREST resolution=merge-duplicates, return=minimal). Builder sessions cannot run Postgres, Docker or npx, so a migration is checked by reading, not by applying.
- 2026-09-27 builder: a sync `act()` does not drain microtasks, so a loop of presses in a test yields two upserts, the first and the last; drain with an async act before reading fetch calls. jsdom has `crypto.randomUUID`. `policy.json` protects every `.env*` path, `.env.example` included, so env variables are documented in README.md only.
- 2026-09-27 builder: under vitest's jsdom environment `import.meta.url` is the served path (`/src/…`), not a `file:` URL, so a test that reads a file from disk uses a path relative to the project root (vitest's cwd), e.g. `readFileSync('public/icon-192.png')`. `node:fs` type-checks in tests without adding `node` to tsconfig.app.json types.
