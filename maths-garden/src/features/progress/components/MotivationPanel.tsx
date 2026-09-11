export interface MotivationPanelProps {
  today: { done: number; quit: number; goal: number };
  /** Days with a round in the last 7. */
  daysThisWeek: number;
  /** Coaching notes; empty when nothing needs attention. */
  notes: readonly string[];
  /** Recent level changes, newest first. */
  moves: readonly { name: string; from: number; to: number; at: string }[];
}

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * Blush panel on the grown-ups screen: chips for today's rounds against the goal, rounds left early and days
 * played this week; 💡 coaching notes (or an all-clear line); then the latest level moves with ⬆️/⬇️.
 */
export const MotivationPanel = ({ today, daysThisWeek, notes, moves }: MotivationPanelProps) => (
  <section className="mt-6 rounded-[28px] bg-blush/70 p-5">
    <h3 className="text-2xl font-semibold text-raspberry">Motivation</h3>
    <div className="mt-2 flex flex-wrap gap-2 text-sm">
      <span className="rounded-full bg-cream px-3 py-1">
        🎯 Today {today.done} of {today.goal} rounds
      </span>
      {today.quit > 0 && (
        <span className="rounded-full bg-cream px-3 py-1">
          🏠 Left {today.quit} round{today.quit === 1 ? '' : 's'} early today
        </span>
      )}
      <span className="rounded-full bg-cream px-3 py-1">📅 Played {daysThisWeek} of the last 7 days</span>
    </div>
    {notes.length ? (
      <ul className="mt-3 flex flex-col gap-1.5 text-sm">
        {notes.map((note) => (
          <li key={note}>💡 {note}</li>
        ))}
      </ul>
    ) : (
      <p className="mt-3 text-sm text-grape/70">No warning signs. Keep rounds short and stop on a win.</p>
    )}
    {moves.length > 0 && (
      <>
        <h4 className="mt-4 font-semibold">Level moves</h4>
        <ul className="mt-1 flex flex-col gap-1 text-sm text-grape/85">
          {moves.map((m) => (
            <li key={`${m.name}-${m.at}`}>
              {m.to > m.from ? '⬆️' : '⬇️'} {m.name}: Lv {m.from + 1} → {m.to + 1} <span className="text-grape/50">{when(m.at)}</span>
            </li>
          ))}
        </ul>
      </>
    )}
  </section>
);
