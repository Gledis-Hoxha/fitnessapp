import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameMonth, isToday, isSameDay, isBefore, startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight, Dumbbell, Calendar as CalendarIcon, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

function fmtDuration(sec) {
  if (!sec) return "—";
  const m = Math.round(sec / 60);
  return `${m} min`;
}

export default function WorkoutCalendar() {
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { data: workouts = [] } = useQuery({
    queryKey: ["calendarWorkouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 200),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["calendarReminders"],
    queryFn: () => base44.entities.WorkoutReminder.filter({ enabled: true }, "-created_date", 50),
  });

  // Map workouts by date string
  const workoutsByDate = useMemo(() => {
    const map = {};
    workouts.forEach((w) => {
      if (!w.date) return;
      (map[w.date] = map[w.date] || []).push(w);
    });
    return map;
  }, [workouts]);

  // Days grid
  const monthStart = startOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(d); d = addDays(d, 1); }

  const selectedStr = format(selectedDay, "yyyy-MM-dd");
  const dayWorkouts = workoutsByDate[selectedStr] || [];
  // Scheduled reminders for the selected weekday (only for today/future)
  const isFuture = !isBefore(startOfDay(selectedDay), startOfDay(new Date()));
  const dayReminders = isFuture
    ? reminders.filter((r) => (r.days || []).includes(selectedDay.getDay()))
    : [];

  return (
    <div className="space-y-3">
      {/* Calendar card */}
      <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-bold text-white">{format(monthDate, "MMMM yyyy")}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonthDate((m) => addMonths(m, -1))}
              className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => { setMonthDate(new Date()); setSelectedDay(new Date()); }}
              className="text-xs text-blue-400 px-2 hover:underline">Today</button>
            <button onClick={() => setMonthDate((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((w, i) => (
            <span key={i} className="text-[10px] text-white/25 text-center font-medium">{w}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const hasWorkout = !!workoutsByDate[dateStr];
            const inMonth = isSameMonth(day, monthDate);
            const selected = isSameDay(day, selectedDay);
            const today = isToday(day);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className="aspect-square flex items-center justify-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  selected ? "ring-2 ring-blue-400 scale-105" : "hover:bg-white/8"
                } ${
                  hasWorkout ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : today ? "border-2 border-blue-500 text-blue-400"
                  : inMonth ? "text-white/70" : "text-white/20"
                }`}>
                  {format(day, "d")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStr}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-white">{format(selectedDay, "EEEE, MMM d")}</p>

          {dayWorkouts.length === 0 && dayReminders.length === 0 && (
            <p className="text-xs text-white/30 italic py-2">No workouts or sessions on this day.</p>
          )}

          {/* Completed workouts */}
          {dayWorkouts.map((w, idx) => (
            <div key={idx} className="bg-white/4 border border-white/8 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Dumbbell className="w-3.5 h-3.5 text-blue-400" /> Workout
                </span>
                <span className="text-[10px] text-white/40">{fmtDuration(w.duration_seconds)}</span>
              </div>
              <div className="space-y-1">
                {(w.exercises || []).slice(0, 4).map((ex, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{ex.exercise_name}</span>
                    <span className="text-xs text-blue-400">{ex.sets?.filter(s => s.completed).length || 0} sets</span>
                  </div>
                ))}
                {(w.exercises?.length || 0) > 4 && (
                  <p className="text-[10px] text-white/30">+{w.exercises.length - 4} more exercises</p>
                )}
              </div>
            </div>
          ))}

          {/* Scheduled sessions */}
          {dayReminders.map((r, idx) => (
            <div key={`r-${idx}`} className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> {r.label}
              </span>
              <span className="text-xs text-purple-300 font-medium">{r.time}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}