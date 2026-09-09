import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayTotals } from './types';

export interface MacroChartDatum extends DayTotals {
  day: string;
}

/**
 * Weekly macro bars, one group per weekday. Greyscale by design: the four series are the same ink
 * at 100%, 70%, 45% and 25% opacity, so the chart reads in a black-and-white app and stays legible
 * without colour. The legend names the series; the tooltip picks up the popover tokens.
 */
export function MacroChart({ data }: { data: MacroChartDatum[] }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-4">Weekly Macro Summary</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12,
            }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="calories" name="Calories" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} />
          <Bar dataKey="protein" name="Protein (g)" fill="hsl(var(--foreground) / 0.7)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="carbs" name="Carbs (g)" fill="hsl(var(--foreground) / 0.45)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="fat" name="Fat (g)" fill="hsl(var(--foreground) / 0.25)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
