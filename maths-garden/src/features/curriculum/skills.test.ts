import { describe, expect, it } from 'vitest';
import { SKILLS, skillById, skillForGame, stageAge, type StageNumber } from './skills';

const STAGES: StageNumber[] = [1, 2, 3];

describe('skills', () => {
  it('gives every stage a typical age that moves forward', () => {
    for (const skill of SKILLS) {
      const ages = skill.stages.map((s) => s.age);
      expect(ages).toHaveLength(3);
      for (const age of ages) expect(age).toMatch(/^\d–\d$/);
      // Each stage starts no earlier than the one before it.
      const starts = ages.map((age) => Number(age.split('–')[0]));
      expect(starts).toEqual([...starts].sort((a, b) => a - b));
      expect(new Set(starts).size).toBe(3);
    }
  });

  it('looks an age up by skill and stage', () => {
    expect(stageAge('subitising', 1)).toBe('3–4');
    expect(stageAge('adding', 3)).toBe('6–7');
    for (const skill of SKILLS) for (const stage of STAGES) expect(stageAge(skill.id, stage)).toBe(skill.stages[stage - 1].age);
  });

  it('finds skills by id and by game', () => {
    expect(skillById('counting')?.name).toBe('Counting objects');
    expect(skillById('nope' as never)).toBeUndefined();
    expect(skillForGame('peek')?.id).toBe('subitising');
  });
});
