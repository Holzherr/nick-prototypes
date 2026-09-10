import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import InlineAIPrompt from "@/features/assistant/AIChatDrawer";
import { useApp } from "@/app/AppContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { supabase } from "@/shared/supabase/client";
import { toast } from "sonner";
import { DayColumn } from "./DayColumn";
import { MacroChart, type MacroChartDatum } from "./MacroChart";
import { WeekGrid } from "./WeekGrid";
import type { DayTotals, MealPlanItem, MealType, ViewMode } from "./types";

interface RecipeOption {
  id: string;
  title: string;
  ingredients: { name: string; quantity: string }[];
}

export default function MealPlan() {
  const [items, setItems] = useState<MealPlanItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<{ date: string; mealType: MealType } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [newCalories, setNewCalories] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [newCarbs, setNewCarbs] = useState("");
  const [newFat, setNewFat] = useState("");
  const [dragItem, setDragItem] = useState<MealPlanItem | null>(null);
  const [loading, setLoading] = useState(true);

  const { householdId } = useApp();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchItems = useCallback(async () => {
    if (!householdId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const start = viewMode === "week" ? format(weekStart, "yyyy-MM-dd") : format(currentDate, "yyyy-MM-dd");
    const end = viewMode === "week" ? format(weekEnd, "yyyy-MM-dd") : format(currentDate, "yyyy-MM-dd");

    const { data } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("household_id", householdId)
      .gte("date", start)
      .lte("date", end)
      .order("created_at");

    if (data) setItems(data);
    setLoading(false);
  // weekStart/weekEnd derive from currentDate; listing them here would be a new Date each render
  // and refetch forever.
  }, [currentDate, viewMode, householdId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    supabase.from("recipes").select("id, title, ingredients").eq("is_draft", false).then(({ data }) => {
      if (data) setRecipes(data.map((r: any) => ({
        id: r.id,
        title: r.title,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
      })));
    });
  }, []);

  const estimateMacros = async (title: string, ingredients: { name: string; quantity: string }[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("estimate-macros", {
        body: { title, ingredients },
      });
      if (!error && data) {
        if (data.calories) setNewCalories(String(Math.round(data.calories)));
        if (data.protein) setNewProtein(String(Math.round(data.protein)));
        if (data.carbs) setNewCarbs(String(Math.round(data.carbs)));
        if (data.fat) setNewFat(String(Math.round(data.fat)));
      }
    } catch {
      // silently fail — user can still enter manually
    }
  };

  const openAddDialog = (date: string, mealType: MealType) => {
    setAddTarget({ date, mealType });
    setNewTitle("");
    setSelectedRecipeId(null);
    setNewCalories("");
    setNewProtein("");
    setNewCarbs("");
    setNewFat("");
    setAddDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!addTarget) return;
    const title = selectedRecipeId
      ? recipes.find((r) => r.id === selectedRecipeId)?.title || newTitle
      : newTitle;
    if (!title.trim()) return;

    if (!householdId) return;

    const { error } = await supabase.from("meal_plan_items").insert({
      household_id: householdId,
      recipe_id: selectedRecipeId,
      title: title.trim(),
      date: addTarget.date,
      meal_type: addTarget.mealType,
      calories: parseInt(newCalories) || 0,
      protein: parseFloat(newProtein) || 0,
      carbs: parseFloat(newCarbs) || 0,
      fat: parseFloat(newFat) || 0,
    });

    if (error) {
      toast.error("Failed to add meal");
    } else {
      toast.success("Meal added");
      setAddDialogOpen(false);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("meal_plan_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDragStart = (item: MealPlanItem) => {
    setDragItem(item);
  };

  const handleDrop = async (date: string, mealType: MealType) => {
    if (!dragItem) return;
    if (dragItem.date === date && dragItem.meal_type === mealType) {
      setDragItem(null);
      return;
    }

    const { error } = await supabase
      .from("meal_plan_items")
      .update({ date, meal_type: mealType })
      .eq("id", dragItem.id);

    if (!error) {
      fetchItems();
    }
    setDragItem(null);
  };

  const getItemsFor = (date: string, mealType: string) =>
    items.filter((i) => i.date === date && i.meal_type === mealType);

  const getDayTotals = (date: string): DayTotals => {
    const dayItems = items.filter((i) => i.date === date);
    return {
      calories: dayItems.reduce((s, i) => s + (i.calories || 0), 0),
      protein: dayItems.reduce((s, i) => s + (i.protein || 0), 0),
      carbs: dayItems.reduce((s, i) => s + (i.carbs || 0), 0),
      fat: dayItems.reduce((s, i) => s + (i.fat || 0), 0),
    };
  };

  const navigatePrev = () => {
    setCurrentDate((d) => (viewMode === "week" ? subWeeks(d, 1) : addDays(d, -1)));
  };
  const navigateNext = () => {
    setCurrentDate((d) => (viewMode === "week" ? addWeeks(d, 1) : addDays(d, 1)));
  };
  const goToToday = () => setCurrentDate(new Date());

  const weekChartData: MacroChartDatum[] = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return { day: format(day, "EEE"), ...getDayTotals(dateStr) };
  });

  const cellHandlers = {
    onAdd: openAddDialog,
    onDelete: handleDelete,
    onDragStart: handleDragStart,
    onDrop: handleDrop,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          Meal Plan
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          <InlineAIPrompt context="meal_plan" />
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "day" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "week" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={navigatePrev}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium min-w-[200px] text-center">
          {viewMode === "week"
            ? `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`
            : format(currentDate, "EEEE, MMM d, yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={navigateNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-20 h-16 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "week" ? (
        <div className="space-y-8">
          <WeekGrid
            weekDays={weekDays}
            itemsFor={getItemsFor}
            totalsFor={getDayTotals}
            {...cellHandlers}
          />
          {items.length > 0 && <MacroChart data={weekChartData} />}
        </div>
      ) : (
        <DayColumn
          date={format(currentDate, "yyyy-MM-dd")}
          totals={getDayTotals(format(currentDate, "yyyy-MM-dd"))}
          itemsFor={getItemsFor}
          {...cellHandlers}
        />
      )}

      {/* Add Meal Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Meal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Pick a recipe (optional)</label>
              <Select
                value={selectedRecipeId || "none"}
                onValueChange={(v) => {
                  if (v === "none") {
                    setSelectedRecipeId(null);
                  } else {
                    setSelectedRecipeId(v);
                    const r = recipes.find((rec) => rec.id === v);
                    if (r) {
                      setNewTitle(r.title);
                      // Estimate macros from ingredients
                      if (r.ingredients.length > 0) {
                        estimateMacros(r.title, r.ingredients);
                      }
                    }
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select a recipe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (free text)</SelectItem>
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meal name</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Chicken salad"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Calories</label>
                <Input value={newCalories} onChange={(e) => setNewCalories(e.target.value)} placeholder="0" type="number" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Protein (g)</label>
                <Input value={newProtein} onChange={(e) => setNewProtein(e.target.value)} placeholder="0" type="number" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Carbs (g)</label>
                <Input value={newCarbs} onChange={(e) => setNewCarbs(e.target.value)} placeholder="0" type="number" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Fat (g)</label>
                <Input value={newFat} onChange={(e) => setNewFat(e.target.value)} placeholder="0" type="number" />
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full" disabled={!newTitle.trim()}>
              Add to {addTarget?.mealType}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      
    </div>
  );
}

