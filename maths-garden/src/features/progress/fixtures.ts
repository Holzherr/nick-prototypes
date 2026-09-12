import type { Child } from '@/features/children/model';
import type { GameId } from '@/features/games/catalog';
import type { AnswerRecord, RoundRecord } from '@/features/games/engine';
import { mulberry32 } from '@/shared/utils/random';
import type { CheckinRecord, LevelEvent, Progress, StickerRecord } from './model';

/** Sample data for stories. */
export const TARA: Child = { id: 'child-tara', name: 'Tara', birthdate: '2022-05-23', avatar: '🦄' };

const daysAgo = (days: number, hour = 17) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const round = (id: string, game: GameId, level: number, targets: string[], wrong: string[], days: number, ms = 4200): RoundRecord => {
  const answers: AnswerRecord[] = targets.map((t) => ({ target: t, chosen: wrong.includes(t) ? 'other' : t, correct: !wrong.includes(t), ms, totalMs: ms + 1800 }));
  return { id, childId: TARA.id, game, level, score: answers.filter((a) => a.correct).length, total: answers.length, answers, playedAt: daysAgo(days), levelMax: 5 + level * 3 };
};

const checkin = (id: string, probe: CheckinRecord['probe'], score: number, max: number | null, takenOn: string): CheckinRecord => ({
  id,
  childId: TARA.id,
  probe,
  score,
  max,
  note: null,
  takenOn,
});

const sticker = (id: string, name: string, shiny = false, days = 1): StickerRecord => ({ id, childId: TARA.id, sticker: name, shiny, roundId: null, earnedAt: daysAgo(days) });

const event = (id: string, game: GameId, from: number, to: number, days: number, reason: LevelEvent['reason'] = 'earned'): LevelEvent => ({
  id,
  childId: TARA.id,
  game,
  from,
  to,
  reason,
  at: daysAgo(days),
});

/**
 * Eight weeks of play, so the charts have a real shape: accuracy climbing, answers getting quicker, a few
 * gap days, one drop back and several move-ups.
 */
function history(): RoundRecord[] {
  const rng = mulberry32(7);
  const games: GameId[] = ['peek', 'count', 'find', 'more', 'add'];
  const rounds: RoundRecord[] = [];
  for (let day = 56; day >= 0; day--) {
    if (rng() < 0.35) continue; // days with nothing
    const perDay = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < perDay; i++) {
      const game = games[Math.floor(rng() * games.length)];
      const level = Math.min(3, Math.floor((56 - day) / 18) + (game === 'peek' ? 1 : 0));
      // Accuracy drifts up over the weeks; speed drifts down from 6s to 2.5s an answer.
      const base = 0.55 + (56 - day) / 160;
      const score = Math.max(1, Math.min(5, Math.round(base * 5 + (rng() - 0.5) * 2)));
      const targets = Array.from({ length: 5 }, () => String(1 + Math.floor(rng() * (4 + level * 3))));
      const wrong = targets.filter(() => rng() > base).slice(0, 5 - score);
      rounds.push(round(`h-${day}-${i}`, game, level, targets, wrong, day, Math.round(6000 - (56 - day) * 60 + (rng() - 0.5) * 1200)));
    }
  }
  return rounds;
}

export const SAMPLE_PROGRESS: Progress = {
  rounds: [
    ...history(),
    round('r1', 'peek', 0, ['2', '3', '1', '3', '2'], [], 6),
    round('r2', 'peek', 0, ['3', '1', '2', '3', '1'], ['3'], 5),
    round('r3', 'peek', 1, ['4', '5', '3', '4', '2'], ['4', '5'], 3),
    round('r4', 'count', 0, ['5', '3', '4', '2', '5'], [], 4),
    round('r5', 'find', 1, ['6', '9', '2', '7', '10'], ['6', '9'], 2),
    round('r6', 'find', 1, ['9', '3', '6', '8', '1'], ['6', '9', '8'], 1),
    round('r7', 'more', 0, ['3 vs 5', '4 vs 2', '1 vs 5', '5 vs 4', '2 vs 3'], ['5 vs 4'], 1),
    round('r8', 'add', 0, ['4', '3', '5', '4', '3'], ['5'], 0),
  ],
  levels: { peek: 2, count: 1, find: 1, more: 1, add: 0 },
  levelEvents: [
    event('e1', 'peek', 0, 1, 44),
    event('e2', 'count', 0, 1, 33),
    event('e3', 'find', 0, 1, 26),
    event('e4', 'peek', 1, 2, 18),
    event('e5', 'more', 0, 1, 12),
    event('e6', 'find', 1, 0, 9, 'dropped'),
    event('e7', 'find', 0, 1, 4),
    event('e8', 'add', 1, 0, 2, 'manual'),
  ],
  checkins: [
    checkin('c1', 'rote', 14, null, '2026-08-29'),
    checkin('c2', 'rote', 17, null, '2026-09-05'),
    checkin('c3', 'subitising', 6, 10, '2026-08-29'),
    checkin('c4', 'subitising', 8, 10, '2026-09-05'),
    checkin('c5', 'numerals', 7, 11, '2026-09-05'),
  ],
  stickers: [
    sticker('s1', 'unicorn/rainbow', true, 6),
    sticker('s2', 'unicorn/unicorn', false, 5),
    sticker('s3', 'kpop/microphone', false, 3),
    sticker('s4', 'ice/snowflake', true, 2),
    sticker('s5', 'unicorn/rainbow', false, 1),
    sticker('s6', 'kpop/tiger', false, 0),
  ],
};
