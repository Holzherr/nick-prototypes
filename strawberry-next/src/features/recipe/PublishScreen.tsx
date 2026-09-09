import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, X, ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/shared/supabase/client";
import { cuisines, diets } from "@/shared/data/recipes";
import { cleanIngredients, cleanSteps } from "./model";

interface IngredientRow {
  name: string;
  quantity: string;
}

export default function Publish() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ name: "", quantity: "" }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // AI prompt state
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [generating, setGenerating] = useState(false);

  const toggleDiet = (d: string) =>
    setDietTags((prev) => (prev.includes(d) ? prev.filter((t) => t !== d) : [...prev, d]));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => setIngredients((prev) => [...prev, { name: "", quantity: "" }]);
  const removeIngredient = (i: number) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof IngredientRow, value: string) =>
    setIngredients((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const updateStep = (i: number, value: string) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: { description: promptText.trim() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Fill all fields
      setTitle(data.title || "");
      setDescription(data.description || "");
      setServings(data.servings ? String(data.servings) : "");
      setCookTime(data.cookTime || "");
      setCuisine(data.cuisine || "");
      setDietTags(data.dietTags || []);
      setIngredients(
        data.ingredients?.length
          ? data.ingredients.map((i: any) => ({ name: i.name, quantity: i.quantity }))
          : [{ name: "", quantity: "" }]
      );
      setSteps(data.steps?.length ? data.steps : [""]);

      setShowPrompt(false);
      setPromptText("");
      toast.success("Recipe generated! Review and edit before publishing.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate recipe");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (draft: boolean) => {
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("recipes")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          servings: servings ? parseInt(servings) : null,
          cook_time: cookTime.trim() || null,
          cuisine: cuisine || null,
          diet_tags: dietTags.length > 0 ? dietTags : null,
          ingredients: cleanIngredients(ingredients),
          steps: cleanSteps(steps),
          photo_url: photoPreview || null,
          is_draft: draft,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (draft) {
        toast("Draft saved");
      } else {
        toast.success("Recipe published!");
        navigate(`/recipe/${data.id}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save recipe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Publish a Recipe</h1>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-secondary/50 hover:bg-secondary transition-colors active:scale-[0.97]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Fill
        </button>
      </div>

      {/* AI Prompt */}
      {showPrompt && (
        <div className="mb-6 p-4 rounded-lg border bg-secondary/30 space-y-3">
          <p className="text-sm text-muted-foreground">
            Describe a dish and AI will fill out the recipe for you.
          </p>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={2}
            placeholder="e.g. A creamy mushroom risotto with parmesan and truffle oil"
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            disabled={generating}
          />
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating || !promptText.trim()}
              className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </>
              )}
            </button>
            <button
              onClick={() => { setShowPrompt(false); setPromptText(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>
          {photoPreview ? (
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-muted mb-2">
              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <label className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-background transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center justify-center aspect-[3/2] rounded-lg border-2 border-dashed cursor-pointer hover:bg-secondary/50 transition-colors">
              <span className="text-sm text-muted-foreground">Click to upload a photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="e.g. Miso Glazed Aubergine"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="A short description of your dish"
          />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Servings</label>
            <input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. 4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Cook time</label>
            <input
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. 30 min"
            />
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-medium mb-2">Cuisine</label>
          <div className="flex flex-wrap gap-1.5">
            {cuisines.filter((c) => c !== "All").map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(c === cuisine ? "" : c)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors active:scale-[0.97] ${
                  cuisine === c ? "bg-foreground text-background border-foreground" : "hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Diet tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Diet tags</label>
          <div className="flex flex-wrap gap-1.5">
            {diets.filter((d) => d !== "All").map((d) => (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors active:scale-[0.97] ${
                  dietTags.includes(d) ? "bg-foreground text-background border-foreground" : "hover:bg-secondary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium mb-2">Ingredients</label>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  placeholder="Ingredient"
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                  placeholder="Qty"
                  className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="p-1 text-muted-foreground hover:text-foreground">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addIngredient} className="inline-flex items-center gap-1 text-xs mt-2 text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add ingredient
          </button>
        </div>

        {/* Steps */}
        <div>
          <label className="block text-sm font-medium mb-2">Method</label>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium text-muted-foreground mt-1.5">
                  {i + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  rows={2}
                  placeholder={`Step ${i + 1}`}
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {steps.length > 1 && (
                  <button onClick={() => removeStep(i)} className="p-1 text-muted-foreground hover:text-foreground mt-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addStep} className="inline-flex items-center gap-1 text-xs mt-2 text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add step
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="bg-foreground text-background text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
          >
            {submitting ? "Publishing…" : "Publish"}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="border text-sm font-medium px-6 py-2.5 rounded-full hover:bg-secondary transition-colors active:scale-[0.97] disabled:opacity-50"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
