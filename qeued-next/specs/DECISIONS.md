# Decisions

Append-only. One line per decision: `- <date> <who>: <decision>`. Builders append Nick's answers here in their PR; nobody rewrites history.

- 2026-09 Nick: own catalogue only, no licensed data; invented titles are retired with a reason, never published.
- 2026-09 Nick: the brand is lowercase qeued, even at the start of a sentence.
- 2026-09-11 Nick: qeued.com on GitHub Pages behind the Cloudflare proxy, same pattern as tigerworkouts.com.
- 2026-09-25 Nick: asked whether the weekly UK offer refresh should run on GitHub with a secret he sets: "I don't care, you decide"; he will notice by using the app and give direct feedback. The PM chose a weekly GitHub Action fed by the QEUED_DB_URL secret on 24 Sep; the command is QD-007, the workflow QD-009.
- 2026-09-27 Nick: switched the weekly offer refresh on: workflow copied to .github/workflows on main, QEUED_DB_URL secret set (session pooler), first dry run green with 0 titles stale (actions/runs/36332442917); the artefact step now warns instead of failing when a dry run has nothing to write.
- 2026-09-30 Nick: workflow copied to .github/workflows/qeued-functions.yml (fd1a19a), SUPABASE_ACCESS_TOKEN set, dry run green and lists the live functions (actions/runs/36763490088); #154 can merge and deploy search-titles itself.
- 2026-10-04 Nick: Yes — track the source on list entries (recommendation, tonight, search, title_page, manual), set once and never overwritten, plus an add-to-list button on Tonight's picks.
