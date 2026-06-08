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
- `demo.html` — **interactive, narrated walkthrough**. A mock Echo app with dummy data (Echo + Family/Health/GitLaw/Finance domain agents, role agents, Telegram bridge; Home with HomeCards + "while you slept" brief; Agents → detail; Tasks board; Approvals queue). A guided tour spotlights each section and an animated **"Echo" character narrates** via the browser's built-in **Web Speech API** (free, no key, on-device) with Next/Back/Skip + captions. **Voiceover upgrade path:** populate the `AUDIO` map in the script with pre-rendered files (e.g. ElevenLabs `voice/0.mp3`…) and it plays those instead of the browser voice. Best in Chrome/Edge/Safari.

## State

v6 — rebuilt `faq.html` as a **"How it works"** page led by four SVG **vision diagrams** (ambient channels · overnight loop · sense-remember-act · ownership architecture); moved the existing FAQ below them under a "Questions" heading.

v5 — added `demo.html`, an **interactive narrated demo** (guided click-through + AI voice + animated Echo character). Linked as "Live demo" from nav.

v4 — added `components.html`, the **building-blocks gallery** (the agent's UX component kit), linked from nav on index + faq.

v3 — added **Priorities** as the lead bento tile (task-prioritisation / executive-assistant layer). 8 areas total.

v2 — premium pass. Champagne accent + finer type. Added a velocity.black-style **life-areas bento** below the pillars: Travel · Dining · Family · Health · Experiences · Shopping · Relationships, each grounded in real Echo capabilities (family calendar, contacts CRM + gift loop, health digest, weekend/experience suggestions). Unsplash stock imagery (descriptions reveal on hover).

v1 — hero + 3 value props (ambient / memory / agency) + waitlist + closing CTA.
