import { startOfWeek, addDays, format, isToday, isAfter, startOfDay } from "date-fns";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { getStepsForDate, DAILY_STEP_GOAL } from "@/components/fitness/stepData";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StepCalendarModal({ selectedDate, todaySteps, onSelectDate, onClose }) {
  const today = new Date();
  const weeks = [];
  for (let w = -4; w <= 0; w++) {
    const monday = startOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() + w * 7), { weekStartsOn: 1 });
    weeks.push(monday);
  }

  const stepsFor = (date) =>
    isToday(date) ? todaySteps : getStepsForDate(date);

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
          <p className="text-sm font-bold text-white">Step History</p>
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
                const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
                const isCurrentDay = isToday(date);
                const isSelected = selectedDate === dateStr;
                const goalHit = !isFuture && stepsFor(date) >= DAILY_STEP_GOAL;
                return (
                  <button
                    key={di}
                    disabled={isFuture}
                    onClick={() => { onSelectDate(dateStr); onClose(); }}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isSelected ? "bg-green-400 text-black scale-110" :
                      goalHit ? "bg-green-500/80 text-white" :
                      isCurrentDay ? "border border-green-500/60 text-green-400" :
                      isFuture ? "text-white/10" : "text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {format(date, "d")}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-white/40">Goal hit</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-green-500/60" /><span className="text-xs text-white/40">Today</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}