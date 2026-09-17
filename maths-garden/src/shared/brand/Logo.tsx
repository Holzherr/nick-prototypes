import { useTheme } from '@/features/personalise/player';
import { ThemeMark } from '@/features/personalise/ThemeMark';

/** The chosen icon's tile + "Maths Garden" wordmark, in the theme's strong accent. */
export const Logo = ({ size = 44 }: { size?: number }) => (
  <span className="inline-flex items-center gap-3 font-bold text-raspberry" style={{ fontSize: size * 0.55 }}>
    <ThemeMark theme={useTheme()} size={size} />
    Maths Garden
  </span>
);
