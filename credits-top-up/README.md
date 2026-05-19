# Credits top-up — v0.1

Single-screen auto-play mock of the GitLaw out-of-credits → top-up flow.

## What it shows
1. User sends a chat message that needs credits.
2. Agent replies with an out-of-credits card + three top-up buttons: **$10 / $20 / $50**.
3. $20 button auto-clicks → Stripe-style lightbox slides up.
4. Card / expiry / CVC auto-type, "Pay $20" auto-clicks.
5. Stripe success state → lightbox dismisses.
6. Agent confirms "Added $20.00 to your account."
7. Credit pill in the bottom-left flips from empty ($0.00, red dot) → $20.00 (green dot) with a flash animation.

The credit pill is fixed at bottom-left and visible throughout, matching the brief.

## Scope deliberately kept minimal
- One scripted scenario, no branching.
- No real Stripe SDK — visual mock only.
- Buttons are not interactive (the script drives the demo). The `↻ Restart` button in the top bar re-runs the playback.

## File
- `index.html` — everything (single-file, Tailwind via CDN).
