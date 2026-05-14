# Legal-advice agent — context & feedback brief

## What this prototype tests

The **lightest-touch** version of GitLaw's lawyer-access experience: an AI agent gives the user contract-related advice **without** routing to a human lawyer at all. The agent surfaces escalation paths, evidence trails, and explicit "human review needed" checkpoints — but the loop stays inside the chat.

## Relationship to other prototypes

This is the **lightest** option on the lawyer-access difficulty axis:

| Difficulty / human involvement | Prototype |
|---|---|
| **Lightest** — AI advice only, no human | **This prototype** |
| **Medium** — AI + human lawyer in loop (concierge or BYO) | [Lawyer loop-in](../lawyer-loop-in-lite/) |
| **Heaviest** — full lawyer engagement (out of scope here) | (existing GitLaw partner flows) |

The point of having both: figure out how much of the value sits in the agent alone vs how much requires a human in the loop. Cheaper / scales better / is faster — but more legally risky.

## Related EagleLaw-spec docs

Update these paths if the spec moves.

**Feature spec / PRD:**
- [`10-feature-spec/20-ai-assistance/30-negotiation-assistance.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/10-feature-spec/20-ai-assistance/30-negotiation-assistance.md) — closest existing PRD (agent giving advice during negotiation)
- [`10-feature-spec/20-ai-assistance/60-lawyer-loop-in.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/10-feature-spec/20-ai-assistance/60-lawyer-loop-in.md) — describes the "human escalation" boundary this agent has to honor

**Concept seeds:**
- [`07-concept-seeds/30-coldstart-context.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/07-concept-seeds/30-coldstart-context.md) — how the agent gathers enough context to give meaningful advice
- [`07-concept-seeds/32-user-context-profile.md`](https://github.com/GitLaw-co/eaglelaw-spec/blob/main/07-concept-seeds/32-user-context-profile.md) — long-term profile the agent draws on

**Nonfunctional / policy:**
- `20-nonfunctional-and-policies/` — UPL (Unauthorized Practice of Law) constraints are the hard ceiling on what this agent can say

**Working files / threads (Nick to fill in):**
- Slack thread: _add link_
- Granola transcript: _add link_
- Notion / Drive doc: _add link_

---

## Testing brief — for in-house lawyers

### How long this should take

15-20 minutes.

### Scenarios to imagine

You're advising a junior in-house lawyer at a fast-growing startup. They've got 4 contracts on their desk and need to know which ones to push back on. They turn to the GitLaw agent for a first pass instead of bothering you.

Click through the prototype. Try asking the agent the kinds of questions a non-lawyer founder might ask ("is this term normal?", "should I push back on indemnity caps?", "what's the worst case if I sign this as-is?").

### Questions we want answered

Reply in Slack DM to Nick, or in an email — short bullets are fine.

1. **Trust:** Where does the agent feel reliable vs where does it feel risky? Specific examples are gold.
2. **UPL boundary:** The agent is positioned as advice, not legal opinion. Is the framing clear enough? Where does it cross a line for you?
3. **Escalation:** When the agent offers to escalate to a human lawyer, does the handoff feel natural? Would you, as the receiving lawyer, get enough context?
4. **Substitution risk:** Would your clients use this *instead of* calling you for the kind of work you actually want to be doing? Or only for noise you're glad to be rid of?
5. **What's missing** that would make this 10x more useful for the kinds of problems your clients actually bring to you?
6. **Pricing intuition:** What would a startup pay per month for unlimited agent advice (with escalation costing extra)?

### How we use the feedback

Aggregated into a follow-up doc within ~1 week. Specific responses won't be attributed without permission. The lightest-touch variant is the highest-volume / lowest-margin product idea — qualitative friction here tells us whether it's a viable funnel or a liability magnet.
