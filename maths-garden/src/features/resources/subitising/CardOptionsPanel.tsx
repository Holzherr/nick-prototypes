import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { ICONS, SIZES, STAGES, type CardOptions, type CardSize, type Stage } from './cards';
import { ARRANGEMENTS } from './patterns';

export interface CardOptionsPanelProps {
  options: CardOptions;
  onChange: (options: CardOptions) => void;
  cardCount: number;
  pageCount: number;
  onPrint: () => void;
  className?: string;
}

const Label = ({ children }: { children: string }) => <span className="mb-1.5 block font-semibold">{children}</span>;

const chip = (on: boolean) =>
  cn('rounded-2xl border-2 px-3 py-2 text-left transition-colors', on ? 'border-bubble bg-petal/60' : 'border-petal bg-white hover:border-bubble/60');

/** The card maker's controls: name, picture, stage, patterns, answers, extras, size, then a summary and Print. */
export function CardOptionsPanel({ options, onChange, cardCount, pageCount, onPrint, className }: CardOptionsPanelProps) {
  const set = (patch: Partial<CardOptions>) => onChange({ ...options, ...patch });
  const { from, to } = STAGES[options.stage];

  return (
    <Card className={cn('flex flex-col gap-5 p-6', className)}>
      <label>
        <Label>Child’s name (optional)</Label>
        <Input value={options.name} maxLength={24} placeholder="Printed small on each card" onChange={(e) => set({ name: e.target.value })} />
      </label>

      <fieldset>
        <legend>
          <Label>Picture</Label>
        </legend>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              aria-pressed={options.icon === icon}
              aria-label={icon === 'dot' ? 'Plain dots' : icon}
              onClick={() => set({ icon })}
              className={cn('flex size-12 items-center justify-center rounded-full bg-blush text-2xl transition', options.icon === icon && 'bg-petal ring-4 ring-bubble')}
            >
              {icon === 'dot' ? <span className="size-5 rounded-full bg-raspberry" /> : icon}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-sm text-grape/65">Plain dots teach best; a picture makes it more fun.</p>
      </fieldset>

      <fieldset>
        <legend>
          <Label>Stage</Label>
        </legend>
        <div className="flex flex-col gap-2">
          {([1, 2, 3] as Stage[]).map((s) => (
            <button key={s} type="button" aria-pressed={options.stage === s} className={chip(options.stage === s)} onClick={() => set({ stage: s })}>
              <b>Stage {s}</b> · {STAGES[s].label}
              <span className="block text-sm text-grape/70">{STAGES[s].goal}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <Label>Patterns</Label>
        </legend>
        <div className="flex flex-col gap-2">
          {ARRANGEMENTS.map((a) => {
            const fits = a.min <= to && a.max >= from;
            const on = options.arrangements.includes(a.id);
            return (
              <label key={a.id} className={cn('flex items-start gap-3', !fits && 'opacity-45')}>
                <input
                  type="checkbox"
                  className="mt-1 size-5 accent-bubble"
                  checked={on}
                  disabled={!fits}
                  onChange={() => set({ arrangements: on ? options.arrangements.filter((x) => x !== a.id) : [...options.arrangements, a.id] })}
                />
                <span>
                  <b>{a.name}</b>
                  <span className="block text-sm text-grape/70">{fits ? a.hint : `Not used for ${STAGES[options.stage].label}.`}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <Label>Answers</Label>
        </legend>
        <div className="flex flex-col gap-1.5">
          {(
            [
              ['back', 'On the back (print double-sided)'],
              ['corner', 'Small, in the corner'],
              ['none', 'None'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-3">
              <input type="radio" name="answers" className="size-5 accent-bubble" checked={options.answers === value} onChange={() => set({ answers: value })} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend>
          <Label>Extras</Label>
        </legend>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="size-5 accent-bubble" checked={options.numeralCards} onChange={() => set({ numeralCards: !options.numeralCards })} />
          Numeral cards for matching and snap
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="size-5 accent-bubble" checked={options.guide} onChange={() => set({ guide: !options.guide })} />
          How-to-play page
        </label>
      </fieldset>

      <fieldset>
        <legend>
          <Label>Card size</Label>
        </legend>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(SIZES) as CardSize[]).map((size) => (
            <label key={size} className="flex items-center gap-3">
              <input type="radio" name="size" className="size-5 accent-bubble" checked={options.size === size} onChange={() => set({ size })} />
              {SIZES[size].label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl bg-blush px-4 py-3 text-sm">
        <b>
          {cardCount} card{cardCount === 1 ? '' : 's'} on {pageCount} page{pageCount === 1 ? '' : 's'}
        </b>
        {options.guide ? ' + guide' : ''}. Thick paper or card stock; laminate to keep.
      </div>
      <Button size="lg" onClick={onPrint} disabled={cardCount === 0}>
        🖨 Print
      </Button>
    </Card>
  );
}
