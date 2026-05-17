# GitLaw Specialist Sub-Agents — Panel

A concept prototype for a panel of specialist legal sub-agents inside GitLaw — each grounded in a real legal workflow with its own toolkit of GitLaw primitives + external lookups.

## Current version

**v0.1** — panel grid + agent detail view + scenario player. Two fully-scripted scenarios; remaining scenarios show trigger + preview-only player.

## Run

```bash
open prototypes/gitlaw-subagents-panel/index.html
```

Single-file HTML. Tailwind via CDN. No build.

## What it shows

**Grid view (landing)**
- 9 specialist agents grouped by area: IP (3), Pre-litigation (2), Disputes (2), Personal (1), Regulatory (1)
- Each card shows the agent's name, jurisdiction, blurb, specialist toolkit (chips), and scenario count
- Top section lists 8 shared GitLaw primitives every agent can call

**Agent detail view (click a card)**
- Full toolkit grid with descriptions
- Scenarios list — each scenario is a real procedural trigger (office action, debt over 90 days, breach detected, etc.)
- Scripted scenarios marked `▶ play`, others marked `preview`

**Scenario player (click a scenario)**
- Step-by-step transcript: agent messages, user messages, tool calls (rendered as terminal-style cards with args + mocked results), and document operations (rendered as inline previews with Track Changes styling)
- Next-step / Reset controls
- Sticky footer with step counter

## The 9 agents

| Group | Agent | Jurisdiction | Tools | Scripted scenarios |
|---|---|---|---|---|
| IP | Patent Prosecution | USPTO 🇺🇸 | 5 specialist | **§103 obviousness rejection** |
| IP | Patent Prosecution | EPO/UKIPO 🇪🇺 | 5 specialist | preview only |
| IP | Trademark | Multi-jurisdiction | 5 specialist | preview only |
| Pre-litigation | Cease & Desist | Cross-cutting | 5 specialist | **Amazon listing infringement** |
| Pre-litigation | Invoice Debt Collection | UK/US branching | 5 specialist | preview only |
| Disputes | Commercial Litigation | England & Wales 🇬🇧 | 5 specialist | preview only |
| Disputes | Commercial Litigation | US Federal 🇺🇸 | 5 specialist | preview only |
| Personal | Personal Litigation | UK litigant-in-person | 5 specialist | preview only |
| Regulatory | Data Protection | UK/EU GDPR | 5 specialist | preview only |

## Design choices worth pushback

- **Shared vs specialist tool split** — every agent inherits 8 GitLaw primitives (`create_document`, `open_change_request`, `apply_track_changes`, etc.); the visible differentiation is the 5-tool specialist toolkit per agent. This mirrors how real Claude tool use works and makes the panel scan-able.
- **9 agents, not more** — kept tight. Added/removed agents during ideation: dropped Corporate/Transactional (M&A, VC); added Cease & Desist, Invoice Debt Collection, Personal Litigation.
- **One agent per jurisdiction pair for litigation + patents** — UK vs US litigation, USPTO vs EPO patents. The contrast is the demo (CPR vs FRCP, MPEP vs EPC).
- **Debt Collection is one agent that branches on jurisdiction** (not two) — kept the panel tight; the agent asks "which jurisdiction" as a specialist signal.
- **Personal Litigation is UK-only** — US personal litigation is too state-by-state to demo coherently.
- **Tool calls render as terminal-style cards** — name + args + mocked result. Felt more "real agent" than chat bubbles.
- **Document operations render with Track Changes styling** — `<ins>` green, `<del>` red strikethrough — to ground the demo in GitLaw's ADF + Suggest Mode reality.

## Scripted scenarios in v0.1

1. **Patent USPTO — §103 obviousness rejection on US 17/845,221** (12 steps)
   Tool chain: `uspto_status_lookup` → `office_action_parse` → `prior_art_search` → `claim_amendment_drafter` → `open_change_request` → `set_deadline`. Demonstrates technical depth (KSR / MPEP 2143 / hindsight reconstruction) and Change Request creation.

2. **Cease & Desist — Amazon listing copying trademark + product images** (12 steps)
   Tool chain: `evidence_capture` (Wayback + screenshot + hash) → `infringement_diff` → `entity_lookup` (Companies House) → `create_document` → `delivery_tracker` (Royal Mail) → `response_monitor`. Demonstrates evidence preservation, parallel Amazon takedown + C&D letter, and handoff queue to UK Commercial Litigation agent if no response.

## Open forks (for v0.2+)

1. **Cross-agent handoffs** — Cease & Desist scenario references handoff to UK Litigation agent on no-response. Should this be: (a) automatic with notification, (b) user-approved, or (c) shared queue surfaced in the originating agent's view?
2. **Where does the agent live in GitLaw's repo model** — a Party with special posture? A sidecar service that signs Change Requests as itself? A Repository participant with a system role?
3. **Tool authorisation** — should every tool call require user approval, or only ones with external effects (filing, payment, service)? Patents scenario assumes all internal tools auto-fire; Amazon scenario gates filing of complaint.
4. **Pricing / metering** — specialist tools that hit paid APIs (Westlaw, PACER, Companies House premium) need a credit model. AI Credits already exist in GitLaw — extend, or separate?
5. **More scripted scenarios** — priority order suggested: GDPR 72h breach (high drama), UK debt collection (high volume in practice), Personal Litigation faulty laptop (relatable, shows the litigant-in-person voice).
6. **Specialist tool implementations** — most tools mocked. Real plumbing: USPTO Patent Center API, WIPO Brand DB, Companies House API, BAILII scrape, PACER + RECAP, ICO breach form auto-fill.

## Known issues

- v0.1 has no agent-to-agent handoff UI — referenced in script but not visible.
- Tool call results are hard-coded; would benefit from a clear "(simulated)" marker for the demo audience.
- Mobile layout works but cards stack — no specific mobile optimisation.
