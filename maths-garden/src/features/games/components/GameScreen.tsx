import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { Game } from '../catalog';
import { shouldEase, streakOf, type AnswerRecord } from '../engine';
import { makeQuestion, makeRound, questionKey, type Choice, type Question } from '../questions';
import { hush, numberWord, praise, say, sounds } from '../sound';
import { Burst } from './Burst';
import { QuestionView } from './QuestionView';
import { StarRow } from './StarRow';

/** A round left part-way through, enough to carry on exactly where it stopped. */
export interface PausedRound {
  questions: Question[];
  index: number;
  answers: AnswerRecord[];
}

export interface GameScreenProps {
  game: Game;
  level: number;
  childName: string;
  /** Fixed questions (stories, tests); otherwise a random round for the level. */
  questions?: Question[];
  /** Carrying on a paused round: same questions, same place, same answers. */
  resume?: PausedRound;
  onFinish: (answers: AnswerRecord[]) => void;
  /** Left mid-round, with everything needed to carry on later. */
  onHome: (paused: PausedRound) => void;
}

/**
 * Runs one round: home button and star row on top, one question at a time, praise or a gentle correction
 * after each tap. Logs answer time, whole-question time, counting taps and replays per question; says
 * "Three in a row!" on streaks; after two misses in a row, asks the next question from the level below.
 */
export function GameScreen({ game, level, childName, questions: preset, resume, onFinish, onHome }: GameScreenProps) {
  const [questions, setQuestions] = useState(() => resume?.questions ?? preset ?? makeRound(game.id, game.levels[level]));
  const [index, setIndex] = useState(resume?.index ?? 0);
  const [answers, setAnswers] = useState<AnswerRecord[]>(resume?.answers ?? []);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const eased = useRef(new Set<number>());
  const track = useRef({ shownAt: 0, readyAt: 0, taps: 0, counted: 0, replays: 0 });
  const timer = useRef<number | undefined>(undefined);

  const q = questions[index];
  // Quick Peek and One More Unicorn show their answers later; onReady marks that moment.
  const delayedAnswers = q.game === 'peek' || q.game === 'add';

  useEffect(() => {
    const now = Date.now();
    track.current = { shownAt: now, readyAt: delayedAnswers ? 0 : now, taps: 0, counted: 0, replays: 0 };
  }, [index, delayedAnswers]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const answer = (choice: Choice) => {
    if (chosen !== null) return;
    const now = Date.now();
    const t = track.current;
    const correct = choice === q.answer;
    const record: AnswerRecord = { target: questionKey(q), chosen: String(choice), correct, ms: now - (t.readyAt || t.shownAt), totalMs: now - t.shownAt };
    if (q.game === 'count') Object.assign(record, { taps: t.taps, counted: t.counted });
    if (q.game === 'find') record.replays = t.replays;
    if (eased.current.has(index)) record.eased = true;
    const all = [...answers, record];
    setAnswers(all);
    setChosen(choice);

    const streak = streakOf(all);
    if (correct) {
      sounds.right();
      say(streak === 5 ? `Five in a row! Amazing, ${childName}!` : streak === 3 ? 'Three in a row!' : praise(childName));
    } else {
      sounds.wrong();
      say(q.game === 'more' ? 'Good try! The other side had more.' : `Good try! It was ${numberWord(q.answer)}.`);
    }

    timer.current = window.setTimeout(
      () => {
        if (index + 1 >= questions.length) return onFinish(all);
        if (!preset && level > 0 && shouldEase(all)) {
          eased.current.add(index + 1);
          setQuestions((current) => current.map((question, i) => (i === index + 1 ? makeQuestion(game.id, game.levels[level - 1]) : question)));
        }
        setIndex(index + 1);
        setChosen(null);
      },
      correct ? 1400 : 2300,
    );
  };

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-[22px] pb-2 pt-[max(16px,env(safe-area-inset-top))]">
        <Button
          variant="quiet"
          size="icon"
          aria-label="Home"
          onClick={() => {
            hush();
            window.clearTimeout(timer.current);
            // Hand back the whole round, not just the answers: leaving is a pause, so home can offer to
            // carry on from this exact question rather than throwing the round away on one stray tap.
            onHome({ questions, index, answers });
          }}
        >
          🏠
        </Button>
        <StarRow total={questions.length} results={answers.map((a) => a.correct)} />
        <span className="w-[58px]" aria-hidden />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-8">
        <QuestionView
          key={index}
          question={q}
          chosen={chosen}
          onAnswer={answer}
          onReady={() => {
            track.current.readyAt = Date.now();
          }}
          onTap={(fresh) => {
            track.current.taps += 1;
            if (fresh) track.current.counted += 1;
          }}
          onReplay={() => {
            track.current.replays += 1;
          }}
        />
      </main>
      {chosen !== null && chosen === q.answer && <Burst key={index} />}
    </div>
  );
}
