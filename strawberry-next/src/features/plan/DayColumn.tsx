import { MacroSummary } from './MacroSummary';
import { MealCell } from './MealCell';
import { MEAL_TYPES, type DayTotals, type MealCellHandlers, type MealPlanItem } from './types';

interface DayColumnProps extends MealCellHandlers {
  date: string;
  totals: DayTotals;
  itemsFor: (date: string, mealType: string) => MealPlanItem[];
}

/** One day, stacked: the macro tiles, then a bordered card per meal holding that meal's cell. */
export function DayColumn({ date, totals, itemsFor, ...handlers }: DayColumnProps) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <MacroSummary {...totals} />
      {MEAL_TYPES.map(mt => (
        <div key={mt} className="border rounded-lg overflow-hidden">
          <div className="bg-secondary px-3 py-2 text-sm font-medium capitalize">{mt}</div>
          <div className="p-2">
            <MealCell date={date} mealType={mt} items={itemsFor(date, mt)} {...handlers} />
          </div>
        </div>
      ))}
    </div>
  );
}
