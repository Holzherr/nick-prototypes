/**
 * The unicorn head: cream head facing left, gold striped horn, pink/lilac/gold mane, happy closed eye.
 * Drawn on a 100-unit box; meant to sit on the pink AppIcon tile.
 */
export const UnicornMark = ({ size = 64, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
    <g>
      <circle cx="67" cy="27" r="9" fill="#c9a7ff" />
      <circle cx="77" cy="38" r="9.5" fill="#ff7bac" />
      <circle cx="82" cy="52" r="9.5" fill="#ffc94d" />
      <circle cx="82" cy="66" r="9.5" fill="#c9a7ff" />
      <circle cx="78" cy="80" r="9.5" fill="#ff7bac" />
    </g>
    <path d="M60 31 L69 12 L74 34 Z" fill="#fffdf9" />
    <path d="M63.5 29.5 L68.8 18.5 L71.5 31.5 Z" fill="#ffd3e4" />
    <path
      d="M50 96 C51 88 51 81 46 77 C38 77 25 76 21 66 C18 57 23 49 32 45 L50 32 C60 26 72 30 75 42 C79 56 77 76 73 96 Z"
      fill="#fffdf9"
    />
    <circle cx="59" cy="31" r="6.5" fill="#c9a7ff" />
    <path d="M44 34 L56 28 L34 6 Z" fill="#ffc94d" />
    <path d="M41.5 24.8 L48.6 19.8 M37.8 16.8 L42.2 13.6" stroke="#e39a2d" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M41 55 Q46.5 60.5 52 55" stroke="#6b2d5c" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <circle cx="56" cy="64" r="4.5" fill="#ffd3e4" />
    <circle cx="27.5" cy="64" r="2.2" fill="#6b2d5c" />
  </svg>
);
