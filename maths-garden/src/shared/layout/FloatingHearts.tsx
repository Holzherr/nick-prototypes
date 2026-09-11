const EMOJI = ['💗', '🌸', '⭐', '🦄'];

/** Faint emoji drifting up behind every screen. Positions are fixed per index so renders never reshuffle. */
export const FloatingHearts = ({ count = 10 }: { count?: number }) => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden print:hidden">
    {Array.from({ length: count }, (_, i) => (
      <span
        key={i}
        className="absolute top-0 animate-drift text-[34px] opacity-15"
        style={{ left: `${5 + ((i * 37) % 90)}vw`, animationDelay: `${-((i * 7) % 16)}s`, animationDuration: `${13 + ((i * 5) % 9)}s` }}
      >
        {EMOJI[i % EMOJI.length]}
      </span>
    ))}
  </div>
);
