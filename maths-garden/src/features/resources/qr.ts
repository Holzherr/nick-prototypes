import qrcode from 'qrcode-generator';

/** Absolute link into this deployment ("#/play/count"), for QR codes on paper and links in email. */
export const appUrl = (hash: string, origin = window.location.origin, base = import.meta.env.BASE_URL) => `${origin}${base}${hash}`;

export interface QrCode {
  /** One path covering every dark module, in a 0 0 modules modules viewBox. */
  d: string;
  modules: number;
}

/** A QR code as a single SVG path, so a printable can draw it without any runtime or image. */
export function qrCode(text: string): QrCode {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const modules = qr.getModuleCount();
  let d = '';
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
  }
  return { d, modules };
}
