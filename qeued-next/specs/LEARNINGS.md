# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-11 Nick: the Pages custom domain is set through the API (gh api -X PUT repos/Holzherr/qeued/pages -f cname=qeued.com); workflow deploys ignore the CNAME file.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 builder: catalogue_candidates.status has four values, not three: pending, held, failed and skipped (0020). published_share in agent_snapshot counts skipped as not held, as QD-001 defines it; candidates.by_status carries the split.
- 2026-09-20 builder: in watch-tonight the tone axis means fit with the mood asked for, not the viewer's history, so a client ranker must score it that way or the mood chips change nothing; src can import supabase/functions/_shared/ranking.ts by relative path under Vite, tsc and Storybook with no alias.
- 2026-09-24 builder: JustWatch UK has no page for Vargtimmen under either name (only /us/ does) and Dekalog resolves under its own name, so neither needs an alias tonight; the translated-search fallback (d65e7e9) already reaches most original-language titles. An alias earns its keep where the leading search result is a remake or namesake with the wrong year: Hotaru no haka (the 2005 remake leads). Write aliases from `candidates.mjs failed`, not from guesses.
- 2026-09-25 builder: the builder's worktree has no YAML parser (no yaml package in node_modules; python and ruby are not permitted), so a workflow file kept under qeued-next/tools/ci/ can only be checked structurally here. The real check is a hand run with dry_run ticked from the Actions tab once Nick has copied it.
