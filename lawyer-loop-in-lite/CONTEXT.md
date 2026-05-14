# P1 · Lawyer loop-in (bring-your-own) — context & feedback brief

> Featured prototype: **BYO (variant B)** — the user supplies their own lawyer. The folder also contains the concierge variant (A) at [`a-concierge.html`](./a-concierge.html), kept for comparison but not currently on the landing page.

## What this prototype tests

Two variants of the **AI + human-lawyer collaboration** experience:

- **A — Concierge:** GitLaw matches the user with a vetted lawyer from its marketplace. The lawyer reviews the AI's draft, sends back recommendations as comments and track-changes, and (optionally) takes over the engagement for a defined scope.
- **B — Bring-your-own:** Same flow but the user invites their existing lawyer (e.g., their firm's GC, an external solicitor they already use). GitLaw becomes the workspace; the lawyer becomes a Guest collaborator.

Both sit on the **same underlying model** — a "lawyer access" experience — but they differ in who supplies the lawyer.

## Relationship to other prototypes

This is the **easiest-to-build** option on the lawyer-access axis. Two ways for a user to get legal help live on the landing page:

| Implementation difficulty | Prototype | Why |
|---|---|---|
| 🟢 **Easiest** | **P1 · This prototype (BYO)** | No marketplace, no vetting, no tier system. User invites their own lawyer as a Guest. |
| 🔴 **Hardest** | [P2 · Legal-advice agent](../legal-advice-agent/) | Autonomous AI advice — UPL, accuracy, and trust are the load-bearing problems. |

The concierge variant (A) — where GitLaw matches the user with a marketplace lawyer — is in this folder at [`a-concierge.html`](./a-concierge.html) for reference but sits between BYO and full-engagement on the build-difficulty axis; not currently shown on the landing.

## Related EagleLaw-spec docs

Update these paths if the spec moves.

**Feature spec / PRD:**
- [`10-feature-spec/20-ai-assistance/60-lawyer-loop-in.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/10-feature-spec/20-ai-assistance/60-lawyer-loop-in.md) — *L2: Lawyer Marketplace and Human Review* (Status: Draft, Owner: @nicolasholzherr)

**Concept seeds:**
- [`07-concept-seeds/40-law-firm-invite-and-directory.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/07-concept-seeds/40-law-firm-invite-and-directory.md) — invite-an-existing-firm flow (informs variant B)
- [`07-concept-seeds/41-document-prev-discussion-no-user-facing-teams.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/07-concept-seeds/41-document-prev-discussion-no-user-facing-teams.md) — sharing context with the lawyer

**Foundational dependencies referenced by the PRD:**
- `00-foundational/20-accounts-and-organizations.md` — Guest/Counterparty support
- `00-foundational/30-permissions-and-sharing.md` — scoped resource roles
- `00-foundational/40-versioning-and-audit.md` — audit trail
- `20-nonfunctional-and-policies/30-pricing-and-monetization.md` — pricing model

**Working files / threads (Nick to fill in):**
- Slack thread (concept seed discussion): _add link_
- Granola transcript (most recent walk-through): _add link_
- Notion / Drive doc: _add link_

---

## Testing brief — for in-house lawyers

### How long this should take

15-20 minutes per variant. Variant A is the primary flow to test; Variant B is a 5-minute follow-up.

### Scenarios to imagine

You're a corporate client (mid-sized SaaS company, no in-house counsel). You've just drafted a vendor MSA using GitLaw's AI and now want a real lawyer to look at it before you sign.

1. **Scenario A (Concierge):** You don't have a lawyer on retainer. Use Variant A to find one via GitLaw and walk through the review/handoff flow.
2. **Scenario B (Bring-your-own):** You have a lawyer you already trust (e.g., a friend who's a solicitor). Use Variant B to invite them into the document.

Click through each prototype, ideally with both scenarios in mind. The right column shows the lawyer's view of the same engagement.

### Questions we want answered

Reply in Slack DM to Nick, or in an email — short bullets are fine. (One paragraph max per question.)

1. **First impression:** Would you, as a lawyer, click "Accept review" if a client routed work to you this way? What would make you hesitate?
2. **Scope clarity:** Is it clear what the lawyer is being asked to do (review only? take over? sign off?). Where does the boundary get fuzzy?
3. **Liability comfort:** Where does professional liability sit in this flow? Anything missing that you'd need before accepting?
4. **Pricing model:** The prototype shows a tiered model (junior / senior / expert). Does the framing feel right? What would you charge for a 30-min review here?
5. **A vs B:** Which variant would your clients actually use? Why?
6. **Single biggest concern** before you'd recommend this to a peer.

### How we use the feedback

Aggregated into a follow-up doc within ~1 week. Specific responses won't be attributed without permission. If you want a 30-min follow-up call to go deeper on anything, just say so in your reply.
