import { AppIcon } from './AppIcon';

/** Unicorn tile + "Maths Garden" wordmark in raspberry. */
export const Logo = ({ size = 44 }: { size?: number }) => (
  <span className="inline-flex items-center gap-3 font-bold text-raspberry" style={{ fontSize: size * 0.55 }}>
    <AppIcon size={size} />
    Maths Garden
  </span>
);
