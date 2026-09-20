# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-18 Nick: publishing takes two workflow runs (publish, then pages-build-deployment); cache-bust index.html or you read a stale bundle.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 runner: the keychain is unreadable over SSH and from launchd; secrets for headless runs live in ~/.config/agent-team/env on the iMac.
- 2026-09-20 builder: Playwright is not a project dependency and must not become one; `npx playwright screenshot --browser=chromium --viewport-size=390,844 <url> out.png` against `npm run preview` works, and the built Storybook serves any story at `storybook/iframe.html?viewMode=story&id=<title-slug>--<story-slug>`, so screens with state (paused, windDown) are screenshotted from stories rather than by driving the app.
- 2026-09-20 builder: the Builder sandbox has no psql or Postgres and docker/npm-install into /tmp are permission-gated, so a migration's "runs cleanly" criterion is checked by reading, not by running; Nick's SQL-editor paste is the first real run.
- 2026-09-20 builder: the Builder sandbox auto-denies any Bash with subshells, `||`, `$?` or `${…}` expansion; capture exit codes with one plain `cmd >/dev/null 2>&1 && echo EXIT0` per check, run in parallel. Guest play records `earned` level events in its local cache, so an import that only adds its own event silences inference and flattens the timeline unless those events are copied too.
- 2026-09-20 builder: the Builder sandbox has no outbound network (curl to Supabase is denied) and cannot read ~/.config/agent-team/env or printenv secrets, so an infra item that needs a third-party sign-up, a secret or a redeploy (MG-004: Resend account, RESEND_API_KEY, send-report redeploy under the project-owning Supabase login) cannot be finished by a builder; it needs a runner with network and secrets, or Nick.
