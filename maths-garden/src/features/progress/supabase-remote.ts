import { isGameId } from '@/features/games/catalog';
import type { AnswerRecord, Levels, RoundRecord } from '@/features/games/engine';
import { supabase } from '@/shared/supabase/client';
import type { Database, Json } from '@/shared/supabase/types';
import { PermanentError, type CheckinRecord, type Remote, type StickerRecord } from './model';
import { isProbeId } from './probes';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

const ROUND_LIMIT = 300;

const toRound = (row: Row<'maths_rounds'>): RoundRecord | null =>
  isGameId(row.game)
    ? {
        id: row.id,
        childId: row.child_id,
        game: row.game,
        level: row.level,
        score: row.score,
        total: row.total,
        answers: (row.answers ?? []) as unknown as AnswerRecord[],
        playedAt: row.played_at,
      }
    : null;

const toCheckin = (row: Row<'maths_checkins'>): CheckinRecord | null =>
  isProbeId(row.probe)
    ? { id: row.id, childId: row.child_id, probe: row.probe, score: row.score, max: row.max, note: row.note, takenOn: row.taken_on }
    : null;

const toSticker = (row: Row<'maths_stickers'>): StickerRecord => ({
  id: row.id,
  childId: row.child_id,
  sticker: row.sticker,
  shiny: row.shiny,
  roundId: row.round_id,
  earnedAt: row.earned_at,
});

/**
 * Postgres data/constraint/permission errors (22xxx, 23xxx, 42xxx) won't succeed on retry. Everything
 * else (no network, expired session) will, so it stays queued.
 */
const raise = (error: { code?: string; message: string } | null) => {
  if (!error) return;
  if (/^(22|23|42)/.test(error.code ?? '')) throw new PermanentError(`${error.code}: ${error.message}`);
  throw new Error(error.message);
};

const once = { onConflict: 'id', ignoreDuplicates: true } as const;

export const supabaseRemote: Remote = {
  async fetch(childId) {
    const [rounds, levels, checkins, stickers] = await Promise.all([
      supabase.from('maths_rounds').select('*').eq('child_id', childId).order('played_at', { ascending: false }).limit(ROUND_LIMIT),
      supabase.from('maths_levels').select('*').eq('child_id', childId),
      supabase.from('maths_checkins').select('*').eq('child_id', childId).order('taken_on'),
      supabase.from('maths_stickers').select('*').eq('child_id', childId).order('earned_at'),
    ]);
    raise(rounds.error);
    raise(levels.error);
    raise(checkins.error);
    raise(stickers.error);
    const levelMap: Levels = {};
    for (const row of levels.data ?? []) if (isGameId(row.game)) levelMap[row.game] = row.level;
    return {
      rounds: (rounds.data ?? []).map(toRound).filter((r) => r !== null).reverse(),
      levels: levelMap,
      checkins: (checkins.data ?? []).map(toCheckin).filter((c) => c !== null),
      stickers: (stickers.data ?? []).map(toSticker),
    };
  },

  async push(change) {
    switch (change.kind) {
      case 'round': {
        const r = change.round;
        const { error } = await supabase
          .from('maths_rounds')
          .upsert({ id: r.id, child_id: r.childId, game: r.game, level: r.level, score: r.score, total: r.total, answers: r.answers as unknown as Json, played_at: r.playedAt }, once);
        return raise(error);
      }
      case 'level': {
        const { error } = await supabase
          .from('maths_levels')
          .upsert({ child_id: change.childId, game: change.game, level: change.level, updated_at: new Date().toISOString() });
        return raise(error);
      }
      case 'checkin': {
        const c = change.checkin;
        const { error } = await supabase
          .from('maths_checkins')
          .upsert({ id: c.id, child_id: c.childId, probe: c.probe, score: c.score, max: c.max, note: c.note, taken_on: c.takenOn }, once);
        return raise(error);
      }
      case 'sticker': {
        const s = change.sticker;
        const { error } = await supabase
          .from('maths_stickers')
          .upsert({ id: s.id, child_id: s.childId, sticker: s.sticker, shiny: s.shiny, round_id: s.roundId, earned_at: s.earnedAt }, once);
        return raise(error);
      }
    }
  },
};
