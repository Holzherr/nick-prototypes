# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-11 Nick: the Pages custom domain is set through the API (gh api -X PUT repos/Holzherr/qeued/pages -f cname=qeued.com); workflow deploys ignore the CNAME file.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
