// Regenerates public/icon-192.png, public/icon-512.png and public/apple-touch-icon.png
// from the five rectangles of public/icon.svg. Node built-ins only, so it runs where
// nothing can be installed:  node scripts/icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const LID = [0x17, 0x16, 0x1f];
const IVORY = [0xf3, 0xee, 0xe2];
// icon.svg, in its 32-unit grid, in paint order: [x, y, width, height, corner radius, colour].
const RECTS = [
  [0, 0, 32, 32, 7, LID],
  [5, 9, 22, 15, 2, IVORY],
  [10, 9, 3, 9, 0, LID],
  [16, 9, 3, 9, 0, LID],
  [22, 9, 3, 9, 0, LID],
];
const GRID = 32;
const SUB = 4; // 4×4 subsamples per pixel

const inRect = (px, py, [x, y, w, h, r]) => {
  if (px < x || py < y || px > x + w || py > y + h) return false;
  const cx = px < x + r ? x + r : px > x + w - r ? x + w - r : px;
  const cy = py < y + r ? y + r : py > y + h - r ? y + h - r : py;
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};

const colourAt = (px, py) => {
  for (let i = RECTS.length - 1; i >= 0; i--) if (inRect(px, py, RECTS[i])) return RECTS[i][5];
  return null;
};

const rasterise = (size) => {
  const rows = Buffer.alloc(size * (1 + size * 4)); // each row starts with filter byte 0
  const step = GRID / size / SUB;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SUB; sy++) {
        for (let sx = 0; sx < SUB; sx++) {
          const c = colourAt((x * SUB + sx + 0.5) * step, (y * SUB + sy + 0.5) * step);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
        }
      }
      const at = y * (1 + size * 4) + 1 + x * 4;
      if (a) rows.set([Math.round(r / a), Math.round(g / a), Math.round(b / a), Math.round((a * 255) / (SUB * SUB))], at);
    }
  }
  return rows;
};

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const png = (size) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8-bit, RGBA, deflate, adaptive filter, no interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rasterise(size), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const out = new URL('../public/', import.meta.url);
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  writeFileSync(new URL(name, out), png(size));
  console.log(`${name} ${size}×${size}`);
}
