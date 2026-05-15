# P4 — Files index · feedback (shared Doc)

> **For:** Rebecca, Sophia, Ankit, Roman · **From:** Nick
> **Deadline:** Fri 22 May
> **Time needed:** ~20-25 min (or longer if you bring your own contracts — see below)

---

## What to do

### Option A — test against the 23 sample contracts

1. Open the prototype: **https://holzherr.github.io/nick-prototypes/files-index/overview.html**
2. Click through each tab in the prototype: **all-files · categories · knowledge · parties · contacts · status**.
3. Open the **source-contract browser**: https://holzherr.github.io/nick-prototypes/files-index/sources.html — read 2-3 of the underlying contracts so you have ground truth.
4. Compare: does the prototype's classification / extraction match what *you'd* extract if you'd been handed those 23 contracts?

The 23 contracts come from Nick's Whisk / Foodient / Reciply paperwork plus a few sample templates. They're real format, real parties (mostly historical), real lawyer drafting.

### Option B — even better: test against contracts *you* understand

The sample set is real but Nick's context. Lawyer-grade validation is much sharper when run over contracts whose legal background you already understand. Two ways to do this:

- **If you use Claude Code** (or are willing to install it): clone `holzherr/nick-prototypes`, drop a folder of contracts into `files-index/sources/` (real ones from your practice, or public templates / online sample contracts — doesn't need to be confidential), re-run the extraction step locally. You'll see the prototype rendered against *your* corpus.
- **If you don't / can't**: send Nick a folder of contracts (real or online-sourced — anything you understand well enough to judge the extraction against). He'll set up the prototype with your set and share the result so you can validate it against legal context you actually own.

Why this matters: when Victor first set up the prototype with synthetic test data, the gut-check was weak — synthetic contracts have synthetic edge cases. Nick re-ran it with his own Whisk-era contracts and the fidelity check jumped, because he knew the original contract context and could tell at a glance what the extraction was getting wrong. Same will be true for you.

---

## What we want feedback on

### Primary — legal validity of the extraction

1. **Categorisation accuracy** — pick 2-3 contracts in the sources browser and check whether the prototype's category matches your read. Where does it get it wrong (or close-but-wrong)?
2. **Party extraction** — does it correctly identify counterparties, internal entities, signatories?
3. **Date extraction** — execution dates, effective dates, term lengths, expiry dates. Anything off?
4. **Risk / non-standard signals** — is the prototype surfacing clauses that warrant attention, or missing them?
5. **Missing fields** — what would a lawyer NEED to see at-a-glance that the prototype doesn't show? Governing law, term, key value caps, indemnity scope, etc.

### UX (welcome, just less load-bearing)

6. **First-week-as-GC scenario** — imagine you've just joined a 5-year-old SaaS company as in-house GC. They hand you this view. What would you actually click on first? What lens (categories vs parties vs status) is most useful?
7. **Comparison** — how does this compare to how you currently find contracts (DMS search, Outlook, folders)? What's the realistic ceiling on adoption?

---

## Write your thoughts below

Start a new section with your name as a level-2 heading (`## Rebecca`, `## Sophia` etc.) so we can attribute. Paste screenshots inline (Cmd+V). Bullet points fine. Reference specific contracts by their number prefix (e.g. *"08 — Claire Powell Employment Contract"*) when calling out extraction issues.

If you tested with your own corpus instead of (or in addition to) the 23 samples, note which set under your section heading.

---

_(write below — add `## Your name` then your thoughts)_

---

## Aggregated themes (Nick fills after)

_To be summarised once everyone has written._

---

> The files-index work is closely tied to the P3 Memory project — both are extraction problems. If you spot patterns that apply to both, flag them.
