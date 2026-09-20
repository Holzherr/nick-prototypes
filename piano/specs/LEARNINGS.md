# Learnings

Append-only. One line per gotcha: `- <date> <role>: <what turned out to be true>`. Read before building; append when something non-obvious cost you time.

- 2026-09-13 Nick: scores stay in beats, not seconds, so tempo is a display concern.
- 2026-09-19 runner: git pushes to GitHub stall on HTTP/2 from these machines; set http.version=HTTP/1.1 per clone.
- 2026-09-20 builder: main.tsx never unmounts App, so nothing in usePractice may rely on unmount or cleanup for persistence; write to localStorage at the moment of the event.
