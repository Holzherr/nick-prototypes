import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The home-screen PNGs are committed output of scripts/icons.mjs; a missing or
// wrong-size file would give the iPad a blank tile without anything else failing.
const PNG_SIGNATURE = '89504e470d0a1a0a';

describe.each([
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
])('public/%s', (name, size) => {
  const png = readFileSync(`public/${name}`); // vitest runs from the project root
  it('is a PNG', () => expect(png.subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE));
  it(`is ${size}×${size}`, () => {
    expect(png.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([size, size]);
  });
});
