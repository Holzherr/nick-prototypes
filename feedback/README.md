# Feedback round — setup notes (for Nick)

The lawyer-feedback landing is at [`index.html`](./index.html). Live: https://holzherr.github.io/nick-prototypes/feedback/

## What still needs your input

Two placeholders are wired into `index.html` (search for `null`):

```js
const DOC_URLS = {
  "p3-memory": null,             // ← paste the P3 Doc URL
  "p4-files-index": null,        // ← paste the P4 Doc URL
  "p1-p2-lawyer-access": null,   // ← paste the P1+P2 Doc URL
  "p5-ai-redlining": null,       // ← paste the P5 Doc URL
};
const STG_CHAT_URL = null;       // ← paste the Stg-chat URL
```

Until those are set, the "Write feedback in the X Doc" links are greyed out and pop an alert when clicked, and the Stg-chat link in the P3 card shows as "Nick to add URL".

## How to set them

1. **Create the 4 Google Docs** — one per template in [`templates/`](./templates/):
   - [`p3-memory.md`](./templates/p3-memory.md) → new Doc "GitLaw feedback · P3 Memory"
   - [`p4-files-index.md`](./templates/p4-files-index.md) → new Doc "GitLaw feedback · P4 Files index"
   - [`p1-p2-lawyer-access.md`](./templates/p1-p2-lawyer-access.md) → new Doc "GitLaw feedback · P1+P2 Lawyer access"
   - [`p5-ai-redlining.md`](./templates/p5-ai-redlining.md) → new Doc "GitLaw feedback · P5 AI redlining"

   Paste the markdown content into each Doc (Google Docs renders the headings, lists, tables OK; bold/italic survive). Adjust the deadline if "Fri 22 May" isn't right.

2. **Share each Doc** — "Anyone with the link can comment" or "edit", as you prefer. Get the share URL.

3. **Paste the URLs into `index.html`** in the `DOC_URLS` object and the `STG_CHAT_URL` constant. Just commit + push — Pages redeploys in 30-60s.

4. **Post in #legal-feedback (or wherever)** with a one-liner pointing at the landing page:

   > Hey team — please test the GitLaw prototypes. P3 + P4 are the priority (legal validity of extraction). Materials, Loom, Docs, all here: https://holzherr.github.io/nick-prototypes/feedback/

## Distribution check

The feedback page is publicly accessible (it's on GitHub Pages). The Docs themselves are link-shareable but not public unless you change that — so any sensitive notes the team writes stay in the Doc, not on the public page.
