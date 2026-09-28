# Decisions

Append-only. One line per decision: `- <date> <who>: <decision>`. Builders append Nick's answers here in their PR; nobody rewrites history.

- 2026-09-14 Nick: fix, polish and small content items go Ready without Nick; product items always wait for him.
- 2026-09-19 Nick: no native iOS app for approvals; GitHub plus ntfy, live steering via Claude Remote Control.
- 2026-09-20 Nick: infra items (migrations, auth, Supabase, deploy, dependencies) run without him.
- 2026-09-20 Nick: migration 0008 (agent_snapshot) applied by hand in the Supabase SQL editor; the read-only snapshot is live.
- 2026-09-21 Nick: migration 0009 (agent_snapshot v2) applied by hand in the Supabase SQL editor; agent_snapshot(8) returns total_ms, eased and stickers.
- 2026-09-25 Nick: migration 0007 (feedback reporter and kind) applied by hand in the Supabase SQL editor; labelled feedback inserts are accepted.
- 2026-09-25 Nick: migration 0010 (agent_snapshot v3) applied by hand in the Supabase SQL editor; agent_snapshot(8) returns reporter and kind on feedback rows.
- 2026-09-25 Nick: levelling follows the average of the last three finished rounds at the current level (up at 90%, down under 60%, level 1 never drops, pace no longer counts, rounds left early never count); approved on MG-020 with the condition that rounds entered and left are not miscounted.
