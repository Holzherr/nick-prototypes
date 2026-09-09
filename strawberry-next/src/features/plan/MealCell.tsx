import { GripVertical, Plus, X } from 'lucide-react';
import type { MealCellHandlers, MealPlanItem, MealType } from './types';

interface MealCellProps extends MealCellHandlers {
  date: string;
  mealType: MealType;
  items: MealPlanItem[];
}

/**
 * One slot in the plan: a drop target that lists its meals as draggable grey pills (title, calorie
 * count, and a delete cross that appears on hover) with a add button underneath. Dragging over it
 * outlines it; dropping moves the dragged meal into this date and meal type.
 */
export function MealCell({ date, mealType, items, onAdd, onDelete, onDragStart, onDrop }: MealCellProps) {
  return (
    <div
      className="min-h-[60px] p-1 border border-dashed border-transparent hover:border-border rounded transition-colors"
      onDragOver={e => {
        e.preventDefault();
        e.currentTarget.classList.add('border-primary', 'bg-accent/50');
        e.currentTarget.classList.remove('border-transparent');
      }}
      onDragLeave={e => {
        e.currentTarget.classList.remove('border-primary', 'bg-accent/50');
        e.currentTarget.classList.add('border-transparent');
      }}
      onDrop={e => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-primary', 'bg-accent/50');
        e.currentTarget.classList.add('border-transparent');
        onDrop(date, mealType);
      }}
    >
      {items.map(item => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(item)}
          className="group flex items-center gap-1 bg-secondary rounded px-2 py-1 mb-1 text-xs cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
          <span className="flex-1 truncate">{item.title}</span>
          {(item.calories ?? 0) > 0 && (
            <span className="text-muted-foreground shrink-0">{item.calories}cal</span>
          )}
          <button
            onClick={() => onDelete(item.id)}
            aria-label={`Remove ${item.title}`}
            className="opacity-0 group-hover:opacity-100 shrink-0"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onAdd(date, mealType)}
        aria-label={`Add ${mealType}`}
        className="w-full flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground text-[10px] py-1 rounded hover:bg-accent transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
