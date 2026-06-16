import { format, subDays } from "date-fns";
import { Footprints, Flame, MapPin } from "lucide-react";
import {
  getStepsForDate,
  DAILY_STEP_GOAL,
  STEP_LENGTH_M,
  CALORIES_PER_STEP
} from "@/components/fitness/stepData";

// Reads live "today" steps the tracker has persisted (if any), else falls back
// to deterministic sample data so the summary always shows something.
function getTodaySteps() {
  const v = Number(localStorage.getItem("stepsToday"));
  return Number.isFinite(v) && v > 0 ? v : getStepsForDate(new Date());
}

export default function StepSummaryCard() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaySteps = getTodaySteps();

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isToday = dateStr === todayStr;
    return { date, isToday, steps: isToday ? todaySteps : getStepsForDate(date) };
  });

  const maxSteps = Math.max(DAILY_STEP_GOAL, ...days.map((d) => d.steps));
  const weekTotal = days.reduce((a, d) => a + d.steps, 0);
  const weekAvg = Math.round(weekTotal / 7);
  const calories = Math.round(todaySteps * CALORIES_PER_STEP);
  const distanceKm = (todaySteps * STEP_LENGTH_M / 1000).toFixed(1);
  const progress = Math.min(100, Math.round((todaySteps / DAILY_STEP_GOAL) * 100));

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/15">
            <Footprints className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-sm font-semibold text-white">Steps</p>
        </div>
        <span className="text-xs text-white/35">7-day avg {weekAvg.toLocaleString()}</span>
      </div>

      {/* Today */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-3xl font-black text-white tabular-nums leading-none">{todaySteps.toLocaleString()}</p>
          <p className="text-xs text-white/35 mt-1">steps today · {progress}% of goal</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="flex items-center gap-1 justify-end">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-sm font-bold text-white tabular-nums">{calories}</span>
            </div>
            <p className="text-[10px] text-white/30">kcal</p>
          </div>
          <div>
            <div className="flex items-center gap-1 justify-end">
              <MapPin className="w-3 h-3 text-zinc-400" />
              <span className="text-sm font-bold text-white tabular-nums">{distanceKm}</span>
            </div>
            <p className="text-[10px] text-white/30">km</p>
          </div>
        </div>
      </div>

      {/* 7-day bars */}
      <div className="flex items-end justify-between gap-1.5 h-20">
        {days.map((d, i) => {
          const h = Math.max(6, Math.round((d.steps / maxSteps) * 100));
          const hitGoal = d.steps >= DAILY_STEP_GOAL;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full rounded-md transition-all ${
                  d.isToday ? "bg-green-400" : hitGoal ? "bg-green-500/70" : "bg-white/15"
                }`}
                style={{ height: `${h}%` }} />
              <span className={`text-[10px] ${d.isToday ? "text-green-400 font-semibold" : "text-white/30"}`}>
                {format(d.date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}