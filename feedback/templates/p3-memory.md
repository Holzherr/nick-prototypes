# P3 — Memory · feedback (shared Doc)

> **For:** Rebecca, Sophia, Ankit, Roman · **From:** Nick
> **Deadline:** Fri 22 May
> **Time needed:** ~25-30 min

---

## What to do

1. **Watch the 3-min Loom**: https://www.loom.com/share/e007d5e86e884270a36f42ce49cafaaf
2. **Go to Stg-chat**: _<URL — Nick to fill in>_
3. **Have one or two real-ish chat sessions** with the agent. Pretend you're a lawyer using GitLaw for a specific contract or playbook question.
4. **Run `/print-memory`** at the end. Read what GitLaw extracted about you.
5. **Optionally run `/clear-memory`** and repeat with a different topic to see what extraction does on a fresh slate.

---

## What we want feedback on

### Primary — legal validity of the extracted memory

When you run `/print-memory`, look at the stored facts and ask:

1. **Anything factually wrong?** A date, party, jurisdiction, clause text the agent got incorrect.
2. **Anything legally wrong?** A misclassified contract type, a clause summarised in a way you'd push back on, an incorrect inference about governing law or precedent.
3. **Anything missing?** A fact a lawyer would have surfaced from the same conversation but the agent didn't.
4. **Anything that shouldn't be stored?** Privileged content, off-topic chitchat treated as legal fact, advice-shaped statements rather than recall.

### Equally important — "is this memory actually material?"

This is the key product question. Memory should **only** store things that are uniquely valuable for future interactions. It should **not** store:

- Information already in playbooks (duplicative — playbooks are loaded as context anyway).
- Generic context that doesn't differentiate this user from any other user.
- Restatements of what the agent already knows from the document or chat history.

Filling memory with that kind of fluff **actively degrades** agent quality — it dilutes the high-signal context with noise, so the agent attends to less of the useful stuff in future turns.

5. **Flag any stored memory that doesn't pass a "would this uniquely help a future turn?" bar.** Be aggressive — when in doubt, mark it as something that shouldn't be there.
6. **Is anything being stored that's already in a playbook?** Easy class of mistakes.

### UX (welcome, just less load-bearing)

7. **Memory referencing in later turns** — did the agent surface memory naturally during follow-up, or did it feel disconnected?
8. **Did memory shortcut your work** or did you still find yourself re-stating things?
9. **Is `/print-memory` output readable** for a non-engineer?

---

## Write your thoughts below

Start a new section with your name as a level-2 heading (`## Rebecca`, `## Sophia` etc.) so we can attribute. Paste screenshots inline (Insert → Image or just Cmd+V). Bullet points are fine — whatever's clearest.

If something's broken, just write it down. Don't try to fix it, don't worry about whether it's known. Raw observations are most useful.

---

_(write below — add `## Your name` then your thoughts)_

---

## Aggregated themes (Nick fills after)

_To be summarised once everyone has written._
