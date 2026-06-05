// Render Echo demo narration to mp3 via ElevenLabs.
// Usage:  ELEVENLABS_API_KEY=sk_... node voice/generate.mjs        (run from echo/)
//   or:   node voice/generate.mjs   (reads ~/.echo-eleven.env)
// Pulls the narration text straight from demo.html's STEPS so audio == captions.
// Commits only the resulting mp3s; the key is never stored here.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';   // "Sarah" — warm, natural American female
const MODEL = 'eleven_multilingual_v2';

let KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  const f = join(homedir(), '.echo-eleven.env');
  if (existsSync(f)) KEY = readFileSync(f, 'utf8').trim().replace(/^ELEVENLABS_API_KEY=/, '');
}
if (!KEY) { console.error('No ELEVENLABS_API_KEY found (env or ~/.echo-eleven.env)'); process.exit(1); }

// extract the `say:` strings from STEPS in order
const html = readFileSync('demo-app.html', 'utf8');
const block = html.slice(html.indexOf('const STEPS='), html.indexOf('const TOUR='));
const lines = [...block.matchAll(/say:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1].replace(/\\"/g, '"'));
console.log(`narration lines: ${lines.length}`);

for (let i = 0; i < lines.length; i++) {
  const text = lines[i];
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.15 } }),
  });
  if (!r.ok) { console.error(`step ${i}: HTTP ${r.status} ${await r.text()}`); process.exit(1); }
  writeFileSync(`voice/${i}.mp3`, Buffer.from(await r.arrayBuffer()));
  console.log(`✓ voice/${i}.mp3  «${text.slice(0, 56)}…»`);
}
console.log('done — ' + lines.length + ' files');
