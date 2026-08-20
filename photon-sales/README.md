# photon-sales — password-gated sales report

Single-file, encrypted report page. The deployed HTML contains **only ciphertext**: the
passphrase is stretched with PBKDF2-SHA256 (310,000 iterations) and the payload is
AES-256-GCM. Nothing readable is in this repo, which is what makes it safe to host here.

- Live: https://holzherr.github.io/nick-prototypes/photon-sales/
- Not linked from the landing page — share the URL + passphrase directly.
- Unlocks per browser tab (`sessionStorage`), so a reload doesn't re-prompt.

## Rebuilding

The plaintext source and the build script live in the **private** `assistant-nick` repo at
`me/projects/photon-report/` — never in this one.

```
cd ~/assistant/me/projects/photon-report
node build.js <passphrase>          # writes ../../../prototypes/photon-sales/index.html
```

Edit `report.html` there (it is a fragment: `<style>` + markup + `<script>`), re-run the
build, then commit the regenerated `index.html` here.

## Known limits

- Client-side gate. Anyone with the URL **and** the passphrase can read it; anyone with the
  URL alone gets ciphertext. Rotating the passphrase means rebuilding.
- No analytics, no network calls, no fonts — the page is fully self-contained.
