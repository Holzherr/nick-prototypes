# Echo — landing page

Premium black landing page + waitlist for **Echo**, the ambient personal assistant (multi-channel, persistent memory, acts on your behalf).

- **Live:** https://holzherr.github.io/nick-prototypes/echo/
- **Unlisted by design** — deliberately *not* added to the root `index.html` prototype overview. Reachable only by direct link.
- Single-file `index.html`. No build. Inter + Instrument Serif via Google Fonts; hand-rolled CSS (deep black, concentric "echo" rings behind the wordmark).

## Waitlist

The form is **Formspree-ready**: in `index.html`, replace `YOUR_FORM_ID` in the `<form action=…>` with a real [Formspree](https://formspree.io) form id to capture emails server-side. Until then it confirms client-side and records entries in `localStorage` under `echo_waitlist`, so the flow never dead-ends in a demo.

## Pages

- `index.html` — the landing page (hero · value props · life-areas bento · access · waitlist).
- `faq.html` — **"How it works"**: opens with four hand-drawn SVG **vision diagrams** — (1) *One mind, on every channel* (channels → one Echo → one shared memory), (2) *Go to bed behind, wake up ahead* (the overnight work loop), (3) *Sense → Remember → Act* (the working loop, "you stay in command"), (4) *Yours. Actually yours.* (the ownership architecture: your VM, your key, your DB + open core). The detailed FAQ now sits below them under a "Questions" heading. All diagrams are inline SVG in the house style (gold accent, concentric-ring motif), no images/deps.
- `components.html` — **the building-blocks gallery**: the standard UX-block kit every Echo agent composes its screens from (HomeCard, ApprovalCard, Board, Drawer, Timeline, Relations, SettingsPanel, Chart, Form, Brief), each rendered faithfully with its native-iOS mapping. Linked from the nav. Tells the "self-composing, renderer-neutral, web + iOS" story visually.
- `kb-family-hub-tablet.md` — **KB doc** (not a page): how the "Kitchen · family" surface gets deployed on a wall-mounted Fire/Android tablet. The landscape (DAKboard / MagicMirror² / Home Assistant) and the enabling layer (**Fully Kiosk Browser**), then how Echo maps onto it — Echo *is* the dashboard, the tablet is just a kiosk pointed at the family-surface URL. Includes a productisation note (`/family` route + scan-to-setup).
- `demo.html` — **interactive, narrated walkthrough**. A mock Echo app with dummy data (Echo + Family/Health/GitLaw/Finance domain agents, role agents, Telegram bridge; Home with HomeCards + "while you slept" brief; Agents → detail; Tasks board; Approvals queue). A guided tour spotlights each section and an animated **"Echo" character narrates** via the browser's built-in **Web Speech API** (free, no key, on-device) with Next/Back/Skip + captions. **Voiceover upgrade path:** populate the `AUDIO` map in the script with pre-rendered files (e.g. ElevenLabs `voice/0.mp3`…) and it plays those instead of the browser voice. Best in Chrome/Edge/Safari.

## State

v9 — `faq.html`: **04 — How it comes together** now has a **Mac / iPhone / Home-tablet surface switch** — the same enabled skills render as a wide desktop board, a glanceable phone stack, or a 2-up kitchen-family screen (each surface picks the modules that fit). **05 — Why it's yours** gains a **shared kitchen family screen** (shopping list + this-week calendar) as a fourth sync surface alongside phone and Mac.

v8 — `faq.html` is now **five interactive sections**. Added **02 — What it can do**: a 3D **skills coverflow** (drag / arrows / autoplay) — install community skills or build your own, each scoped tool-by-tool, with a live detail panel + enable toggle. Replaced the sense→remember→act loop with **04 — How it comes together**: a **live dashboard that assembles from the skills you toggle on** (bento tiles appear/extend as you enable skills — "never a black box"). Reworked **05 — Why it's yours**: VM **hosted anywhere (any cloud / own box)**, **a database you choose**. Header updated to five pictures.

v7 — `faq.html` diagram pass: swapped diagram 01 to **"Your data in. Action out."** — the left-to-right **Pipeline** (sources → unified wiki memory → Echo + skills → tools → you), responsive (stacks on mobile) with animated flow particles in the connectors. Reworked diagram 04 **"Yours. Actually yours."** into a **home-base** picture — your VM drawn as a house (your data · open Echo core · your key inside), reached from your phone (Telegram/WhatsApp), your Mac (Claude Code) and anywhere, with **animated bidirectional sync pulses**. Added agentmail-style **scroll-reveal** + flow animations across all four, all gated behind `prefers-reduced-motion`. New `architecture.html` content-lab (5 variants) is where the Pipeline came from.

v6 — rebuilt `faq.html` as a **"How it works"** page led by four SVG **vision diagrams** (ambient channels · overnight loop · sense-remember-act · ownership architecture); moved the existing FAQ below them under a "Questions" heading.

v5 — added `demo.html`, an **interactive narrated demo** (guided click-through + AI voice + animated Echo character). Linked as "Live demo" from nav.

v4 — added `components.html`, the **building-blocks gallery** (the agent's UX component kit), linked from nav on index + faq.

v3 — added **Priorities** as the lead bento tile (task-prioritisation / executive-assistant layer). 8 areas total.

v2 — premium pass. Champagne accent + finer type. Added a velocity.black-style **life-areas bento** below the pillars: Travel · Dining · Family · Health · Experiences · Shopping · Relationships, each grounded in real Echo capabilities (family calendar, contacts CRM + gift loop, health digest, weekend/experience suggestions). Unsplash stock imagery (descriptions reveal on hover).

v1 — hero + 3 value props (ambient / memory / agency) + waitlist + closing CTA.
