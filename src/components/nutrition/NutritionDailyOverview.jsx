import { useState } from "react";
import { format, addDays, isToday, isAfter, startOfDay, startOfWeek, addWeeks, isSameDay, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight, Apple, Scale, CalendarDays, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NutritionRadarChart from "@/components/profile/NutritionRadarChart";

export default function NutritionDailyOverview({ meals = [], user }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const viewingToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  // Build set of dates with meals for calendar highlighting
  const mealDates = new Set(meals.map((m) => m.date));

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
    } catch {return 0;}
  })();

  const radarActual = {
    calories: dayCal,
    protein: dayProtein,
    carbs: dayCarbs,
    fats: dayFats,
    hydration: dayHydration
  };

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const mealsByType = mealTypes.map((t) => ({
    type: t,
    items: dayMeals.filter((m) => m.meal_type === t)
  }));

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">
          {viewingToday ? "Today" : format(new Date(selectedDate), "EEEE, MMM d")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCalendar(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white">
            <CalendarDays className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeDate(1)}
            disabled={viewingToday}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5">
            
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Radar chart with selected day data */}
      <NutritionRadarChart actual={radarActual} user={user} label={viewingToday ? "Today" : format(new Date(selectedDate), "MMM d")} />

      {/* Daily macro breakdown */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
        { label: "Calories", val: dayCal, unit: "kcal", color: "text-yellow-400", bg: "bg-yellow-500/10" },
        { label: "Protein", val: dayProtein, unit: "g", color: "text-red-400", bg: "bg-red-500/10" },
        { label: "Carbs", val: dayCarbs, unit: "g", color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Fats", val: dayFats, unit: "g", color: "text-purple-400", bg: "bg-purple-500/10" }].
        map(({ label, val, unit, color, bg }) =>
        <div key={label} className={`rounded-xl p-2.5 text-center hidden ${bg}`}>
            <p className={`text-sm font-bold ${color}`}>{val || "—"}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{label}</p>
          </div>
        )}
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
            className="space-y-0">
            
            {mealsByType.map(({ type, items }) =>
            items.length > 0 &&
            <div key={type} className="border-b border-white/5 last:border-0 py-2">
                  <p className="text-[11px] text-white/40 capitalize mb-1">{type}</p>
                  {items.map((m) =>
              <div key={m.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-white/80">{m.food_name}</span>
                      <span className="text-xs text-white/40">
                        {m.calories || 0} kcal · P{m.protein_g || 0} · C{m.carbs_g || 0} · F{m.fat_g || 0}
                      </span>
                    </div>
              )}
                </div>

            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-3xl p-5 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => setCalendarMonth((d) => addDays(d, -30))} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-sm font-bold text-white">{format(calendarMonth, "MMMM yyyy")}</p>
                  <button onClick={() => setCalendarMonth((d) => addDays(d, 30))} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => setShowCalendar(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-white/50" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d) => <p key={d} className="text-[10px] text-white/25 text-center font-medium">{d}</p>)}
              </div>
              <div className="space-y-1">
                {(() => {
                  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                  const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
                  const startDay = (monthStart.getDay() + 6) % 7;
                  const weeks = [];
                  let day = 1 - startDay;
                  for (let w = 0; w < 6; w++) {
                    const weekDays = [];
                    let lastDate = null;
                    for (let d = 0; d < 7; d++) {
                      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                      weekDays.push(date);
                      lastDate = date;
                      day++;
                    }
                    weeks.push(weekDays);
                    if (lastDate > monthEnd && w >= 3) break;
                  }
                  return weeks.slice(0, 5).map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                      {week.map((date, di) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        const isInMonth = date.getMonth() === calendarMonth.getMonth();
                        const hasMeals = mealDates.has(dateStr);
                        const isSelected = isSameDay(date, new Date(selectedDate));
                        const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
                        const isCurrentDay = isToday(date);
                        const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
                        if (!isInMonth) return <div key={di} />;
                        return (
                          <button
                            key={di}
                            onClick={() => { if (!isFuture) { setSelectedDate(dateStr); setShowCalendar(false); } }}
                            disabled={isFuture}
                            className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                              isSelected ? "bg-green-400 text-black scale-110" :
                              hasMeals ? "bg-green-500/80 text-white" :
                              isCurrentDay ? "border border-green-500/60 text-green-400" :
                              isPast ? "text-white/15" : "text-white/20"
                            }`}
                          >
                            {hasMeals ? "✓" : format(date, "d")}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/8">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-[10px] text-white/40">Meals logged</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-green-500/60" /><span className="text-[10px] text-white/40">Today</span></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

}