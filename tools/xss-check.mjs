// Regression check for the URL-to-HTML XSS fixed on 11 Oct 2026 (viewer.html, visual-feedback/app.html).
//   python3 -m http.server 8811 &   # from the repo root
//   PLAYWRIGHT=/path/to/node_modules/playwright/index.mjs node tools/xss-check.mjs http://localhost:8811
// Every *Xss / *Script field must print false; viewerLegitH1 and vfPinCount show the pages still work.
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const base = process.argv[2];
const b = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), args: ['--mute-audio'] });
const p = await b.newPage();
const out = {};
await p.goto(base + '/viewer.html?path=' + encodeURIComponent('<img src=x onerror="window.__x=1">'));
await p.waitForTimeout(800); out.viewerErrorXss = await p.evaluate(() => !!window.__x);
await p.goto(base + '/viewer.html?path=' + encodeURIComponent('data:text/plain,<img src=x onerror="window.__x=1">.md'));
await p.waitForTimeout(800); out.viewerRemoteXss = await p.evaluate(() => !!window.__x);
await p.goto(base + '/viewer.html?path=files-index/sources/README.md');
await p.waitForTimeout(800); out.viewerLegitH1 = await p.evaluate(() => document.querySelector('#md h1')?.textContent);
await p.goto(base + '/visual-feedback/app.html');
await p.waitForTimeout(500);
const frag = await p.evaluate(() => LZString.compressToEncodedURIComponent(JSON.stringify({
  snapshot: '<html><body><p id="t" style="height:80px">hello</p><script>parent.__x=1<\/script></body></html>', viewport: 'desktop',
  annotations: [{ id: 'a1', type: 'pin', status: 'open', comment: '', viewport: '<img src=x onerror="window.__y=1">', anchor: { selector: 'p', boundingBox: { x: 0, y: 0, w: 1, h: 1 } } }] })));
await p.goto('about:blank');
await p.goto(base + '/visual-feedback/app.html#' + frag);
await p.waitForTimeout(1200);
out.vfSnapshotScript = await p.evaluate(() => !!window.__x);
out.vfViewportXss = await p.evaluate(() => !!window.__y);
// frame wiring still works: Pinpoint the paragraph
await p.keyboard.press('p');
const box = await p.locator('#overlay').boundingBox();
await p.mouse.move(box.x + 20, box.y + 20); await p.mouse.down(); await p.mouse.up();
await p.waitForTimeout(300);
out.vfPinCount = await p.evaluate(() => document.querySelector('#count').textContent);
console.log(JSON.stringify(out));
const bad = Object.entries(out).filter(([k, v]) => /Xss|Script/.test(k) && v);
if (bad.length) process.exitCode = 1;
await b.close();
