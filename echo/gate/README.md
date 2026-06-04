# Echo access gate — Cloudflare Worker

A genuine AI gate for the Echo waitlist. The public page POSTs `{ name, email, note }`;
this Worker asks Claude to **research the person with web search** and returns a real verdict:

```json
{ "decision": "expedited" | "waitlist", "headline": "...", "reason": "...", "signals": ["..."] }
```

The Anthropic key lives only in the Worker (a Cloudflare secret), never in the page.

## Deploy (~5 min)

From this folder:

```bash
npm i -g wrangler          # or use: npx wrangler ...
wrangler login             # opens browser, free Cloudflare account
wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic API key when prompted
wrangler deploy
```

`wrangler deploy` prints a URL like `https://echo-gate.<your-subdomain>.workers.dev`.

## Wire it to the page

Open `echo/index.html`, find:

```js
const AGENT_ENDPOINT = ''; // paste your Cloudflare Worker URL here
```

Paste the Worker URL between the quotes, commit, push. Done — the waitlist now makes real decisions.
(Leave it empty and the page falls back to the local "always expedite" animation, so it never dead-ends.)

## Config

`wrangler.toml`:
- `ALLOW_ORIGIN` — lock to your site origin (e.g. `https://holzherr.github.io`) so only your page can call it. Use `"*"` while testing.
- `MODEL` — `claude-sonnet-4-6` (default), `claude-haiku-4-5` (cheaper/faster), or an Opus id (sharpest).

## Tune the gate

Edit the `CRITERIA` string in `worker.js` to change who gets fast-tracked, then `wrangler deploy` again.

## Cost & notes

- Each review = one Claude call with up to 4 web searches. Web search and tokens are billed to your Anthropic account.
- The gate **fails open**: on any model/parse error it expedites rather than punish a real applicant.
- Honeypot (`_honey`) and input length caps are built in. For heavier abuse protection add Cloudflare Turnstile or a KV rate-limit.
- The page still emails you every lead (via FormSubmit) **including the AI's decision and reason**, so you see every call the agent made.
