import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Apple } from "lucide-react";
import MealSection from "@/components/nutrition/MealSection";
import MacroProgressChart from "@/components/nutrition/MacroProgressChart";
import HydrationTracker from "@/components/nutrition/HydrationTracker";
import FoodSearchModal from "@/components/nutrition/FoodSearchModal";
import NutritionSummary from "@/components/nutrition/NutritionSummary";
import WeeklyStreak from "@/components/nutrition/WeeklyStreak";
import MealRecommender from "@/components/nutrition/MealRecommender";

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [addingMealType, setAddingMealType] = useState(null);
  const queryClient = useQueryClient();

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const handleAddFood = (mealType) => {
    setAddingMealType(mealType || "snack");
    setShowFoodSearch(true);
  };

  const handleFoodAdded = async (foodData) => {
    await base44.entities.NutritionEntry.create({
      ...foodData,
      date: selectedDate,
      meal_type: addingMealType,
    });
    queryClient.invalidateQueries({ queryKey: ["nutrition"] });
    setShowFoodSearch(false);
    setAddingMealType(null);
  };

  const handleDeleteMeal = async (id) => {
    await base44.entities.NutritionEntry.delete(id);
    queryClient.invalidateQueries({ queryKey: ["nutrition"] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nutrition</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your daily meals</p>
        </div>
        <button
          onClick={() => handleAddFood(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>

      {/* Weekly Streak */}
      <WeeklyStreak meals={meals} />

      {/* Date Navigator */}
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {isToday ? "Today" : format(new Date(selectedDate), "EEEE")}
          </p>
          <p className="text-sm text-muted-foreground">{format(new Date(selectedDate), "MMMM d, yyyy")}</p>
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Macro Progress */}
      <MacroProgressChart meals={dayMeals} />

      {/* Hydration */}
      <HydrationTracker date={selectedDate} />

      {/* Nutrition Summary */}
      <NutritionSummary meals={dayMeals} />

      {/* Meal Recommender */}
      <MealRecommender meals={dayMeals} />

      {/* Meal Sections */}
      {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
        <MealSection
          key={mealType}
          mealType={mealType}
          entries={dayMeals.filter((m) => m.meal_type === mealType)}
          onAdd={handleAddFood}
          onDelete={handleDeleteMeal}
        />
      ))}

      <AnimatePresence>
        {showFoodSearch && (
          <FoodSearchModal
            onClose={() => { setShowFoodSearch(false); setAddingMealType(null); }}
            onAdd={handleFoodAdded}
            mealType={addingMealType}
          />
        )}
      </AnimatePresence>
    </div>
  );
}