import { useCallback, useRef } from 'react';
import { frequencyOf } from '@/features/score/music.ts';

/** A small additive piano-ish voice. No samples: the whole app has to work
 *  offline from a service worker, and a sampled piano would dwarf it. */
export function useSynth(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);

  const resume = useCallback(() => {
    if (!enabled) return null;
    if (!ctx.current) {
      try {
        ctx.current = new AudioContext();
      } catch {
        return null;
      }
    }
    if (ctx.current.state === 'suspended') void ctx.current.resume();
    return ctx.current;
  }, [enabled]);

  const play = useCallback(
    (pitch: number, seconds = 1.1, velocity = 1) => {
      const ac = resume();
      if (!ac) return;
      const f = frequencyOf(pitch);
      const t = ac.currentTime;
      const out = ac.createGain();
      out.connect(ac.destination);
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(0.2 * velocity, t + 0.012);
      out.gain.exponentialRampToValueAtTime(0.0001, t + seconds);

      for (const [partial, gain] of [[1, 1], [2, 0.3], [3, 0.11], [4, 0.05], [6, 0.02]]) {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = partial === 1 ? 'triangle' : 'sine';
        osc.frequency.value = f * partial;
        g.gain.value = gain;
        osc.connect(g);
        g.connect(out);
        osc.start(t);
        osc.stop(t + seconds + 0.06);
      }
    },
    [resume],
  );

  const click = useCallback(
    (accent: boolean) => {
      const ac = resume();
      if (!ac) return;
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.frequency.value = accent ? 1500 : 1000;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(accent ? 0.1 : 0.05, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    },
    [resume],
  );

  const cheer = useCallback(() => {
    [76, 83, 88].forEach((m, i) => setTimeout(() => play(m, 0.5, 0.45), i * 70));
  }, [play]);

  return { play, click, cheer };
}
