import { useState } from "react";
import { format, subDays, addDays, isToday, isAfter, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Apple, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NutritionRadarChart from "@/components/profile/NutritionRadarChart";

export default function NutritionDailyOverview({ meals = [], user }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const viewingToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  const changeDate = (offset) => {
    const next = addDays(new Date(selectedDate), offset);
    if (isAfter(startOfDay(next), startOfDay(new Date()))) return;
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  // Filter meals for selected date
  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const dayCal = dayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const dayProtein = dayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const dayCarbs = dayMeals.reduce((s, m) => s + (m.carbs_g || 0), 0);
  const dayFats = dayMeals.reduce((s, m) => s + (m.fat_g || 0), 0);

  // Hydration for selected date from localStorage
  const dayHydration = (() => {
    try {
      const log = JSON.parse(localStorage.getItem("hydration_log") || "{}");
      return log[selectedDate] || 0;
    } catch { return 0; }
  })();

  const radarActual = {
    calories: dayCal,
    protein: dayProtein,
    carbs: dayCarbs,
    fats: dayFats,
    hydration: dayHydration,
  };

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const mealsByType = mealTypes.map((t) => ({
    type: t,
    items: dayMeals.filter((m) => m.meal_type === t),
  }));

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">
          {viewingToday ? "Today" : format(new Date(selectedDate), "EEEE, MMM d")}
        </span>
        <button
          onClick={() => changeDate(1)}
          disabled={viewingToday}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Radar chart with selected day data */}
      <NutritionRadarChart actual={radarActual} user={user} label={viewingToday ? "Today" : format(new Date(selectedDate), "MMM d")} />

      {/* Daily macro breakdown */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { label: "Calories", val: dayCal, unit: "kcal", color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Protein", val: dayProtein, unit: "g", color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Carbs", val: dayCarbs, unit: "g", color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Fats", val: dayFats, unit: "g", color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ label, val, unit, color, bg }) => (
          <div key={label} className={`rounded-xl p-2.5 text-center ${bg}`}>
            <p className={`text-sm font-bold ${color}`}>{val || "—"}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Meal entries for the day */}
      <div className="mt-4">
        <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2">
          {dayMeals.length ? `${dayMeals.length} meal${dayMeals.length > 1 ? "s" : ""} logged` : "No meals logged"}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-0"
          >
            {mealsByType.map(({ type, items }) =>
              items.length > 0 && (
                <div key={type} className="border-b border-white/5 last:border-0 py-2">
                  <p className="text-[11px] text-white/40 capitalize mb-1">{type}</p>
                  {items.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-white/80">{m.food_name}</span>
                      <span className="text-xs text-white/40">
                        {m.calories || 0} kcal · P{m.protein_g || 0} · C{m.carbs_g || 0} · F{m.fat_g || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}