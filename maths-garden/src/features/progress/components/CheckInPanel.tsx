import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { CheckinRecord } from '../model';
import { PROBES, type ProbeId } from '../probes';

export type CheckinScores = Partial<Record<ProbeId, number>>;

export interface CheckInPanelProps {
  checkins: readonly CheckinRecord[];
  onSubmit: (scores: CheckinScores, note: string) => void;
  initiallyOpen?: boolean;
  /** Inside a Section on the grown-ups screen: drop the heading and blurb the section already provides. */
  bare?: boolean;
}

const shortDate = (ymd: string) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/**
 * "Weekly check-in": closed, one line per probe with the last four scores as a trend ("14 → 17");
 * open, a form with each probe's instructions and a number box (blank = skipped) plus a note.
 */
export function CheckInPanel({ checkins, onSubmit, initiallyOpen = false, bare = false }: CheckInPanelProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const [scores, setScores] = useState<Partial<Record<ProbeId, string>>>({});
  const [note, setNote] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed: CheckinScores = {};
    for (const p of PROBES) {
      const raw = scores[p.id]?.trim();
      if (raw) parsed[p.id] = Math.max(0, Math.round(Number(raw)));
    }
    if (!Object.keys(parsed).length) return;
    onSubmit(parsed, note.trim());
    setScores({});
    setNote('');
    setOpen(false);
  };

  return (
    <section className={bare ? undefined : 'mt-8'}>
      {/* Bare drops the heading, but "Log a check-in" must survive it: it is the only way to open the form. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!bare && <h3 className="text-2xl font-semibold text-raspberry">Weekly check-in</h3>}
        {!open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            Log a check-in
          </Button>
        )}
      </div>
      {!bare && (
        <p className="mt-1 text-sm text-grape/70">
          Five minutes with real objects once a week, away from the iPad. Shows whether the screen skills carry over, and covers rote counting, which no game
          tests.
        </p>
      )}
      {open ? (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          {PROBES.map((p) => (
            <label key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-blush/70 p-3">
              <span className="min-w-[200px] flex-1">
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-sm text-grape/70">{p.how}</span>
              </span>
              <span className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={p.max ?? undefined}
                  value={scores[p.id] ?? ''}
                  onChange={(e) => setScores({ ...scores, [p.id]: e.target.value })}
                  className="w-20 text-center"
                  aria-label={`${p.name} score`}
                />
                <span className="w-10 text-sm text-grape/70">{p.max ? `/ ${p.max}` : ''}</span>
              </span>
            </label>
          ))}
          <Input placeholder="Note (optional): what went well, what was hard" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-3">
            <Button type="submit">Save check-in</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <ul className="mt-3 divide-y-2 divide-dashed divide-petal">
          {PROBES.map((p) => {
            const history = checkins
              .filter((c) => c.probe === p.id)
              .toSorted((a, b) => a.takenOn.localeCompare(b.takenOn))
              .slice(-4);
            const last = history.at(-1);
            return (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="font-semibold">{p.name}</span>
                <span className="text-grape/80">
                  {last ? (
                    <>
                      {history.map((c) => c.score).join(' → ')}
                      {p.max ? ` / ${p.max}` : ''}
                      <span className="ml-2 text-sm text-grape/50">last {shortDate(last.takenOn)}</span>
                    </>
                  ) : (
                    <span className="text-grape/50">No scores yet</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
