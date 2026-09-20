# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-18 Nick: publishing takes two workflow runs (publish, then pages-build-deployment); cache-bust index.html or you read a stale bundle.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 runner: the keychain is unreadable over SSH and from launchd; secrets for headless runs live in ~/.config/agent-team/env on the iMac.
- 2026-09-20 builder: Playwright is not a project dependency and must not become one; `npx playwright screenshot --browser=chromium --viewport-size=390,844 <url> out.png` against `npm run preview` works, and the built Storybook serves any story at `storybook/iframe.html?viewMode=story&id=<title-slug>--<story-slug>`, so screens with state (paused, windDown) are screenshotted from stories rather than by driving the app.
- 2026-09-20 builder: the Builder sandbox has no psql or Postgres and docker/npm-install into /tmp are permission-gated, so a migration's "runs cleanly" criterion is checked by reading, not by running; Nick's SQL-editor paste is the first real run.
- 2026-09-20 builder: StartCard's h1 wraps the name <input>, so the heading's textContent never contains the typed name; a test for "Tara's Maths Garden" asserts the field's value and the possessive span separately.
- 2026-09-20 builder: src/app/routing.test.tsx recognises the signed-out homepage by a heading matching /Maths Garden/i, which only the StartCard h1 suffix supplied; anything that changes what that h1 shows for an empty name breaks that test, not just StartCard.test.tsx.
