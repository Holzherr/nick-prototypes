import type { Meta, StoryObj } from '@storybook/react-vite';
import { addDays, eachDayOfInterval, format, startOfWeek } from 'date-fns';
import { DayColumn } from './DayColumn';
import { MacroChart } from './MacroChart';
import { MacroSummary } from './MacroSummary';
import { MealCell } from './MealCell';
import { WeekGrid } from './WeekGrid';
import type { MealPlanItem } from './types';

const monday = startOfWeek(new Date('2026-03-02'), { weekStartsOn: 1 });
const weekDays = eachDayOfInterval({ start: monday, end: addDays(monday, 6) });
const day = (n: number) => format(addDays(monday, n), 'yyyy-MM-dd');

const items: MealPlanItem[] = [
  { id: 'm1', household_id: 'h', recipe_id: 'r1', title: 'Shakshuka', date: day(0), meal_type: 'breakfast', calories: 415, protein: 21, carbs: 24, fat: 26 },
  { id: 'm2', household_id: 'h', recipe_id: null, title: 'Leftover soup', date: day(0), meal_type: 'lunch', calories: 320, protein: 12, carbs: 30, fat: 14 },
  { id: 'm3', household_id: 'h', recipe_id: 'r2', title: 'Miso glazed aubergine', date: day(0), meal_type: 'dinner', calories: 280, protein: 6, carbs: 31, fat: 14 },
  { id: 'm4', household_id: 'h', recipe_id: null, title: 'Porridge', date: day(1), meal_type: 'breakfast', calories: 260, protein: 9, carbs: 44, fat: 5 },
  { id: 'm5', household_id: 'h', recipe_id: 'r3', title: 'Cookies', date: day(3), meal_type: 'snack', calories: 210, protein: 3, carbs: 26, fat: 11 },
];

const itemsFor = (date: string, mealType: string) =>
  items.filter(i => i.date === date && i.meal_type === mealType);

const totalsFor = (date: string) =>
  items
    .filter(i => i.date === date)
    .reduce(
      (acc, i) => ({
        calories: acc.calories + (i.calories ?? 0),
        protein: acc.protein + (i.protein ?? 0),
        carbs: acc.carbs + (i.carbs ?? 0),
        fat: acc.fat + (i.fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

const handlers = { onAdd: () => {}, onDelete: () => {}, onDragStart: () => {}, onDrop: () => {} };

const meta = {
  title: 'Plan/MealPlan',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The meal plan, brick by brick. `MealCell` is one slot; `WeekGrid` lays seven of those across four meal rows; `DayColumn` stacks the same cells under the macro tiles for a single day; `MacroSummary` is the four-tile totals row; `MacroChart` is the weekly bars. Every one takes data and callbacks — the screen owns the fetching.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cell: Story = {
  render: () => (
    <div className="w-[200px] border p-2">
      <MealCell date={day(0)} mealType="dinner" items={itemsFor(day(0), 'dinner')} {...handlers} />
    </div>
  ),
};

export const EmptyCell: Story = {
  render: () => (
    <div className="w-[200px] border p-2">
      <MealCell date={day(5)} mealType="lunch" items={[]} {...handlers} />
    </div>
  ),
};

export const Week: Story = {
  render: () => (
    <div className="p-6">
      <WeekGrid weekDays={weekDays} itemsFor={itemsFor} totalsFor={totalsFor} {...handlers} />
    </div>
  ),
};

export const Day: Story = {
  render: () => (
    <div className="p-6">
      <DayColumn date={day(0)} totals={totalsFor(day(0))} itemsFor={itemsFor} {...handlers} />
    </div>
  ),
};

export const Totals: Story = {
  render: () => (
    <div className="w-[520px] p-6">
      <MacroSummary {...totalsFor(day(0))} />
    </div>
  ),
};

export const Chart: Story = {
  render: () => (
    <div className="w-[720px] p-6">
      <MacroChart
        data={weekDays.map(d => ({
          day: format(d, 'EEE'),
          ...totalsFor(format(d, 'yyyy-MM-dd')),
        }))}
      />
    </div>
  ),
};
