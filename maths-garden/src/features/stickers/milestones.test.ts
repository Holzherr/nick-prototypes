import { describe, expect, it } from 'vitest';
import { GAMES } from '@/features/games/catalog';
import { drawReward, packById, SPECIAL_PACK } from './catalog';
import { drawSpecial, milestonesReached, pendingMilestone } from './milestones';

const rec = (sticker: string, shiny = false) => ({ sticker, shiny });
const unicornPack = packById('unicorn').stickers.map((s) => s.id);

describe('drawReward', () => {
  it('gives new stickers, then sparkly copies once the pack is complete, then repeats', () => {
    const partial = unicornPack.slice(0, 7).map((id) => rec(id));
    expect(drawReward('unicorn', partial)).toEqual({ sticker: packById('unicorn').stickers[7], sparkly: false });

    const complete = unicornPack.map((id, i) => rec(id, i < 7));
    expect(drawReward('unicorn', complete)).toEqual({ sticker: packById('unicorn').stickers[7], sparkly: true });

    const allSparkly = unicornPack.map((id) => rec(id, true));
    expect(drawReward('unicorn', allSparkly).sparkly).toBe(false);
  });
});

describe('milestones', () => {
  it('counts sticker totals, finished packs and levels 3 and 5, ignoring special stickers', () => {
    const records = [...unicornPack.map((id) => rec(id)), rec('kpop/tiger'), rec('kpop/fire'), rec('special/trophy')];
    const keys = milestonesReached(records, { peek: 2, find: 4 }, GAMES).map((m) => m.key);
    expect(keys).toEqual(['stickers-5', 'stickers-10', 'pack-unicorn', 'peek-lv3', 'find-lv3', 'find-lv5']);
  });

  it('owes one special sticker per milestone', () => {
    const five = unicornPack.slice(0, 5).map((id) => rec(id));
    expect(pendingMilestone(five, {}, GAMES)?.line('Tara')).toBe("Wow, Tara! You've got 5 stickers!");
    expect(pendingMilestone([...five, rec('special/trophy')], {}, GAMES)).toBeNull();
    expect(pendingMilestone(unicornPack.slice(0, 4).map((id) => rec(id)), {}, GAMES)).toBeNull();
  });

  it('hands out each special sticker before repeating', () => {
    const allButOne = SPECIAL_PACK.stickers.slice(1).map((s) => rec(s.id));
    expect(drawSpecial(allButOne)).toEqual({ sticker: SPECIAL_PACK.stickers[0], sparkly: false });
    expect(drawSpecial(SPECIAL_PACK.stickers.map((s) => rec(s.id))).sparkly).toBe(true);
  });
});
