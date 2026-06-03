import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, subDays, isToday } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, FileDown } from "lucide-react";
import FoodSearchModal from "@/components/nutrition/FoodSearchModal";
import MealPlanModal from "@/components/nutrition/MealPlanModal";
import WeeklyStreak from "@/components/nutrition/WeeklyStreak";
import DailyMacros from "@/components/nutrition/DailyMacros";
import MealSection from "@/components/nutrition/MealSection";
import NutritionSummary from "@/components/nutrition/NutritionSummary";
import MealRecommender from "@/components/nutrition/MealRecommender";
import MacroProgressChart from "@/components/nutrition/MacroProgressChart";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function Nutrition() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeMeal, setActiveMeal] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMealPlans, setShowMealPlans] = useState(false);
  const [streakSelectedDate, setStreakSelectedDate] = useState(null);
  const { showNutritionSearch, setShowNutritionSearch } = useOutletContext() || {};

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NutritionEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-home"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutritionEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-home"] });
    },
  });

  // When streak day is clicked, switch to that date
  const handleStreakSelect = (dateStr) => {
    setStreakSelectedDate(dateStr);
    if (dateStr) setSelectedDate(dateStr);
  };

  const viewDate = streakSelectedDate || selectedDate;
  const viewMeals = meals.filter((m) => m.date === viewDate);
  const totalCalories = viewMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein  = viewMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const totalCarbs    = viewMeals.reduce((s, m) => s + (m.carbs_g || 0), 0);
  const totalFat      = viewMeals.reduce((s, m) => s + (m.fat_g || 0), 0);

  const loggedDates = [...new Set(meals.map((m) => m.date))];

  const handleAdd = (data) => {
    createMutation.mutate({ ...data, date: viewDate });
  };

  const openMealModal = (mealType) => setActiveMeal(mealType);
  const closeModal = () => { setActiveMeal(null); setShowSearch(false); setShowNutritionSearch?.(false); };

  const goToPrevDay = () => {
    const prev = format(subDays(new Date(viewDate + "T00:00:00"), 1), "yyyy-MM-dd");
    setSelectedDate(prev);
    setStreakSelectedDate(null);
  };

  const goToNextDay = () => {
    const next = format(addDays(new Date(viewDate + "T00:00:00"), 1), "yyyy-MM-dd");
    setSelectedDate(next);
    setStreakSelectedDate(null);
  };

  const goToToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setStreakSelectedDate(null);
  };

  const displayedDateLabel = isToday(new Date(viewDate + "T00:00:00"))
    ? "Today"
    : format(new Date(viewDate + "T00:00:00"), "EEE, MMM d");

  // Sync header search trigger with local state
  const isSearchOpen = showNutritionSearch || showSearch;
  const handleSearchClose = () => {
    setShowSearch(false);
    setShowNutritionSearch?.(false);
  };

  return (
    <div className="space-y-3 pb-4">

      {/* ── Date Navigator ── */}
      <div className="flex items-center justify-between px-1">
        <button onClick={goToPrevDay} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{displayedDateLabel}</span>
          {!isToday(new Date(viewDate + "T00:00:00")) && (
            <button onClick={goToToday} className="text-[10px] text-green-400 hover:underline">Today</button>
          )}
        </div>
        <button onClick={goToNextDay} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Weekly Streak ── */}
      <WeeklyStreak
        loggedDates={loggedDates}
        selectedDate={streakSelectedDate}
        onSelectDate={handleStreakSelect}
      />

      {/* ── Daily Macros ── */}
      <DailyMacros
        calories={totalCalories}
        protein={totalProtein}
        carbs={totalCarbs}
        fat={totalFat}
      />

      {/* ── Daily Progress Chart ── */}
      <MacroProgressChart
        calories={totalCalories}
        protein={totalProtein}
        carbs={totalCarbs}
        fat={totalFat}
      />

      {/* ── Meal Sections ── */}
      {MEAL_TYPES.map((type) => (
        <MealSection
          key={type}
          mealType={type}
          entries={viewMeals.filter((m) => m.meal_type === type)}
          onAdd={openMealModal}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}

      {/* ── Meal Recommender ── */}
      <MealRecommender
        todayCalories={totalCalories}
        todayProtein={totalProtein}
        viewDate={viewDate}
        onAddMeal={handleAdd}
      />

      {/* ── Summary ── */}
      <NutritionSummary
        calories={totalCalories}
        protein={totalProtein}
        carbs={totalCarbs}
        fat={totalFat}
      />

      {/* ── Bottom Actions ── */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button onClick={() => setShowMealPlans(true)} className="flex flex-col items-center gap-2 bg-[#111] border border-white/8 rounded-2xl py-4 hover:bg-white/5 transition-colors">
          <BookOpen className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/50 font-medium">Meal Plans</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-[#111] border border-white/8 rounded-2xl py-4 hover:bg-white/5 transition-colors">
          <FileDown className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/50 font-medium">Export PDF</span>
        </button>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(activeMeal || isSearchOpen) && (
          <FoodSearchModal
            mealType={activeMeal || "snack"}
            onAdd={handleAdd}
            onClose={handleSearchClose}
          />
        )}
        {showMealPlans && (
          <MealPlanModal onClose={() => setShowMealPlans(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}