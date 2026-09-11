import { useEffect, useRef, useState } from 'react';
import type { Child } from '@/features/children/model';
import type { Game } from '@/features/games/catalog';
import { EndScreen } from '@/features/games/components/EndScreen';
import { GameScreen } from '@/features/games/components/GameScreen';
import { GardenHome } from '@/features/games/components/GardenHome';
import { GrownUpsGate } from '@/features/games/components/GrownUpsGate';
import { levelOf, nextLevel, type AnswerRecord, type RoundRecord } from '@/features/games/engine';
import { unlockAudio } from '@/features/games/sound';
import type { CheckinScores } from '@/features/progress/components/CheckInPanel';
import { DashboardScreen } from '@/features/progress/components/DashboardScreen';
import { applyChange, type Change, type StickerRecord } from '@/features/progress/model';
import { PROBES } from '@/features/progress/probes';
import type { ProgressRepo } from '@/features/progress/repo';
import { drawSticker, stickerById, type PackId } from '@/features/stickers/catalog';
import { StickerBookScreen } from '@/features/stickers/components/StickerBookScreen';

type Screen =
  | { name: 'home' }
  | { name: 'game'; game: Game; level: number; run: number }
  | { name: 'end'; game: Game; roundId: string; score: number; total: number; levelUp: boolean; sticker: StickerRecord | null }
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

/** One child's garden: home → game → end (pick a sticker) → …, plus the sticker book and the gated grown-ups screen. */
export function GardenApp({ child, repo, onSwitchChild, onSignOut }: GardenAppProps) {
  const [progress, setProgress] = useState(() => repo.cached(child.id));
  const [pending, setPending] = useState(() => repo.pending());
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const latest = useRef(progress);
  const runs = useRef(0);

  useEffect(() => {
    latest.current = progress;
  }, [progress]);

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
    setScreen({ name: 'game', game, level: levelOf(latest.current.levels, game), run: runs.current });
  };

  const finish = (game: Game, level: number, answers: AnswerRecord[]) => {
    const score = answers.filter((a) => a.correct).length;
    const round: RoundRecord = { id: crypto.randomUUID(), childId: child.id, game: game.id, level, score, total: answers.length, answers, playedAt: new Date().toISOString() };
    const next = nextLevel([...latest.current.rounds, round], game, level);
    apply({ kind: 'round', round });
    if (next !== level) apply({ kind: 'level', childId: child.id, game: game.id, level: next });
    setScreen({ name: 'end', game, roundId: round.id, score, total: round.total, levelUp: next > level, sticker: null });
  };

  const pickSticker = (pack: PackId) => {
    if (screen.name !== 'end' || screen.sticker) return;
    const drawn = drawSticker(
      pack,
      latest.current.stickers.map((s) => s.sticker),
    );
    const sticker: StickerRecord = {
      id: crypto.randomUUID(),
      childId: child.id,
      sticker: drawn.id,
      shiny: screen.score === screen.total,
      roundId: screen.roundId,
      earnedAt: new Date().toISOString(),
    };
    apply({ kind: 'sticker', sticker });
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

  switch (screen.name) {
    case 'home':
      return (
        <GardenHome
          childName={child.name}
          levels={progress.levels}
          stickerCount={progress.stickers.length}
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
          onHome={home}
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
}
