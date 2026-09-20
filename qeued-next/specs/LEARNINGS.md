# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-11 Nick: the Pages custom domain is set through the API (gh api -X PUT repos/Holzherr/qeued/pages -f cname=qeued.com); workflow deploys ignore the CNAME file.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 builder: catalogue_candidates.status has four values, not three: pending, held, failed and skipped (0020). published_share in agent_snapshot counts skipped as not held, as QD-001 defines it; candidates.by_status carries the split.
- 2026-09-20 builder: JustWatch UK has no page for Vargtimmen under either name (only /us/ does) and Dekalog resolves under its own name, so neither QD-003 example needs or can use an alias; the translated-search fallback (d65e7e9) already reaches most original-language titles. An alias earns its keep only where the leading search result is a remake or namesake with the wrong year: Hotaru no haka (2005 remake leads), Madeo (mother! 2017 leads), Bakha satang (dated 2000). Write aliases from `candidates.mjs failed`, not from guesses.
