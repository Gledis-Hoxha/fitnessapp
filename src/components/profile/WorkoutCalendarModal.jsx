import { format, startOfWeek, addDays, isToday, isSameDay, isBefore, startOfDay } from "date-fns";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WorkoutCalendarModal({ workoutDates, selectedDay, onSelectDate, onClose }) {
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
          {DAYS.map((d) => <p key={d} className="text-[10px] text-white/25 text-center font-medium">{d[0]}</p>)}
        </div>
        <div className="space-y-1">
          {weeks.map((monday, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {DAYS.map((_, di) => {
                const date = addDays(monday, di);
                const dateStr = format(date, "yyyy-MM-dd");
                const hasWorkout = workoutDates.has(dateStr);
                const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
                const isCurrentDay = isToday(date);
                const isSelected = selectedDay && isSameDay(date, selectedDay);
                return (
                  <button
                    key={di}
                    onClick={() => { onSelectDate(date); onClose(); }}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
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
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[10px] text-white/40">Workout</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-blue-500/60" /><span className="text-[10px] text-white/40">Today</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}