# PhotonUVC Vet — trust-optimised concept

**v0.1** · live at https://holzherr.github.io/nick-prototypes/photon-trust/

An unaffiliated redesign concept for [photon-therapeutics.com](https://photon-therapeutics.com/),
built to answer one question: what would this page look like if every element were chosen to make a
sceptical vet believe the device is safe, proven, and already trusted by their peers?

## What it is

Single-file HTML, no build step. Brand tokens lifted from the real site (purple `#64399e`, ink
`#1f223d`, lavender `#bea7de`); type is Outfit + Instrument Sans + IBM Plex Mono, since the real
site's GT Walsheim Pro isn't licensable for a prototype.

Sections, in order of the trust argument they make:

1. **Hero** — the claim, plus three credibility chips (peer-reviewed count, award, UK-built).
2. **Instrument strip** — 265 nm / 5 s / 0 mm / 100+ as hard specs, not marketing adjectives.
3. **Google reviews** — 4.9 score, real Google `G` mark, five reviews from named practices.
4. **In the field** — "Used on 20,000 patients", a media mosaic, deployment stats.
5. **Evidence ledger** — eight peer-reviewed papers, each with a headline number, a plain-English
   claim, and a full citation linking to the source.
6. **Safety Q&A** — the six objections a vet raises before buying, answered directly.
7. **In the consult room** — three steps. Numbered because it genuinely is a sequence.
8. **CTA** — two-week in-clinic trial, not "contact us".

## Real vs placeholder

This matters and is deliberately visible on the page (top strip + footer note).

**Real:** every citation in the Evidence section. Turicea 2025 (*Vet Ophthalmol*, doi 10.1111/vop.13265),
Gowtham 2025 (*CLAE* 48(4):102417, PMID 40221350), Marasini 2025 (*JPPB* 263:113091, PMID 39787975),
Treadwell 2026 (*Vet Ophthalmol* 29(2):e70065, PMC12969538), Williams 2026 (doi 10.1111/vop.70214),
Hoerdemann 2026 (doi 10.1111/vop.70110), PMID 33610742, PMID 33812086. The Veterinary Marketing
Awards win is real. Product photos and logo are hotlinked from the real site.

**Invented:** the 4.9 / 187 reviews, all five review cards and the people and practices in them,
"20,000 patients", 340+ practices, 14 countries, 4 years. Swap or delete before this is shown to
anyone who might read it as a real claim.

## Decisions

- **Over-cite rather than logo-wall.** The strongest available trust signal for a novel medical
  device is a dense, checkable citation list — a reader can verify it in one click, which is exactly
  why it's persuasive. Eight full citations with PMIDs beats a row of university crests.
- **Name the placeholders on the page itself.** A concept that fakes clinical adoption on a public
  URL under a real company's branding is a liability. The top strip and footer note cost almost
  nothing visually and remove the problem. Delete the `.concept` div and the `.foot-note` para if
  presenting to a client with real content swapped in.
- **Answer the objection, don't dodge it.** "Shining UV into an eye sounds alarming" is the section
  header. Naming the fear is more convincing than avoiding it.
- **The mono layer is the signature.** IBM Plex Mono carries every number, wavelength, PMID and
  timestamp, so the page reads as instrumentation rather than brochure. It's the one consistent
  device across all eight sections.

## Known issues

- Media mosaic tiles are hand-drawn SVG eyes (species-accurate pupils: round / horizontal / slit),
  not footage. They're slots — real clinic video goes here.
- Product images hotlink to photon-therapeutics.com. If they add hotlink protection the hero breaks;
  download into `assets/` if that happens.
- Review rail scrolls horizontally with no arrow controls. Fine on trackpad and touch, worse on a
  mouse.
