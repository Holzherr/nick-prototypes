import { qrCode } from '../qr';

export interface QrBadgeProps {
  url: string;
  label: string;
  /** Printed width, in millimetres. */
  size?: number;
}

/**
 * The paper-to-screen link: a QR code on the sheet that opens the game checking this skill, at this stage.
 * Drawn as one SVG path, so it prints crisply and needs nothing at runtime.
 */
export function QrBadge({ url, label, size = 18 }: QrBadgeProps) {
  const { d, modules } = qrCode(url);
  return (
    <div className="flex shrink-0 items-center gap-[2.5mm]">
      <svg viewBox={`-1 -1 ${modules + 2} ${modules + 2}`} style={{ width: `${size}mm`, height: `${size}mm` }} role="img" aria-label={`QR code for ${url}`}>
        <rect x={-1} y={-1} width={modules + 2} height={modules + 2} fill="#fff" />
        <path d={d} fill="#6b2d5c" />
      </svg>
      <span className="max-w-[44mm] text-[2.9mm] leading-tight">{label}</span>
    </div>
  );
}
