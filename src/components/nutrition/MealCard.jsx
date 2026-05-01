import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

const mealIcons = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

const mealColors = {
  breakfast: "bg-amber-100 text-amber-700",
  lunch: "bg-blue-100 text-blue-700",
  dinner: "bg-indigo-100 text-indigo-700",
  snack: "bg-green-100 text-green-700",
};

export default function MealCard({ meal, onDelete }) {
  const macros = [
    meal.protein_g > 0 && `${meal.protein_g}g protein`,
    meal.carbs_g > 0 && `${meal.carbs_g}g carbs`,
    meal.fat_g > 0 && `${meal.fat_g}g fat`,
  ].filter(Boolean);

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow group">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">{mealIcons[meal.meal_type] || "🍽️"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm">{meal.food_name}</h4>
            <Badge className={`text-xs ${mealColors[meal.meal_type] || ""}`}>
              {meal.meal_type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {meal.date ? format(new Date(meal.date), "MMM d, yyyy") : ""}
            {meal.serving_size && ` · ${meal.serving_size}`}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            {meal.calories > 0 && <span className="font-medium text-foreground">{meal.calories} cal</span>}
            {macros.map((m, i) => <span key={i}>{m}</span>)}
          </div>
          {meal.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{meal.notes}"</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(meal.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}