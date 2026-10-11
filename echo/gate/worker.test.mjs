// node --test echo/gate/worker.test.mjs — no network: fetch is stubbed and counted.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

const ORIGIN = 'https://holzherr.github.io';
let calls = 0;
globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({ content: [{ type: 'text', text: '{"decision":"waitlist","headline":"Hi","reason":"r","signals":[]}' }] })); };

const limiter = (max) => { const seen = new Map(); return { limit: async ({ key }) => { seen.set(key, (seen.get(key) || 0) + 1); return { success: seen.get(key) <= max }; } }; };
const env = (extra = {}) => ({ ALLOW_ORIGIN: ORIGIN, ANTHROPIC_API_KEY: 'k', GATE_LIMIT: limiter(3), ...extra });
const post = (origin, ip = '1.2.3.4') => new Request('https://gate.example/', {
  method: 'POST', headers: { 'content-type': 'application/json', ...(origin ? { Origin: origin } : {}), 'CF-Connecting-IP': ip },
  body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', note: '' }),
});

test('a call from another origin, or none, never reaches the model', async () => {
  calls = 0;
  assert.equal((await worker.fetch(post('https://evil.example'), env())).status, 403);
  assert.equal((await worker.fetch(post(null), env())).status, 403);
  assert.equal(calls, 0);
});

test('one address is capped', async () => {
  calls = 0; const e = env();
  const statuses = [];
  for (let i = 0; i < 5; i++) statuses.push((await worker.fetch(post(ORIGIN), e)).status);
  assert.deepEqual(statuses, [200, 200, 200, 429, 429]);
  assert.equal(calls, 3);
  assert.equal((await worker.fetch(post(ORIGIN, '5.6.7.8'), e)).status, 200);
});

test('an upstream error does not echo the provider response', async () => {
  const saved = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'secret detail' } }), { status: 401 });
  const res = await worker.fetch(post(ORIGIN), env());
  globalThis.fetch = saved;
  assert.equal(res.status, 502);
  assert.doesNotMatch(await res.text(), /secret detail/);
});
