# Lawyer Loop-In — GitLaw Prototype

Single-file HTML mockup of GitLaw's in-product "Legal Advice Agent" — the path where a user, mid-deal, asks the GitLaw agent to get the document checked over by a real lawyer.

Aligned to:
- `eaglelaw-spec/10-feature-spec/20-ai-assistance/60-lawyer-loop-in.md` (L2: Lawyer Marketplace and Human Review)
- `eaglelaw-spec/10-feature-spec/00-foundational/93-memory.md` (memory scopes: Profile, Playbook, Contacts)

## Run

```bash
open /Users/nicolasholzherr/assistant/gl/prototypes/legal-advice-agent/index.html
```

No build. Tailwind via CDN.

## What it shows

**Left — GitLaw application (chat with the GitLaw agent, no human counterparty in this view).**

1. GitLaw agent: "I've drafted your NDA — want me to get this checked over by a lawyer?"
2. Interactive quote bubble — price estimate driven by **word count + matter type**, with a **Junior / Senior / Expert tier toggle** that changes the price live. Senior is recommended.
3. Consent gate — explicit checkboxes for what gets shared with counsel:
   - This document (Mutual NDA v0.4)
   - Profile (GitLaw Ltd)
   - Playbook (Nick's preferences)
   - Acme Corp contact file (negotiation patterns)
   - Standard Engagement Terms
4. Engaged banner — lawyer name + tier + ETA appears in chat once matched.
5. Feedback — comes back as **Track Changes (Suggestions) + Comments + summary message**, mocked inline so you can see exactly what the deliverable looks like in the doc.

**Right — interactive flow diagram of what actually happens.**

Nine stages, each clickable to inspect:

1. **Intake** — agent parses the request and pre-estimates a fee band.
2. **Broadcast** — agent pings 5 qualified panel lawyers (jurisdiction + practice + tier). Cards animate from "pinged" → bids / conflict / no-response.
3. **Routing judgement** — agent ranks bids (rating × speed × price × fit) and surfaces a recommendation.
4. **Consent & engagement terms** — both parties click-accept; lawyer may counter-offer.
5. **Context delivered to lawyer** — click "See exactly what lawyer gets →" to open a drawer showing the *full bundle* the lawyer receives: doc, AI brief, Profile, Playbook, Acme contact file, Standard Engagement Terms. (Memory scopes from spec 93-memory.)
6. **Payment held in escrow** — click "Payment model →" to open a drawer explaining the Stripe Connect escrow flow (authorize → capture → release → marketplace fee).
7. **Lawyer at work** — live, async, in-doc.
8. **Feedback delivered** — Suggestions + Comments + summary memo back into the repo.
9. **Settle & close** — escrow released, audit trail filed, ratings collected.

**Spec button (top-right)** opens a drawer with the high-level intent, principles, pricing model, and open forks — derived from the eaglelaw-spec L2 doc.

## Design choices worth pushback

- **Single GitLaw agent voice on the left** — no human counterparty in this view, per your request. The agent is the only assistant the user talks to.
- **Tier toggle drives price live** — base fee + per-word factor by matter type. Mirrors the spec's "Junior $X / Senior $Y / Expert $Z" model.
- **Granular context consent** — checkboxes per memory scope (not a single "share my context" switch). Easier to revoke trust later, but more clicks now.
- **Agent is orchestrator only, never advisor** — avoids unauthorized-practice-of-law risk.
- **Feedback lands as native GitLaw primitives** — Suggestions (Track Changes) + Comments + memo, not a PDF attachment.
- **Stripe Connect escrow** with authorize → capture → release on user approval, 15% marketplace fee from lawyer's payout (not added to client price).

## Open forks (also in the Spec drawer)

1. Marketplace vs directory — auto-route to best bid, or let user pick from bids?
2. Where does the agent live in the GitLaw repo model — Party with special posture vs sidecar service that signs Change Requests as the firm?
3. Privilege — is the user the lawyer's client directly, or is GitLaw an intermediary? Affects retainer language and conflict-check responsibility.
4. Counter-offer flow — if a lawyer counters above the estimate, hold the matter for client approval or auto re-broadcast?
5. Memory-share granularity — per-scope toggles (as shown) or a single switch?
