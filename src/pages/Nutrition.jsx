import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import MealSection from "@/components/nutrition/MealSection";
import MacroProgressChart from "@/components/nutrition/MacroProgressChart";
import HydrationTracker from "@/components/nutrition/HydrationTracker";
import FoodSearchModal from "@/components/nutrition/FoodSearchModal";

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [addingMealType, setAddingMealType] = useState(null);
  const queryClient = useQueryClient();

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const dayMeals = meals.filter((m) => m.date === selectedDate);

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const handleAddFood = (mealType) => {
    setAddingMealType(mealType);
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

  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Nutrition</h1>
          <p className="text-sm text-white/40 mt-0.5">Track your meals</p>
        </div>
        <button
          onClick={() => handleAddFood("snack")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white/50" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {isToday ? "Today" : format(new Date(selectedDate), "EEEE")}
          </p>
          <p className="text-xs text-white/40">{format(new Date(selectedDate), "MMMM d, yyyy")}</p>
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-white/50" />
        </button>
      </div>

      {/* Macro Progress */}
      <MacroProgressChart meals={dayMeals} />

      {/* Hydration */}
      <HydrationTracker date={selectedDate} />

      {/* Meal Sections */}
      {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
        <MealSection
          key={mealType}
          mealType={mealType}
          meals={dayMeals.filter((m) => m.meal_type === mealType)}
          onAddFood={() => handleAddFood(mealType)}
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