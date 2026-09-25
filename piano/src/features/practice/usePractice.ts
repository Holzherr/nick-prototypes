import { useCallback, useEffect, useRef, useState } from 'react';
import { useSynth } from '@/features/audio/useSynth.ts';
import type { Piece } from '@/features/score/types.ts';
import { logPress, type SessionRecord } from './sessionLog.ts';
import { syncSession } from './sessionSync.ts';

/** Practice state. There is no fail state anywhere in here on purpose: a wrong
 *  key sounds the note she pressed and leaves the target lit, so exploring the
 *  keyboard costs nothing. */
export function usePractice(piece: Piece, soundOn: boolean) {
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState<boolean[]>(() => piece.notes.map(() => false));
  const [bpm, setBpm] = useState(piece.tempoBpm);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);
  /** The run she is on, stored after every correct press. Null until the first correct
   *  press, and back to null whenever the run stops being hers from the start: after
   *  the last note, after a jump via the strip or Next, or when the app plays along. */
  const session = useRef<SessionRecord | null>(null);
  const { play, click, cheer } = useSynth(soundOn);

  const note = piece.notes[index];
  const next = piece.notes[index + 1];

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const goTo = useCallback(
    (i: number) => {
      stop();
      setIndex(Math.max(0, Math.min(piece.notes.length - 1, i)));
      session.current = null;
    },
    [piece.notes.length, stop],
  );

  const restart = useCallback(() => {
    stop();
    setPlayed(piece.notes.map(() => false));
    setIndex(0);
    session.current = null;
  }, [piece.notes, stop]);

  /** She pressed a key. Right one moves on; wrong one just sounds. */
  const press = useCallback(
    (pitch: number) => {
      play(pitch, 1);
      if (pitch !== piece.notes[index].pitch) return;
      setPlayed(p => {
        const copy = [...p];
        copy[index] = true;
        return copy;
      });
      const last = index === piece.notes.length - 1;
      session.current = logPress(session.current, piece.id, piece.notes.length, new Date());
      syncSession(session.current);
      if (last) {
        session.current = null;
        cheer();
      } else setIndex(index + 1);
    },
    [cheer, index, piece.id, piece.notes, play],
  );

  /** Play the piece through with a count-in, lighting each note in time. */
  const playAlong = useCallback(() => {
    stop();
    setPlaying(true);
    session.current = null;
    const beat = 60000 / bpm;
    const from = index;
    const origin = piece.notes[from].onset;

    for (let c = 0; c < piece.beatsPerBar; c++) {
      timers.current.push(window.setTimeout(() => click(c === 0), c * beat));
    }
    const lead = piece.beatsPerBar * beat;

    piece.notes.slice(from).forEach((n, k) => {
      timers.current.push(
        window.setTimeout(() => {
          setIndex(from + k);
          setPlayed(p => {
            const copy = [...p];
            copy[from + k] = true;
            return copy;
          });
          play(n.pitch, Math.max(0.5, (n.duration * beat) / 1000));
          if (from + k === piece.notes.length - 1) {
            timers.current.push(window.setTimeout(() => { stop(); cheer(); }, n.duration * beat + 200));
          }
        }, lead + (n.onset - origin) * beat),
      );
    });
  }, [bpm, cheer, click, index, piece, play, stop]);

  return { index, note, next, played, bpm, setBpm, playing, goTo, restart, press, playAlong, stop, play };
}
