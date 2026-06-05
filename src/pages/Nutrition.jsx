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
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200)
  });

  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  // Aggregate macros for the day
  const todayCalories = dayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProtein = dayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const todayCarbs = dayMeals.reduce((s, m) => s + (m.carbs_g || 0), 0);
  const todayFat = dayMeals.reduce((s, m) => s + (m.fat_g || 0), 0);

  // Dates that have logged meals (for WeeklyStreak)
  const loggedDates = [...new Set(meals.map((m) => m.date))];

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
      meal_type: addingMealType
    });
    queryClient.invalidateQueries({ queryKey: ["nutrition"] });
    setShowFoodSearch(false);
    setAddingMealType(null);
  };

  const handleDeleteMeal = async (id) => {
    await base44.entities.NutritionEntry.delete(id);
    queryClient.invalidateQueries({ queryKey: ["nutrition"] });
  };

  const handleMealRecommenderAdd = async (foodData) => {
    await base44.entities.NutritionEntry.create({
      ...foodData,
      date: selectedDate
    });
    queryClient.invalidateQueries({ queryKey: ["nutrition"] });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white hidden">Nutrition</h1>
          <p className="text-sm text-white/40 mt-0.5 hidden">Track your daily meals</p>
        </div>
        <button
          onClick={() => handleAddFood(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-sm hover:bg-green-500/30 transition-colors mx-3">
          
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>

      {/* Weekly Streak */}
      <WeeklyStreak
        loggedDates={loggedDates}
        selectedDate={selectedDate}
        onSelectDate={(date) => date && setSelectedDate(date)} />
      

      {/* Date Navigator */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white/50" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-white">
            {isToday ? "Today" : format(new Date(selectedDate), "EEEE")}
          </p>
          <p className="text-sm text-white/40">{format(new Date(selectedDate), "MMMM d, yyyy")}</p>
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30">
          
          <ChevronRight className="w-5 h-5 text-white/50" />
        </button>
      </div>

      {/* Macro Progress */}
      <MacroProgressChart
        calories={todayCalories}
        protein={todayProtein}
        carbs={todayCarbs}
        fat={todayFat} />
      

      {/* Hydration */}
      <HydrationTracker date={selectedDate} />

      {/* Nutrition Summary */}
      <NutritionSummary
        calories={todayCalories}
        protein={todayProtein}
        carbs={todayCarbs}
        fat={todayFat} />
      

      {/* Meal Recommender */}
      <MealRecommender
        todayCalories={todayCalories}
        todayProtein={todayProtein}
        onAddMeal={handleMealRecommenderAdd}
        viewDate={selectedDate} />
      

      {/* Meal Sections */}
      {["breakfast", "lunch", "dinner", "snack"].map((mealType) =>
      <MealSection
        key={mealType}
        mealType={mealType}
        entries={dayMeals.filter((m) => m.meal_type === mealType)}
        onAdd={handleAddFood}
        onDelete={handleDeleteMeal} />

      )}

      <AnimatePresence>
        {showFoodSearch &&
        <FoodSearchModal
          onClose={() => {setShowFoodSearch(false);setAddingMealType(null);}}
          onAdd={handleFoodAdded}
          mealType={addingMealType} />

        }
      </AnimatePresence>
    </div>);

}