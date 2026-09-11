import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { Game } from '../catalog';
import type { AnswerRecord } from '../engine';
import { makeRound, questionKey, type Choice, type Question } from '../questions';
import { hush, numberWord, praise, say, sounds } from '../sound';
import { Burst } from './Burst';
import { QuestionView } from './QuestionView';
import { StarRow } from './StarRow';

export interface GameScreenProps {
  game: Game;
  level: number;
  childName: string;
  /** Fixed questions (stories, tests); otherwise a random round for the level. */
  questions?: Question[];
  onFinish: (answers: AnswerRecord[]) => void;
  onHome: () => void;
}

/** Runs one round: home button and star row on top, one question at a time, praise or a gentle correction after each tap. */
export function GameScreen({ game, level, childName, questions: preset, onFinish, onHome }: GameScreenProps) {
  const [questions] = useState(() => preset ?? makeRound(game.id, game.levels[level]));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const shownAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    shownAt.current = Date.now();
  }, [index]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const q = questions[index];

  const answer = (choice: Choice) => {
    if (chosen !== null) return;
    const correct = choice === q.answer;
    const all = [...answers, { target: questionKey(q), chosen: String(choice), correct, ms: Date.now() - shownAt.current }];
    setAnswers(all);
    setChosen(choice);
    if (correct) {
      sounds.right();
      say(praise(childName));
    } else {
      sounds.wrong();
      say(q.game === 'more' ? 'Good try! The other side had more.' : `Good try! It was ${numberWord(q.answer)}.`);
    }
    timer.current = window.setTimeout(
      () => {
        if (index + 1 >= questions.length) return onFinish(all);
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
            onHome();
          }}
        >
          🏠
        </Button>
        <StarRow total={questions.length} results={answers.map((a) => a.correct)} />
        <span className="w-[58px]" aria-hidden />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-8">
        <QuestionView key={index} question={q} chosen={chosen} onAnswer={answer} />
      </main>
      {chosen !== null && chosen === q.answer && <Burst key={index} />}
    </div>
  );
}
