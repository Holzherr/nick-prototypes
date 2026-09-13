import { describe, expect, it } from 'vitest';
import { thisOldMan } from '@/features/score/pieces/this-old-man.ts';
import { layout, STAFF, staffY, staffWidth } from './layout.ts';

describe('staff positions', () => {
  it('puts E4 on the bottom treble line', () => expect(staffY(64, 'R')).toBe(40));
  it('hangs D4 in the space below it, with no ledger', () => {
    expect(staffY(62, 'R')).toBe(45);
    const d4 = layout(thisOldMan).find(l => l.note.pitch === 62 && l.note.hand === 'R');
    expect(d4?.ledgers).toEqual([]);
  });
  it('puts A3 on the top bass line and B3 just above', () => {
    expect(staffY(57, 'L')).toBe(90);
    expect(staffY(59, 'L')).toBe(85);
  });
  it('gives middle C in the bass exactly one ledger line', () => {
    expect(staffY(60, 'L')).toBe(80);
    const c4 = layout(thisOldMan).find(l => l.note.pitch === 60 && l.note.hand === 'L');
    expect(c4?.ledgers).toEqual([80]);
  });
  it('puts G3 in the top bass space', () => expect(staffY(55, 'L')).toBe(95));
});

describe('layout', () => {
  const laid = layout(thisOldMan);

  it('lays out every note', () => expect(laid).toHaveLength(thisOldMan.notes.length));

  it('reads left to right without going backwards', () => {
    for (let i = 1; i < laid.length; i++) expect(laid[i].x).toBeGreaterThan(laid[i - 1].x);
  });

  it('points treble stems up and bass stems down', () => {
    for (const l of laid) expect(l.stemUp).toBe(l.note.hand === 'R');
  });

  it('beams the quaver pairs and nothing else', () => {
    const beamed = laid.filter(l => l.beamTo !== null);
    expect(beamed.map(l => l.note.lyric)).toEqual(['pad-', 'give', 'dog']);
  });

  it('never beams across a barline', () => {
    for (const l of laid) {
      if (l.beamTo === null) continue;
      const partner = laid[l.beamTo];
      expect(Math.floor(l.note.onset / 4)).toBe(Math.floor(partner.note.onset / 4));
    }
  });

  it('is wide enough for every note it draws', () => {
    const width = staffWidth(thisOldMan);
    for (const l of laid) expect(l.x).toBeLessThan(width);
    expect(width).toBe(STAFF.pad + 8 * STAFF.barWidth + 26);
  });
});
