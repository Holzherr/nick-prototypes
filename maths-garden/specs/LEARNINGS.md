# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-18 Nick: publishing takes two workflow runs (publish, then pages-build-deployment); cache-bust index.html or you read a stale bundle.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 runner: the keychain is unreadable over SSH and from launchd; secrets for headless runs live in ~/.config/agent-team/env on the iMac.
