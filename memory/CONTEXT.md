# P3 · Memory — context & feedback brief

> **Memory** lives on **Stg-chat** (not a hosted prototype in this repo). It's the feature where GitLaw extracts and remembers context about the user across chat sessions, then surfaces relevant memory in later conversations.

## Where to test

- **Loom walkthrough** (~3 min) — watch first: [https://www.loom.com/share/e007d5e86e884270a36f42ce49cafaaf](https://www.loom.com/share/e007d5e86e884270a36f42ce49cafaaf)
- **Stg-chat**: _<URL — Nick to fill in>_
- **Special commands** to use while chatting:
  - `/print-memory` — see what GitLaw has stored about you
  - `/clear-memory` — wipe your memory and start fresh

## What we want feedback on

### Primary — legal validity of the extracted memory

This is the thing we most need eyes on. When you chat with the agent then run `/print-memory`, look at the extracted facts and ask:

- Is anything **factually wrong** (got a date wrong, named the wrong party, misremembered a clause)?
- Is anything **legally wrong** (misclassified a contract type, summarised a clause in a way a lawyer would push back on, drew the wrong inference about precedent or governing law)?
- Is anything **missing** that a lawyer would have surfaced from the same conversation?
- Is anything **stored that shouldn't be** (privileged content, off-topic chitchat treated as legal fact, anything that looks like advice rather than recall)?

### Equally important — "is this memory actually material to future interactions?"

Memory should **only** store things that are uniquely valuable for future turns. It should **not** store:

- Information that's already in playbooks (duplicative — playbooks are loaded as context anyway).
- Generic context that doesn't differentiate this user from any other user.
- Restatements of what the agent already knows from the document or chat history.

If memory fills with fluff or duplicative context, it **actively degrades** agent quality — the agent dilutes its attention on the high-signal items it actually needs. We only want material additions in there.

When reviewing `/print-memory` output, flag aggressively: when in doubt, mark a stored item as "shouldn't be here." Easier for Nick to keep an over-cautious flag than to miss a clutter pattern.

### UX (welcome, just less load-bearing)

- Did the agent reference its memory naturally during follow-up turns, or did it feel disconnected?
- Did the memory help shortcut work, or did re-stating things feel necessary anyway?
- Is `/print-memory` clear enough to read for a non-engineer?

## Related EagleLaw-spec docs

- [`07-concept-seeds/30-coldstart-context.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/07-concept-seeds/30-coldstart-context.md)
- [`07-concept-seeds/32-user-context-profile.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/07-concept-seeds/32-user-context-profile.md)
- [`40-llm-and-evaluation/20-memory-and-playbooks.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/40-llm-and-evaluation/20-memory-and-playbooks.md) (if present)

## Relationship to other prototypes

Memory and [P4 · Files index](../files-index/) are sibling **extraction** features — Memory extracts from chat, Files index extracts from documents. They share the same underlying problem: turning unstructured input into structured legal facts that survive sessions.

## Feedback format

Single shared Google Doc — write under your name section. See **[feedback page](../feedback/)** for the link.
