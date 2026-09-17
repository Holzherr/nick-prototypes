import { THEMES, type ThemeId } from './themes';
import { ThemeMark } from './ThemeMark';

/**
 * Pick an icon, and the app changes colour with it.
 *
 * Every option is drawn in its OWN palette rather than the current one, so the row shows what each choice
 * does before it is made — a child who wants the green dragon can see the green.
 */
export function ThemePicker({ value, onChange, size = 56 }: { value: ThemeId; onChange: (id: ThemeId) => void; size?: number }) {
  return (
    <div role="radiogroup" aria-label="Pick your icon" className="flex flex-wrap justify-center gap-2">
      {THEMES.map((theme) => {
        const chosen = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={chosen}
            aria-label={theme.label}
            title={theme.label}
            onClick={() => onChange(theme.id)}
            style={{ '--color-bubble': theme.colors.bubble, '--color-raspberry': theme.colors.raspberry } as React.CSSProperties}
            className={
              'rounded-[22px] p-1.5 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry ' +
              (chosen ? 'scale-110 bg-petal' : 'opacity-70 hover:scale-105 hover:opacity-100')
            }
          >
            <ThemeMark theme={theme.id} size={size} />
          </button>
        );
      })}
    </div>
  );
}
