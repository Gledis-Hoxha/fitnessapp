import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { Search, CalendarDays, FileDown, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoodSearchModal from "@/components/nutrition/FoodSearchModal";
import WeeklyStreak from "@/components/nutrition/WeeklyStreak";
import DailyMacros from "@/components/nutrition/DailyMacros";
import MealSection from "@/components/nutrition/MealSection";
import NutritionSummary from "@/components/nutrition/NutritionSummary";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function Nutrition() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [activeMeal, setActiveMeal] = useState(null); // which meal section triggered modal
  const [showSearch, setShowSearch] = useState(false); // top search bar modal

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

  const todayMeals = meals.filter((m) => m.date === today);
  const totalCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein  = todayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const totalCarbs    = todayMeals.reduce((s, m) => s + (m.carbs_g || 0), 0);
  const totalFat      = todayMeals.reduce((s, m) => s + (m.fat_g || 0), 0);

  // Build logged dates for streak (unique days that have entries)
  const loggedDates = [...new Set(meals.map((m) => m.date))];

  const handleAdd = (data) => {
    createMutation.mutate(data);
  };

  const openMealModal = (mealType) => setActiveMeal(mealType);
  const closeModal = () => { setActiveMeal(null); setShowSearch(false); };

  return (
    <div className="space-y-4 pb-4">
      {/* ── Row 1: Title + Search + Calendar ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Nutrition</h1>
          <p className="text-xs text-white/50 mt-0.5">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <Search className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/50 hidden sm:block">Search food…</span>
          </button>
          <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors">
            <CalendarDays className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* ── Row 2: Weekly Streak ── */}
      <WeeklyStreak loggedDates={loggedDates} />

      {/* ── Row 3: Daily Macros ── */}
      <DailyMacros
        calories={totalCalories}
        protein={totalProtein}
        carbs={totalCarbs}
        fat={totalFat}
      />

      {/* ── Rows 4–7: Meal Sections ── */}
      {MEAL_TYPES.map((type) => (
        <MealSection
          key={type}
          mealType={type}
          entries={todayMeals.filter((m) => m.meal_type === type)}
          onAdd={openMealModal}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}

      {/* ── Summary + Charts ── */}
      <NutritionSummary
        calories={totalCalories}
        protein={totalProtein}
        carbs={totalCarbs}
        fat={totalFat}
      />

      {/* ── Bottom Action Buttons ── */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <button className="flex flex-col items-center gap-2 bg-[#111] border border-white/10 rounded-2xl py-4 hover:bg-white/5 transition-colors">
          <BookOpen className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/60 font-medium">Meal Plans</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-[#111] border border-white/10 rounded-2xl py-4 hover:bg-white/5 transition-colors">
          <FileDown className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/60 font-medium">Export PDF</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-[#111] border border-white/10 rounded-2xl py-4 hover:bg-white/5 transition-colors">
          <Settings className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/60 font-medium">Options</span>
        </button>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(activeMeal || showSearch) && (
          <FoodSearchModal
            mealType={activeMeal || "snack"}
            onAdd={handleAdd}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}