import { useState, useRef, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Footprints, Flame, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStepsForDate,
  getMinutesForDate,
  getCaloriesForDate,
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

function ProgressRing({ progress }) {
  const size = 84;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, progress) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#stepRing)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }} />
        <defs>
          <linearGradient id="stepRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Footprints className="w-4 h-4 text-green-400" />
        <span className="text-xs font-bold text-white tabular-nums mt-0.5">{progress}%</span>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, value, unit, color }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 rounded-xl bg-white/[0.04] border border-white/8 py-2.5">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-sm font-bold text-white tabular-nums leading-none">{value}</span>
      <span className="text-[10px] text-white/30">{unit}</span>
    </div>
  );
}

export default function StepSummaryCard() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaySteps = getTodaySteps();

  const HISTORY_DAYS = 30;
  const days = Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const date = subDays(new Date(), HISTORY_DAYS - 1 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isToday = dateStr === todayStr;
    const steps = isToday ? todaySteps : getStepsForDate(date);
    return {
      date,
      isToday,
      steps,
      calories: isToday ? Math.round(steps * CALORIES_PER_STEP) : getCaloriesForDate(date),
      minutes: isToday ? Math.round(steps / 100) : getMinutesForDate(date),
      distanceKm: (steps * STEP_LENGTH_M / 1000).toFixed(1)
    };
  });

  const [selected, setSelected] = useState(HISTORY_DAYS - 1); // default to today
  const stripRef = useRef(null);

  // Start scrolled to the most recent day (far right)
  useEffect(() => {
    if (stripRef.current) stripRef.current.scrollLeft = stripRef.current.scrollWidth;
  }, []);
  const active = days[selected];

  const maxSteps = Math.max(DAILY_STEP_GOAL, ...days.map((d) => d.steps));
  const weekAvg = Math.round(days.reduce((a, d) => a + d.steps, 0) / 7);
  const progress = Math.min(100, Math.round((active.steps / DAILY_STEP_GOAL) * 100));

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/15">
            <Footprints className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-sm font-semibold text-white">Steps</p>
        </div>
        <span className="text-xs text-white/35">{HISTORY_DAYS}-day avg {weekAvg.toLocaleString()}</span>
      </div>

      {/* Selected day overview */}
      <div className="flex items-center gap-4 mb-4">
        <ProgressRing progress={progress} />
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}>
              <p className="text-3xl font-black text-white tabular-nums leading-none">
                {active.steps.toLocaleString()}
              </p>
              <p className="text-xs text-white/35 mt-1">
                {active.isToday ? "steps today" : `steps · ${format(active.date, "EEE, MMM d")}`}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mini stats for selected day */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex gap-2 mb-4">
          <MiniStat icon={Flame} value={active.calories} unit="kcal" color="text-orange-400" />
          <MiniStat icon={MapPin} value={active.distanceKm} unit="km" color="text-zinc-400" />
          <MiniStat icon={Clock} value={active.minutes} unit="min" color="text-blue-400" />
        </motion.div>
      </AnimatePresence>

      {/* Interactive swipeable history bars — swipe left/right to see further back */}
      <div ref={stripRef} className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex items-end gap-2 h-20" style={{ minWidth: "100%" }}>
          {days.map((d, i) => {
            const h = Math.max(6, Math.round((d.steps / maxSteps) * 100));
            const hitGoal = d.steps >= DAILY_STEP_GOAL;
            const isActive = i === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="flex flex-col items-center gap-1.5 h-full justify-end group shrink-0 w-7">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`w-full rounded-md transition-colors ${
                    isActive
                      ? "bg-green-400 ring-2 ring-green-400/40"
                      : hitGoal
                      ? "bg-green-500/60 group-hover:bg-green-500/80"
                      : "bg-white/15 group-hover:bg-white/25"
                  }`} />
                <span className={`text-[10px] whitespace-nowrap ${isActive ? "text-green-400 font-semibold" : "text-white/30"}`}>
                  {d.isToday ? "Today" : format(d.date, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}