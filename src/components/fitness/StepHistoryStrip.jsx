import { format, subDays } from "date-fns";
import { getStepsForDate, DAILY_STEP_GOAL } from "@/components/fitness/stepData";

export default function StepHistoryStrip({ todaySteps = 0, selectedDate, onSelectDate }) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Last 7 days: 6 prior sample days + today (live)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isToday = dateStr === todayStr;
    return {
      date,
      dateStr,
      isToday,
      steps: isToday ? todaySteps : getStepsForDate(date),
    };
  });

  const maxSteps = Math.max(DAILY_STEP_GOAL, ...days.map((d) => d.steps));

  return (
    <div className="pt-3 border-t border-white/8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Last 7 Days</p>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-20">
        {days.map((d) => {
          const pct = Math.max(6, Math.round((d.steps / maxSteps) * 100));
          const goalHit = d.steps >= DAILY_STEP_GOAL;
          const isSelected = selectedDate === d.dateStr;
          return (
            <button
              key={d.dateStr}
              onClick={() => onSelectDate?.(d.dateStr)}
              className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group">
              <span className="text-[8px] font-semibold text-white/40 tabular-nums">
                {d.steps >= 1000 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${
                    isSelected ? "bg-green-400 ring-2 ring-white/40" :
                    d.isToday ? "bg-green-400" :
                    goalHit ? "bg-green-500/80" : "bg-white/15 group-hover:bg-white/25"
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className={`text-[9px] font-medium ${
                isSelected || d.isToday ? "text-green-400" : "text-white/30"
              }`}>
                {format(d.date, "EEEEE")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}