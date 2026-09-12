import { describe, expect, it } from 'vitest';
import type { GameId } from '@/features/games/catalog';
import type { RoundRecord } from '@/features/games/engine';
import { emptyProgress, type Progress } from '@/features/progress/model';
import { buildReport, stageOf } from './report';

const NOW = new Date('2026-09-12T18:00:00Z');

const round = (id: string, game: GameId, level: number, score: number, hoursAgo: number, ms = 1500): RoundRecord => ({
  id,
  childId: 'tara',
  game,
  level,
  score,
  total: 5,
  answers: Array.from({ length: 5 }, (_, i) => ({ target: '3', chosen: i < score ? '3' : '2', correct: i < score, ms })),
  playedAt: new Date(NOW.getTime() - hoursAgo * 3600_000).toISOString(),
});

const progress = (rounds: RoundRecord[], levels: Progress['levels'] = {}): Progress => ({ ...emptyProgress(), rounds, levels });

describe('tutor report', () => {
  it('maps game levels onto printable stages', () => {
    expect([0, 1, 2, 3, 4].map(stageOf)).toEqual([1, 2, 3, 3, 3]);
  });

  it('calls a fast, accurate game a strength and a poor one a focus', () => {
    const report = buildReport(
      'Tara',
      progress([round('a', 'peek', 1, 5, 6), round('b', 'peek', 1, 5, 5), round('c', 'find', 0, 2, 4), round('d', 'find', 0, 1, 3)], { peek: 1 }),
      NOW,
    );
    expect(report.strengths.map((s) => s.skill.id)).toContain('subitising');
    expect(report.focus[0].skill.id).toBe('numerals');
    expect(report.headline).toMatch(/Subitising is strongest; Numeral recognition needs the most work/);
    expect(report.stage).toBe(2);
  });

  it('recommends the weakest skill first, and printables that exist', () => {
    const report = buildReport('Tara', progress([round('a', 'peek', 0, 1, 4), round('b', 'peek', 0, 2, 3)]), NOW);
    expect(report.recommended.length).toBeGreaterThan(0);
    expect(report.recommended[0].printable.skill).toBe(report.focus[0].skill.id);
    expect(report.recommended[0].href).toContain('name=Tara');
    expect(new Set(report.recommended.map((r) => r.href)).size).toBe(report.recommended.length);
  });

  it('gives an off-screen activity for each skill that needs one', () => {
    const report = buildReport('Tara', progress([round('a', 'count', 0, 3, 2)]), NOW);
    expect(report.practice).toHaveLength(3);
    expect(report.practice.every((p) => p.length > 20)).toBe(true);
  });

  it('starts somewhere sensible on day one', () => {
    const report = buildReport('Tara', emptyProgress(), NOW);
    expect(report.stage).toBe(1);
    expect(report.headline).toMatch(/hasn’t|hasn't/);
    expect(report.skills.every((s) => s.verdict === 'new')).toBe(true);
    expect(report.week.rounds).toBe(0);
  });
});
