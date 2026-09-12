import { describe, expect, it } from 'vitest';
import type { GameId } from '@/features/games/catalog';
import type { RoundRecord } from '@/features/games/engine';
import { emptyProgress } from '@/features/progress/model';
import { buildReport } from './report';
import { buildReportEmail } from './report-email';

const NOW = new Date('2026-09-12T18:00:00Z');
const APP = 'https://nickholzherr.com/maths/';

const round = (id: string, game: GameId, level: number, score: number, hoursAgo: number): RoundRecord => ({
  id,
  childId: 'tara',
  game,
  level,
  score,
  total: 5,
  answers: Array.from({ length: 5 }, (_, i) => ({ target: '3', chosen: i < score ? '3' : '2', correct: i < score, ms: 1400 })),
  playedAt: new Date(NOW.getTime() - hoursAgo * 3600_000).toISOString(),
});

const report = () =>
  buildReport(
    'Tara',
    { ...emptyProgress(), rounds: [round('a', 'peek', 1, 5, 5), round('b', 'peek', 1, 5, 4), round('c', 'find', 0, 2, 3), round('d', 'find', 0, 1, 2)], levels: { peek: 2 } },
    NOW,
  );

describe('report email', () => {
  it('leads with the stage-up when there is one', () => {
    const email = buildReportEmail(report(), { appUrl: APP, stageUp: { skillName: 'Subitising', stage: 3 } });
    expect(email.subject).toBe('Tara has moved up to stage 3 in Subitising');
    expect(email.html).toContain('Tara has moved up to stage 3 in Subitising');
  });

  it('falls back to a plain report subject', () => {
    expect(buildReportEmail(report(), { appUrl: APP }).subject).toMatch(/^Tara’s maths report — stage \d$/);
  });

  it('makes every printable link absolute so it works from a phone', () => {
    const email = buildReportEmail(report(), { appUrl: APP });
    const links = [...email.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(1);
    expect(links.every((href) => href.startsWith('https://'))).toBe(true);
    expect(email.text).toContain(`${APP}#/resources/`);
  });

  it('says what to work on, in both html and plain text', () => {
    const email = buildReportEmail(report(), { appUrl: APP });
    expect(email.html).toContain('Needs work');
    expect(email.text).toContain('Needs work: Numeral recognition');
    expect(email.text).toContain('Away from the screen:');
  });

  it('escapes anything a name could contain', () => {
    const built = buildReport('<script>', emptyProgress(), NOW);
    expect(buildReportEmail(built, { appUrl: APP }).html).not.toContain('<script>');
  });
});
