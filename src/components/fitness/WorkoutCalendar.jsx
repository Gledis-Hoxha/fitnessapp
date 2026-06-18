import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfWeek, addDays, addWeeks, isToday, isSameDay, isBefore, startOfDay
} from "date-fns";
import { Dumbbell, CalendarDays, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { app } from "@/api/base44Client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fmtDuration(sec) {
  if (!sec) return "—";
  const m = Math.round(sec / 60);
  return `${m} min`;
}

function CalendarModal({ workoutsByDate, selectedDay, onSelectDate, onClose }) {
  const today = new Date();
  const weeks = [];
  for (let w = -4; w <= 1; w++) {
    const monday = startOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() + w * 7), { weekStartsOn: 1 });
    weeks.push(monday);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl p-5 w-full max-w-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Workout Calendar</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-white/50" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => <p key={d} className="text-xs text-white/25 text-center font-medium">{d[0]}</p>)}
        </div>
        <div className="space-y-1">
          {weeks.map((monday, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {DAYS.map((_, di) => {
                const date = addDays(monday, di);
                const dateStr = format(date, "yyyy-MM-dd");
                const hasWorkout = !!workoutsByDate[dateStr];
                const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
                const isCurrentDay = isToday(date);
                const isSelected = isSameDay(date, selectedDay);
                return (
                  <button
                    key={di}
                    onClick={() => { onSelectDate(date); onClose(); }}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isSelected ? "bg-blue-400 text-black scale-110" :
                      hasWorkout ? "bg-blue-500/80 text-white" :
                      isCurrentDay ? "border border-blue-500/60 text-blue-400" :
                      isPast ? "text-white/15" : "text-white/30 hover:bg-white/10"
                    }`}
                  >
                    {hasWorkout ? "✓" : format(date, "d")}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-white/40">Workout</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-blue-500/60" /><span className="text-xs text-white/40">Today</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WorkoutCalendar() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const { data: workouts = [] } = useQuery({
    queryKey: ["calendarWorkouts"],
    queryFn: () => app.entities.Workout.filter({ status: "completed" }, "-date", 200),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["calendarReminders"],
    queryFn: () => app.entities.WorkoutReminder.filter({ enabled: true }, "-created_date", 50),
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

  const monday = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekCount = DAYS.filter((_, i) => workoutsByDate[format(addDays(monday, i), "yyyy-MM-dd")]).length;

  const selectedStr = format(selectedDay, "yyyy-MM-dd");
  const dayWorkouts = workoutsByDate[selectedStr] || [];
  // Scheduled reminders for the selected weekday (only for today/future)
  const isFuture = !isBefore(startOfDay(selectedDay), startOfDay(new Date()));
  const dayReminders = isFuture
    ? reminders.filter((r) => (r.days || []).includes(selectedDay.getDay()))
    : [];

  return (
    <div className="space-y-3">
      {/* Weekly strip — matches Profile calendar style */}
      <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset((wo) => wo - 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <p className="text-sm font-semibold text-white">
              {format(monday, "MMM d")} – {format(addDays(monday, 6), "MMM d")}
            </p>
            {weekOffset !== 0 &&
            <button onClick={() => setWeekOffset(0)} className="text-xs text-blue-400 px-2 hover:underline">Today</button>
            }
            <button onClick={() => setWeekOffset((wo) => wo + 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={() => setShowCalendar(true)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <CalendarDays className="w-4 h-4 text-blue-400" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((day, i) => {
            const date = addDays(monday, i);
            const dateStr = format(date, "yyyy-MM-dd");
            const hasWorkout = !!workoutsByDate[dateStr];
            const isCurrentDay = isToday(date);
            const isSelected = isSameDay(date, selectedDay);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? new Date() : date)}
                className="flex flex-col items-center gap-1 group"
              >
                <span className="text-xs text-white/30">{day.slice(0, 2)}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected ? "ring-2 ring-white/50 scale-110" :
                  hasWorkout ? "bg-blue-500 text-white shadow-md shadow-blue-500/30" :
                  isCurrentDay ? "border-2 border-blue-500 text-blue-400" :
                  "bg-white/5 text-white/40 hover:bg-white/10"
                }`}>
                  {hasWorkout ? "✓" : format(date, "d")}
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
                <span className="text-xs text-white/40">{fmtDuration(w.duration_seconds)}</span>
              </div>
              <div className="space-y-1">
                {(w.exercises || []).slice(0, 4).map((ex, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{ex.exercise_name}</span>
                    <span className="text-xs text-blue-400">{ex.sets?.filter(s => s.completed).length || 0} sets</span>
                  </div>
                ))}
                {(w.exercises?.length || 0) > 4 && (
                  <p className="text-xs text-white/30">+{w.exercises.length - 4} more exercises</p>
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

      <AnimatePresence>
        {showCalendar && (
          <CalendarModal
            workoutsByDate={workoutsByDate}
            selectedDay={selectedDay}
            onSelectDate={setSelectedDay}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}