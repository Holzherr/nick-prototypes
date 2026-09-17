import { UnicornMark } from '@/shared/brand/UnicornMark';
import { cn } from '@/shared/utils/cn';
import { themeById, type ThemeId } from './themes';

/**
 * The chosen icon on its tile — the themed replacement for AppIcon.
 *
 * The tile takes its gradient from the live palette, so it repaints with everything else. The unicorn
 * keeps its drawn mark (it is the app's own artwork, and the favicon); every other theme is its glyph.
 */
export function ThemeMark({ theme, size = 64, className }: { theme: ThemeId; size?: number; className?: string }) {
  const { glyph, id } = themeById(theme);
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-bubble to-raspberry', className)}
      style={{ width: size, height: size, borderRadius: size * 0.225 }}
    >
      {id === 'unicorn' ? <UnicornMark size={size * 0.86} /> : <span style={{ fontSize: size * 0.54, lineHeight: 1 }}>{glyph}</span>}
    </span>
  );
}
