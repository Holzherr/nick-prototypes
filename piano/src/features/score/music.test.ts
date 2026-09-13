import { describe, expect, it } from 'vitest';
import { thisOldMan } from './pieces/this-old-man.ts';
import {
  barCount, fingersUsed, guidance, holdLabel, isWhite, letterOf,
  nextWhite, positionMap, totalBeats, whiteDistance,
} from './music.ts';

describe('note names', () => {
  it('names middle C', () => expect(letterOf(60)).toBe('C'));
  it('knows white from black', () => {
    expect(isWhite(60)).toBe(true);
    expect(isWhite(61)).toBe(false);
  });
  it('skips black keys when walking', () => {
    expect(nextWhite(60, 1)).toBe(62); // C -> D
    expect(nextWhite(60, -1)).toBe(59); // C -> B
    expect(nextWhite(64, 1)).toBe(65); // E -> F, no black key between
  });
});

describe('hand position', () => {
  it('walks the right hand up from the thumb', () => {
    expect(positionMap(thisOldMan, 'R')).toEqual({ 1: 60, 2: 62, 3: 64, 4: 65, 5: 67 });
  });
  it('walks the left hand down from the thumb', () => {
    expect(positionMap(thisOldMan, 'L')).toEqual({ 1: 60, 2: 59, 3: 57, 4: 55, 5: 53 });
  });
  it('shares middle C between both thumbs', () => {
    expect(positionMap(thisOldMan, 'R')[1]).toBe(positionMap(thisOldMan, 'L')[1]);
  });
  it('reports only the fingers this piece uses', () => {
    expect(fingersUsed(thisOldMan, 'R')).toEqual({ 2: 'D', 3: 'E' });
    expect(fingersUsed(thisOldMan, 'L')).toEqual({ 1: 'C', 2: 'B', 3: 'A', 4: 'G' });
  });
  it('places every played note under the finger that plays it', () => {
    for (const n of thisOldMan.notes) {
      expect(positionMap(thisOldMan, n.hand)[n.finger]).toBe(n.pitch);
    }
  });
});

describe('distances', () => {
  it('counts white keys, not semitones', () => {
    expect(whiteDistance(60, 64)).toBe(2); // C -> E is two white keys
    expect(whiteDistance(64, 60)).toBe(-2);
    expect(whiteDistance(60, 60)).toBe(0);
  });
});

describe('the transcription', () => {
  it('fills whole bars', () => {
    expect(totalBeats(thisOldMan)).toBe(barCount(thisOldMan) * thisOldMan.beatsPerBar);
  });
  it('is eight bars of four', () => {
    expect(barCount(thisOldMan)).toBe(8);
    expect(totalBeats(thisOldMan)).toBe(32);
  });
  it('never overlaps or leaves a gap', () => {
    let cursor = 0;
    for (const n of thisOldMan.notes) {
      expect(n.onset).toBe(cursor);
      cursor += n.duration;
    }
  });
  it('stays inside the drawn keyboard', () => {
    for (const n of thisOldMan.notes) {
      expect(n.pitch).toBeGreaterThanOrEqual(thisOldMan.range.low);
      expect(n.pitch).toBeLessThanOrEqual(thisOldMan.range.high);
    }
  });
});

describe('guidance', () => {
  it('names the finger on the first note', () => {
    expect(guidance(thisOldMan, 0)).toBe('Put your pointing finger on D and play it.');
  });
  it('calls out the hand swap', () => {
    expect(guidance(thisOldMan, 1)).toBe('Swap hands - now the left hand plays B.');
  });
  it('notices a repeated key', () => {
    expect(guidance(thisOldMan, 16)).toBe('Same key again - stay on G.');
  });
  it('counts keys within a hand', () => {
    expect(guidance(thisOldMan, 7)).toBe('One key down to D.');
  });
  it('never says she is wrong', () => {
    for (let i = 0; i < thisOldMan.notes.length; i++) {
      expect(guidance(thisOldMan, i)).not.toMatch(/\b(wrong|bad|incorrect|mistake)\b/i);
    }
  });
});

describe('hold labels', () => {
  it('uses the teacher wording for quavers', () => {
    expect(holdLabel(thisOldMan.notes[15])).toBe('half a count');
    expect(holdLabel(thisOldMan.notes[0])).toBe('1 count');
    expect(holdLabel(thisOldMan.notes[2])).toBe('2 counts');
  });
});
