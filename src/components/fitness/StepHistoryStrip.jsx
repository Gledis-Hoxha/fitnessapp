import { format, subDays } from "date-fns";

const DAILY_STEP_GOAL = 10000;

// Sample step data for prior days (visual placeholder to preview the layout)
const SAMPLE_PRIOR_STEPS = [8240, 11030, 6580, 9870, 12450, 7320];

export default function StepHistoryStrip({ todaySteps = 0 }) {
  // Build last 7 days: 6 prior sample days + today (live)
  const days = SAMPLE_PRIOR_STEPS.map((steps, i) => ({
    date: subDays(new Date(), 6 - i),
    steps,
  }));
  days.push({ date: new Date(), steps: todaySteps, isToday: true });

  const maxSteps = Math.max(DAILY_STEP_GOAL, ...days.map((d) => d.steps));

  return (
    <div className="pt-3 border-t border-white/8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Last 7 Days</p>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-20">
        {days.map((d, i) => {
          const pct = Math.max(6, Math.round((d.steps / maxSteps) * 100));
          const goalHit = d.steps >= DAILY_STEP_GOAL;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
              <span className="text-[8px] font-semibold text-white/40 tabular-nums">
                {d.steps >= 1000 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${
                    d.isToday ? "bg-green-400" : goalHit ? "bg-green-500/80" : "bg-white/15"
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className={`text-[9px] font-medium ${d.isToday ? "text-green-400" : "text-white/30"}`}>
                {format(d.date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}