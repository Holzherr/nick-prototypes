# P4 · Files index — context & feedback brief

## What this prototype tests

A files-index UX rendered against a real corpus of **23 sample contracts** (pulled from the `memory-tests` repo — Whisk / Foodient / Reciply paperwork, plus a few sample templates). The prototype shows the UX with realistic, varied data instead of synthetic placeholders.

The companion `sources.html` page lets you browse the original markdown of each source contract — useful for sense-checking whether the index actually surfaces the right metadata, parties, and categories.

## Related EagleLaw-spec docs

Update these paths if the spec moves.

**Design docs (most relevant):**
- [`35-design-docs/files-page/01-search-item-missing-fields.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/35-design-docs/files-page/01-search-item-missing-fields.md)
- [`35-design-docs/files-page/02-batch-starred-in-list.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/35-design-docs/files-page/02-batch-starred-in-list.md)
- [`35-design-docs/files-page/03-unified-file-item-response.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/35-design-docs/files-page/03-unified-file-item-response.md)

**Related foundational spec:**
- [`35-design-docs/documents/10-document-storage.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/35-design-docs/documents/10-document-storage.md)
- [`35-design-docs/documents/recent-files.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/35-design-docs/documents/recent-files.md)

**Memory / context seeds (this prototype was snapshotted from the memory-tests project):**
- `memory-tests` repo (`generated/memory-runs/20260508-131401/overview-html/`) — original snapshot
- `memory-tests/docs/shared-understanding-memory-prototype.md`

**Working files / threads (Nick to fill in):**
- Slack thread: _add link_
- Granola transcript: _add link_
- Notion / Drive doc: _add link_

---

## Testing brief — for in-house lawyers

### How long this should take

10-15 minutes against the 23 samples. Longer if you bring your own corpus — see "even better" path below.

### Two paths

**Option A — test against the 23 samples** (default).

**Option B — test against contracts you understand** (much better signal).

The 23 sample contracts are real but Nick's context. Validation is sharper when run over contracts whose legal background you already understand. Two ways:

- **If you use Claude Code** (or are willing to install it): go to [`GitLaw-co/memory-tests`](https://github.com/GitLaw-co/memory-tests/tree/whisk-com-contract-sample), check out the `whisk-com-contract-sample` branch (Nick's branch with the visual file-index prototype added). Create your own branch from it, swap the contract corpus for your own, re-run the extraction. You see the prototype rendered against your corpus.
- **If you don't / can't**: send Nick a folder of contracts — your own real ones, or public templates / online sample contracts. Doesn't need to be confidential. He'll set up the prototype against your set and share the result so you can validate with legal context you actually understand.

This matters because when Victor first set up the prototype against synthetic data, the gut-check was weak. Nick re-ran it with his own Whisk-era contracts and the fidelity check sharpened immediately — knowing the original contract context meant he could see at a glance what the extraction was getting wrong. Same will be true for you.

### Scenarios to imagine

You've just been onboarded as in-house GC at a 5-year-old SaaS startup. The first thing IT hands you is access to their contracts folder — 200+ documents accumulated over 5 years across employment, vendor, NDA, IP, financing.

Open the [files-index overview](./overview.html) and pretend it's loaded with your new employer's contracts. Click through the tabs (all files, categories, knowledge, parties, contacts, status). Then open [Browse the 23 source contracts](./sources.html) and read a couple of the source documents to gut-check whether the categorisation feels right.

### Questions we want answered

Write in the shared Google Doc (link on the [feedback page](../feedback/)). Bullets are fine.

**Primary — legal validity of the extraction:**

1. **Categorisation accuracy:** look at 2-3 source contracts in the browser (or in your own corpus if you went Option B). Where does the prototype's category match your read? Where does it get it wrong?
2. **Party extraction:** does it correctly identify counterparties, internal entities, signatories?
3. **Date extraction:** execution dates, effective dates, term lengths, expiry dates — anything off?
4. **Risk / non-standard signals:** is the prototype surfacing clauses that warrant attention, or missing them?
5. **Missing fields:** what would a lawyer NEED to see at-a-glance that the prototype doesn't show? Governing law, term, value caps, indemnity scope, etc.

**UX (welcome, just less load-bearing):**

6. **First-week-as-GC scenario:** imagine you've just joined a 5-year-old SaaS company as in-house GC. What would you actually click on first? Which lens is most useful?
7. **Comparison:** how does this compare to how you currently find contracts (DMS search, Outlook, folders)? What's the realistic ceiling on adoption?

### How we use the feedback

Aggregated into a follow-up doc within ~1 week. The files-index work is closely tied to the memory project — your feedback informs both the UX and the memory extraction layer that populates it.
