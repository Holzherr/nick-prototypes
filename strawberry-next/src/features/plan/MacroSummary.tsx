import type { DayTotals } from './types';

/** Four grey tiles: calories, protein, carbs, fat for one day. */
export function MacroSummary({ calories, protein, carbs, fat }: DayTotals) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center p-3 rounded-lg bg-secondary">
        <div className="text-xl font-bold">{calories}</div>
        <div className="text-[11px] text-muted-foreground">Calories</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-secondary">
        <div className="text-xl font-bold">{protein.toFixed(0)}g</div>
        <div className="text-[11px] text-muted-foreground">Protein</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-secondary">
        <div className="text-xl font-bold">{carbs.toFixed(0)}g</div>
        <div className="text-[11px] text-muted-foreground">Carbs</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-secondary">
        <div className="text-xl font-bold">{fat.toFixed(0)}g</div>
        <div className="text-[11px] text-muted-foreground">Fat</div>
      </div>
    </div>
  );
}
