# KB — Family hub on a tablet (deploying Echo's "Kitchen · family" surface)

*How the kitchen-tablet surface in `faq.html` §04/§05 actually gets onto a wall. Reference notes — point-in-time (June 2026), verify before buying.*

## TL;DR

There is **no single "family hub platform."** Turning a cheap Fire/Android tablet into an always-on family wall screen is a **two-layer** job:

1. **A dashboard** (what's on the screen) — DAKboard (easy/paid), MagicMirror² (free/DIY), Home Assistant (smart-home), **or Echo's own family surface**.
2. **A kiosk layer** (turns the tablet into a locked wall panel) — almost always **Fully Kiosk Browser**.

For Echo, **Echo *is* layer 1** — the "Kitchen · family" surface is just a web page served from your VM. We only need layer 2 to mount it.

## The landscape

| Option | What it is | Build-your-own? | Cost | Notes |
|---|---|---|---|---|
| **DAKboard** | Hosted dashboard for any screen (tablet/Fire/TV/Pi). Calendar, photos, weather, lists; 100+ integrations. | Configurable, not open | Free tier + subscription | Easiest "any screen → dashboard in minutes." Closed platform. |
| **MagicMirror²** | Open-source modular dashboard (came from DIY smart mirrors). Write your own modules. | **Fully** | Free | Most flexible; needs Raspberry Pi + command line + `config.js`. Engineer mindset. |
| **Home Assistant + Fully Kiosk** | HA dashboards (Lovelace) shown on a kiosked tablet; HA can control the screen (on/off, motion, TTS). | Yes | Free (self-host) | The smart-home power combo; overkill if you only want a family screen. |
| **Hardware devices** (Skylight Calendar, Hearth, Cozyla) | Purpose-built family wall calendars. | No (appliance) | $$$ ($150–600) | Plug-and-play but pricey and locked-in — the opposite of BYO. |
| **Fully Kiosk Browser** | Android/Fire app that **locks a tablet to one URL** as a kiosk. | n/a (enabling layer) | Free / ~€7 Plus | Motion-wake, screensaver, auto-start on boot, remote admin, screen on/off, MDM. **The piece that turns a tablet into a wall panel.** |

## The enabling layer: Fully Kiosk Browser

This is the answer to "turn a Fire/Android tablet into a home screen easily." It:

- launches a single web URL full-screen on boot and **locks the tablet to it** (can't exit to the launcher);
- **wakes the screen on motion** (front camera / PIR) and dims/screensavers otherwise — so it's "always on" without burning the panel or the battery;
- exposes a **remote REST/MQTT API** (reboot, reload, screen on/off, load URL) for automation;
- keeps the tablet awake while charging and **auto-restarts** after reboots/crashes.

A used **Fire HD 8 (~$20–40)** + a wall mount + an always-on charger is the cheapest path; any Android tablet works. Fire OS needs the APK sideloaded (enable "install unknown apps") since it's not always in the Amazon Appstore.

## How this maps to Echo

Echo's **"Kitchen · family"** surface is already a **responsive web dashboard** served single-tenant from the user's VM (the same surface modelled in `faq.html` §04). So deployment is just the kiosk layer:

1. **Cheap tablet** — Fire HD / any Android, wall-mounted by the kitchen, on a permanent charger.
2. **Install Fully Kiosk Browser**, point it at the user's Echo family-dashboard URL (served over Tailscale / the VM's `tailscale serve` HTTPS endpoint — same pattern as the existing team-board).
3. **Lock it down** — kiosk mode, motion-wake + photo/clock screensaver, start-on-boot.
4. Echo renders the **family-first modules** for that surface (Today · shared Calendar · Family · Shopping — per the §04 placement matrix), reading the **same memory** as the phone and Mac, scoped to what the household should see.

**Why this beats DAKboard/Skylight for an Echo user:** the dashboard isn't a separate product wired to Google Calendar — it's *Echo*, on *their* data, *their* VM, already curated by the agent and write-back capable (add to the shopping list from the kitchen, it syncs everywhere). DAKboard etc. are read-mostly mirrors; Echo's surface is the live agent.

## Productisation note (for the build)

To make the kitchen surface "easy" the way DAKboard is easy, Echo should ship:

- a **`/family` (or `/kitchen`) web route** — a touch-friendly, large-type, always-on layout of the family modules;
- a **one-page setup guide** (this KB, condensed): buy tablet → install Fully Kiosk → paste your Echo URL → done;
- optional **Fully Kiosk provisioning** (a config QR / `.json`) so setup is scan-and-go;
- **write-back affordances** sized for touch (tick a shopping item, add an event) so the wall screen is interactive, not just a mirror.

That gives the "build-your-own family hub" experience **without a second product** — the tablet is just another surface of the one assistant.

## Caveats

- **Fire OS** sideloading + Google-service gaps; some users flash Lineage/GrapheneOS for a cleaner Android.
- **Burn-in / always-on** — use the screensaver + motion-wake; schedule a nightly reboot.
- **Privacy** — a kitchen screen is shared; scope it to household-safe modules (the §04 matrix already defaults the kitchen to family-only, not inbox/finance).
- **Network** — keep the dashboard reachable on the LAN/Tailscale even if the WAN drops.

## Sources

- [How to turn a Fire tablet into a Home Assistant kiosk — Spice Home Tech](https://spicehometech.com/how-to/setup-install/fire-tablet-home-assistant-kiosk/)
- [Install Fully Kiosk Browser on a Fire tablet — Leonardo Smart Home Makers](https://leonardosmarthomemakers.com/how-to-install-fully-kiosk-browser-on-fire-tablet-for-home-assistant/)
- [Turn an old tablet into a smart display — Dashpadd](https://dashpadd.com/old-tablet-smart-display/)
- [DAKboard vs MagicMirror in 2025 — SmartNMagic](https://smartnmagic.com/blogs/solutions/review-dakboard-vs-magicmirror-in-2025-and-what-sets-them-apart)
- [DAKboard — official site](https://dakboard.com/site)
