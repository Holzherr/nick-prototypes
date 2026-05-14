# Lawyer Loop-In Lite — simpler paths to ship

The v0.4 prototype in `../legal-advice-agent/` is a full marketplace: agent matches, multiple bids, escrow, marketplace fee, lawyer view, payment release. That's a real product, but it's also a real build. This folder explores **leaner ways to ship the same value** by stripping out the expensive parts.

## The options space

| Path | What user does | What GitLaw builds | Who handles payment | Who finds the lawyer | Build cost |
|---|---|---|---|---|---|
| **A. Concierge handoff** | Clicks one button + small intake | Button + form + internal email queue + existing share | Lawyer ↔ client direct | GitLaw team, by hand | ~2-3 eng-days + shared inbox |
| **B. Bring your own lawyer** | Invites existing lawyer by email | Templated invite over existing Guest share | Lawyer ↔ client direct | User already has one | ~1-2 eng-days |
| C. Vetted directory | Browses listings, picks one | Directory page + invite email | Lawyer ↔ client direct | User picks from list | ~5-10 eng-days |
| D. Concierge + connection fee | Pays £99 flat, GitLaw connects | A + Stripe Checkout | Connection fee via GitLaw; review fee direct | GitLaw team | ~5-7 eng-days |
| E. Full marketplace (v0.4) | Sees tiers, bids, escrow | Agent + matching + escrow + payouts | GitLaw in the middle | GitLaw algorithm | ~weeks of eng + ops |

## What's prototyped here

Two leanest paths, both **separate files** so you can A/B them mentally:

- [`a-concierge.html`](a-concierge.html) — **Concierge handoff (Wizard-of-Oz).** One button, simple intake, email confirmation. GitLaw team does the matching manually for the first ~100 customers. Lawyer is added as a Guest collaborator. Lawyer bills the client directly. Looks like a product to the user; is a service behind the curtain.
- [`b-byo.html`](b-byo.html) — **Bring your own lawyer.** No matching at all. User invites their existing lawyer; GitLaw just provides the collaboration surface. The lightest possible build — a wrapper over existing share + a templated email.

## Why these two

They both:

- **Take GitLaw out of the payment loop entirely.** Lawyer ↔ client bill each other directly. No PSP integration, no escrow code, no marketplace-fee policy, no dispute flow, no IOLTA / client-money compliance to worry about.
- **Avoid UPL exposure.** GitLaw never gives advice, never selects providers algorithmically (in A it's a human, in B it's the user). The relationship is between client and lawyer; GitLaw is the room they meet in.
- **Reuse the Guest/Editor sharing primitive.** Lawyer's review happens inside the doc via existing Suggestions + Comments. No new feedback surface to build.
- **Are reversible.** Both paths can be the v1 of a future fuller marketplace (Option E) without throwing code away — the marketplace becomes an upgrade path, not the only path.

They differ on **who finds the lawyer**:

- A says "we'll do it for you" — better for users who don't have a lawyer; tests demand for a fuller service later.
- B says "you already have one" — better for SMEs / founders who do; near-zero build but smaller addressable market.

Not mutually exclusive. The cleanest v1 might actually be **both**, shown side-by-side at the moment the user clicks "Get a lawyer review" — see option B's prototype, which already does exactly that.

## What I'd ship first

If forced to pick one: **A**. It tests the demand signal and pricing for a true marketplace later, while costing days not weeks. It also lets us learn what lawyers actually charge for what kinds of work — pricing intel you need before automating matching in Option E.

If we're truly capacity-constrained: **B as a free feature**, with A as a waitlist behind it. B costs almost nothing and starts producing lawyer-in-doc data immediately; A is the upgrade path once we see traction.

## Build notes

- **Option A's "manual matching" is sustainable up to ~50-100 requests/week** on one part-time op. Beyond that, build a lightweight ops dashboard (Airtable + Zapier is enough for months). Don't build the matching algorithm until volume + pricing data justifies it.
- **Option B's only real risk is the lawyer rejecting GitLaw as a tool** — some firms are funny about new platforms. Mitigate by emphasizing it's "just a shared doc" (which is true) and offering a one-pager FAQ for their IT/compliance team.
- **Neither path requires a real-time chat between agent and lawyer.** That whole orchestration is the v0.4 prototype's most expensive idea, and it's not on the critical path for testing demand.

## Where v0.4 still wins

It's the right end state once volume is real:

- Algorithmic matching becomes useful at >100 weekly engagements.
- Escrow becomes attractive once trust friction (small business hiring an unknown lawyer) becomes the dominant conversion blocker.
- Marketplace fee revenue justifies the build only at meaningful GMV.

The lite paths get you there without paying that cost on day one.
