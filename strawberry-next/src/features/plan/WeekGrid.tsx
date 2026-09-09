import { format, isToday } from 'date-fns';
import { MealCell } from './MealCell';
import { MEAL_TYPES, type DayTotals, type MealCellHandlers, type MealPlanItem } from './types';

interface WeekGridProps extends MealCellHandlers {
  weekDays: Date[];
  itemsFor: (date: string, mealType: string) => MealPlanItem[];
  totalsFor: (date: string) => DayTotals;
}

/**
 * The week as a table: seven day columns across, four meal rows down. Each header shows the
 * weekday, the date and that day's calorie total; today's column is tinted. Scrolls horizontally
 * below 700px rather than squeezing the columns.
 */
export function WeekGrid({ weekDays, itemsFor, totalsFor, ...handlers }: WeekGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm min-w-[700px] table-fixed">
        <thead>
          <tr>
            <th className="w-16 p-2 text-left text-muted-foreground font-normal text-xs"></th>
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const totals = totalsFor(dateStr);
              return (
                <th
                  key={dateStr}
                  className={`p-2 text-center font-normal border-l ${isToday(day) ? 'bg-accent' : ''}`}
                >
                  <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                  <div className={`text-lg ${isToday(day) ? 'font-semibold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  {totals.calories > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-1">{totals.calories} cal</div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {MEAL_TYPES.map(mt => (
            <tr key={mt} className="border-t">
              <td className="p-2 text-xs text-muted-foreground capitalize align-top font-medium">{mt}</td>
              {weekDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return (
                  <td
                    key={dateStr}
                    className={`p-1 border-l align-top ${isToday(day) ? 'bg-accent/30' : ''}`}
                  >
                    <MealCell date={dateStr} mealType={mt} items={itemsFor(dateStr, mt)} {...handlers} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
