/**
 * Unicode has no angler fish, so this one is drawn: a round purple fish with a big eye, a toothy grin and a
 * glowing lure — friendly rather than deep-sea scary, for a four-year-old. Sized by its container like an emoji.
 */
export const Anglerfish = ({ size }: { size: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
    <circle cx="72" cy="16" r="14" fill="#fff6a8" opacity="0.45" />
    <path d="M42 36 C44 18 58 8 72 16" stroke="#3b2a5c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <circle cx="72" cy="16" r="6.5" fill="#ffe45c" stroke="#ffffff" strokeWidth="2" />
    <path d="M80 58 L97 43 L95 75 Z" fill="#4b3a78" />
    <ellipse cx="50" cy="58" rx="36" ry="28" fill="#4b3a78" />
    <ellipse cx="48" cy="70" rx="24" ry="12" fill="#7a68b0" />
    <path d="M56 62 q10 12 22 4 q-9 -1 -13 -11 z" fill="#6a58a0" />
    <circle cx="62" cy="46" r="2.5" fill="#7a68b0" />
    <circle cx="70" cy="52" r="2" fill="#7a68b0" />
    <circle cx="56" cy="40" r="1.8" fill="#7a68b0" />
    <path d="M14 54 Q28 78 48 62 Q32 66 14 54 Z" fill="#241634" />
    <path d="M19 57 L22 63 L25 59 L28 65 L31 61 L34 66 L37 62 L40 66 L43 62" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="35" cy="44" r="10" fill="#ffffff" />
    <circle cx="33" cy="45" r="5.5" fill="#1b1030" />
    <circle cx="31" cy="42.5" r="2" fill="#ffffff" />
  </svg>
);
