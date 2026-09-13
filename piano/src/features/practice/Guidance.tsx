import { holdLabel } from '@/features/score/music.ts';
import type { Note } from '@/features/score/types.ts';

export interface GuidanceProps {
  /** One sentence telling her what to do next. */
  text: string;
  note: Note;
}

/** Explains, never judges - the thing SimplyPiano got wrong for Tara. */
export function Guidance({ text, note }: GuidanceProps) {
  const pips = Math.max(1, Math.ceil(note.duration));
  return (
    <div className="hold">
      <p className="say">{text}</p>
      <div className="pips">
        {Array.from({ length: pips }, (_, i) => <span key={i} className="pip f" />)}
        <span className="cnt">{holdLabel(note)}</span>
      </div>
    </div>
  );
}
