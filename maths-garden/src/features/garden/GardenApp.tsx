import { useEffect, useRef, useState } from 'react';
import type { Child } from '@/features/children/model';
import { GAMES, type Game } from '@/features/games/catalog';
import { EndScreen } from '@/features/games/components/EndScreen';
import { GameScreen } from '@/features/games/components/GameScreen';
import { GardenHome } from '@/features/games/components/GardenHome';
import { GrownUpsGate } from '@/features/games/components/GrownUpsGate';
import { levelOf, nextLevel, type AnswerRecord, type RoundRecord } from '@/features/games/engine';
import { breakSuggestion, isPersonalBest, todaySummary, type BreakReason } from '@/features/games/insights';
import { setNameSound, unlockAudio } from '@/features/games/sound';
import type { CheckinScores } from '@/features/progress/components/CheckInPanel';
import { DashboardScreen } from '@/features/progress/components/DashboardScreen';
import { nameSoundKey } from '@/features/progress/components/VoicePanel';
import { applyChange, type Change, type StickerRecord } from '@/features/progress/model';
import { PROBES } from '@/features/progress/probes';
import type { ProgressRepo } from '@/features/progress/repo';
import { drawReward, stickerById, type PackId, type Sticker } from '@/features/stickers/catalog';
import { NovaCelebration } from '@/features/stickers/components/NovaCelebration';
import { StickerBookScreen } from '@/features/stickers/components/StickerBookScreen';
import { drawSpecial, pendingMilestone } from '@/features/stickers/milestones';
import { readJSON } from '@/shared/utils/storage';

type Screen =
  | { name: 'home' }
  | { name: 'game'; game: Game; level: number; run: number }
  | {
      name: 'end';
      game: Game;
      roundId: string;
      score: number;
      total: number;
      levelUp: boolean;
      personalBest: boolean;
      goal: { done: number; goal: number; justReached: boolean };
      breakHint: BreakReason | null;
      sticker: StickerRecord | null;
    }
  | { name: 'stickers' }
  | { name: 'gate' }
  | { name: 'dashboard' };

export interface GardenAppProps {
  child: Child;
  repo: ProgressRepo;
  onSwitchChild: () => void;
  onSignOut: () => void;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * One child's garden: home → game → end (pick a sticker) → …, plus the sticker book and the gated grown-ups
 * screen. Nova pops up over home or the end screen when a milestone is owed a special sticker, at most once
 * between games.
 */
export function GardenApp({ child, repo, onSwitchChild, onSignOut }: GardenAppProps) {
  const [progress, setProgress] = useState(() => repo.cached(child.id));
  const [pending, setPending] = useState(() => repo.pending());
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [celebration, setCelebration] = useState<{ line: string; reward: { sticker: Sticker; sparkly: boolean } } | null>(null);
  const [novaDone, setNovaDone] = useState(false);
  const latest = useRef(progress);
  const runs = useRef(0);

  useEffect(() => {
    latest.current = progress;
  }, [progress]);

  useEffect(() => {
    setNameSound(child.name, readJSON<string | null>(nameSoundKey(child.id), null));
  }, [child.id, child.name]);

  useEffect(() => {
    let live = true;
    void repo.load(child.id).then((loaded) => {
      if (!live) return;
      setProgress(loaded);
      setPending(repo.pending());
    });
    return () => {
      live = false;
    };
  }, [repo, child.id]);

  const apply = (change: Change) => {
    latest.current = applyChange(latest.current, change);
    setProgress(latest.current);
    setPending(repo.pending() + 1);
    void repo.apply(change).finally(() => setPending(repo.pending()));
  };

  const home = () => setScreen({ name: 'home' });

  const play = (game: Game) => {
    unlockAudio();
    runs.current += 1;
    setNovaDone(false);
    setScreen({ name: 'game', game, level: levelOf(latest.current.levels, game), run: runs.current });
  };

  const makeRound = (game: Game, level: number, answers: AnswerRecord[], completed: boolean): RoundRecord => ({
    id: crypto.randomUUID(),
    childId: child.id,
    game: game.id,
    level,
    score: answers.filter((a) => a.correct).length,
    total: answers.length,
    answers,
    playedAt: new Date().toISOString(),
    ...(completed ? {} : { completed: false }),
  });

  const finish = (game: Game, level: number, answers: AnswerRecord[]) => {
    const round = makeRound(game, level, answers, true);
    const all = [...latest.current.rounds, round];
    const next = nextLevel(all, game, level);
    apply({ kind: 'round', round });
    if (next !== level) apply({ kind: 'level', childId: child.id, game: game.id, level: next });
    const day = todaySummary(all);
    setScreen({
      name: 'end',
      game,
      roundId: round.id,
      score: round.score,
      total: round.total,
      levelUp: next > level,
      personalBest: isPersonalBest(all, round),
      goal: { done: day.done, goal: day.goal, justReached: day.done === day.goal },
      breakHint: breakSuggestion(all),
      sticker: null,
    });
  };

  /** Left mid-round: keep what was answered (it shows frustration patterns), but it never changes the level. */
  const quit = (game: Game, level: number, answers: AnswerRecord[]) => {
    if (answers.length) apply({ kind: 'round', round: makeRound(game, level, answers, false) });
    home();
  };

  const addSticker = (sticker: Sticker, shiny: boolean, roundId: string | null): StickerRecord => {
    const record: StickerRecord = { id: crypto.randomUUID(), childId: child.id, sticker: sticker.id, shiny, roundId, earnedAt: new Date().toISOString() };
    apply({ kind: 'sticker', sticker: record });
    return record;
  };

  const pickSticker = (pack: PackId) => {
    if (screen.name !== 'end' || screen.sticker) return;
    const reward = drawReward(pack, latest.current.stickers);
    const sticker = addSticker(reward.sticker, reward.sparkly || screen.score === screen.total || screen.goal.justReached, screen.roundId);
    setScreen({ ...screen, sticker });
  };

  const addCheckin = (scores: CheckinScores, note: string) => {
    const takenOn = today();
    for (const probe of PROBES) {
      const score = scores[probe.id];
      if (score === undefined || Number.isNaN(score)) continue;
      apply({ kind: 'checkin', checkin: { id: crypto.randomUUID(), childId: child.id, probe: probe.id, score, max: probe.max, note: note || null, takenOn } });
    }
  };

  const owed = pendingMilestone(progress.stickers, progress.levels, GAMES);
  const novaMoment = screen.name === 'home' || (screen.name === 'end' && screen.sticker !== null);
  const nova =
    celebration || (owed && novaMoment && !novaDone) ? (
      <NovaCelebration
        childName={child.name}
        line={celebration?.line ?? owed?.line(child.name) ?? ''}
        reward={celebration?.reward ?? null}
        onOpen={() => {
          if (!owed) return;
          const reward = drawSpecial(latest.current.stickers);
          addSticker(reward.sticker, reward.sparkly, null);
          setCelebration({ line: owed.line(child.name), reward });
        }}
        onClose={() => {
          setCelebration(null);
          setNovaDone(true);
        }}
      />
    ) : null;

  const view = (() => {
    switch (screen.name) {
      case 'home':
        return (
          <GardenHome
            childName={child.name}
            levels={progress.levels}
            stickerCount={progress.stickers.length}
            today={todaySummary(progress.rounds)}
            onPlay={play}
            onStickers={() => setScreen({ name: 'stickers' })}
            onGrownUps={() => setScreen({ name: 'gate' })}
          />
        );
      case 'game':
        return (
          <GameScreen
            key={screen.run}
            game={screen.game}
            level={screen.level}
            childName={child.name}
            onFinish={(answers) => finish(screen.game, screen.level, answers)}
            onHome={(answers) => quit(screen.game, screen.level, answers)}
          />
        );
      case 'end': {
        const drawn = screen.sticker ? stickerById(screen.sticker.sticker) : undefined;
        return (
          <EndScreen
            childName={child.name}
            score={screen.score}
            total={screen.total}
            levelUp={screen.levelUp}
            personalBest={screen.personalBest}
            goal={screen.goal}
            breakHint={screen.breakHint}
            sticker={drawn && screen.sticker ? { sticker: drawn, shiny: screen.sticker.shiny } : null}
            onPickPack={pickSticker}
            onAgain={() => play(screen.game)}
            onStickers={() => setScreen({ name: 'stickers' })}
            onHome={home}
          />
        );
      }
      case 'stickers':
        return <StickerBookScreen childName={child.name} stickers={progress.stickers} onHome={home} />;
      case 'gate':
        return <GrownUpsGate onPass={() => setScreen({ name: 'dashboard' })} onCancel={home} />;
      case 'dashboard':
        return (
          <DashboardScreen
            child={child}
            progress={progress}
            pending={pending}
            onSetLevel={(game, level) => apply({ kind: 'level', childId: child.id, game, level })}
            onAddCheckin={addCheckin}
            onSwitchChild={onSwitchChild}
            onSignOut={onSignOut}
            onClose={home}
          />
        );
    }
  })();

  return (
    <>
      {view}
      {nova}
    </>
  );
}
