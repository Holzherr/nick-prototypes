import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { ICONS, type Stage } from '../subitising/cards';
import { SHEET_LIST, type SheetMeta, type SheetOptions } from './catalog';

export interface SheetOptionsPanelProps {
  options: SheetOptions;
  meta: SheetMeta;
  pageCount: number;
  onChange: (options: SheetOptions) => void;
  onPrint: () => void;
  className?: string;
}

const Label = ({ children }: { children: string }) => <span className="mb-1.5 block font-semibold">{children}</span>;

const chip = (on: boolean) =>
  cn('rounded-2xl border-2 px-3 py-2 text-left transition-colors', on ? 'border-bubble bg-petal/60' : 'border-petal bg-white hover:border-bubble/60');

/** Controls for every sheet: which sheet, the child's name, a picture, the stage — then Print. */
export function SheetOptionsPanel({ options, meta, pageCount, onChange, onPrint, className }: SheetOptionsPanelProps) {
  const set = (patch: Partial<SheetOptions>) => onChange({ ...options, ...patch });

  return (
    <Card className={cn('flex flex-col gap-5 p-6', className)}>
      <fieldset>
        <legend>
          <Label>Sheet</Label>
        </legend>
        <div className="flex flex-col gap-2">
          {SHEET_LIST.map((sheet) => (
            <button key={sheet.id} type="button" aria-pressed={sheet.id === options.id} className={chip(sheet.id === options.id)} onClick={() => set({ id: sheet.id })}>
              <b>{sheet.title}</b>
              <span className="block text-sm text-grape/70">{sheet.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label>
        <Label>Child’s name (optional)</Label>
        <Input value={options.name} maxLength={24} placeholder="Printed small on the sheet" onChange={(e) => set({ name: e.target.value })} />
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
      </fieldset>

      <fieldset>
        <legend>
          <Label>Stage</Label>
        </legend>
        <div className="flex flex-col gap-2">
          {([1, 2, 3] as Stage[]).map((s) => (
            <button key={s} type="button" aria-pressed={options.stage === s} className={chip(options.stage === s)} onClick={() => set({ stage: s })}>
              <b>Stage {s}</b> · {meta.stages[s].label}
              <span className="block text-sm text-grape/70">{meta.stages[s].goal}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl bg-blush px-4 py-3 text-sm">
        <b>
          {pageCount} page{pageCount === 1 ? '' : 's'}
        </b>{' '}
        including the how-to page. Plain paper is fine; card stock if you are cutting pieces out.
      </div>
      <Button size="lg" onClick={onPrint}>
        🖨 Print
      </Button>
    </Card>
  );
}
