# Files index — context & feedback brief

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

10-15 minutes. Less heavy than the lawyer-access prototypes because the UX is more concrete.

### Scenarios to imagine

You've just been onboarded as in-house GC at a 5-year-old SaaS startup. The first thing IT hands you is access to their contracts folder — 200+ documents accumulated over 5 years across employment, vendor, NDA, IP, financing.

Open the [files-index overview](./overview.html) and pretend it's loaded with your new employer's contracts. Click through the tabs (all files, categories, knowledge, parties, contacts, status). Then open [Browse the 23 source contracts](./sources.html) and read a couple of the source documents to gut-check whether the categorisation feels right.

### Questions we want answered

Reply in Slack DM to Nick, or in an email — short bullets are fine.

1. **First-week usefulness:** On your first week, what would you do with this view? What would you actually click on?
2. **Categorisation:** Look at one or two source contracts (any in the sources viewer) and check whether the way the prototype categorises them matches how you'd categorise them. Where does it get it wrong?
3. **Missing metadata:** What fields / facets would you NEED to see at-a-glance that the prototype doesn't show?
4. **Counterparty / party views:** The "Parties" tab groups contracts by counterparty. Useful or noise? When would you actually use that lens?
5. **Risk surfacing:** A lawyer's job here often involves spotting risk fast. Anything in this UX that helps that? Anything missing?
6. **Comparison:** How does this compare to how you currently find contracts — Outlook + DMS search? iManage? Just folders? What's the realistic ceiling on adoption?

### How we use the feedback

Aggregated into a follow-up doc within ~1 week. The files-index work is closely tied to the memory project — your feedback informs both the UX and the memory extraction layer that populates it.
