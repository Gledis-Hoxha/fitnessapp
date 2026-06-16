import { useState } from "react";
import { format, subDays } from "date-fns";
import { Footprints, Flame, MapPin, Target } from "lucide-react";
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

  // The day the user is inspecting (defaults to today = last point)
  const [activeIdx, setActiveIdx] = useState(6);
  const active = days[activeIdx];

  const maxSteps = Math.max(DAILY_STEP_GOAL, ...days.map((d) => d.steps));
  const weekAvg = Math.round(days.reduce((a, d) => a + d.steps, 0) / 7);

  const calories = Math.round(active.steps * CALORIES_PER_STEP);
  const distanceKm = (active.steps * STEP_LENGTH_M / 1000).toFixed(1);
  const progress = Math.min(100, Math.round((active.steps / DAILY_STEP_GOAL) * 100));

  // Geometry for the SVG area chart
  const W = 300;
  const H = 96;
  const PAD_Y = 12;
  const stepX = W / (days.length - 1);
  const yOf = (steps) => PAD_Y + (1 - steps / maxSteps) * (H - PAD_Y * 2);
  const pts = days.map((d, i) => ({ x: i * stepX, y: yOf(d.steps), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  const goalY = yOf(DAILY_STEP_GOAL);

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

      {/* Selected day summary */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-3xl font-black text-white tabular-nums leading-none">{active.steps.toLocaleString()}</p>
          <p className="text-xs text-white/35 mt-1">
            {active.isToday ? "steps today" : `steps · ${format(active.date, "EEE, MMM d")}`} · {progress}% of goal
          </p>
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

      {/* Interactive area chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="stepArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Goal reference line */}
        <line x1="0" y1={goalY} x2={W} y2={goalY} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="4 4" />

        <path d={areaPath} fill="url(#stepArea)" />
        <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => {
          const isActive = i === activeIdx;
          return (
            <g key={i}>
              {/* invisible wide hit target for easy tapping */}
              <rect
                x={p.x - stepX / 2}
                y="0"
                width={stepX}
                height={H}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => setActiveIdx(i)} />
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 5 : 3}
                fill={isActive ? "#22c55e" : "hsl(248,20%,15%)"}
                stroke="#22c55e"
                strokeWidth="2"
                className="transition-all pointer-events-none" />
            </g>
          );
        })}
      </svg>

      {/* Day labels */}
      <div className="flex items-center justify-between mt-1.5">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`flex-1 text-[10px] transition-colors ${
              i === activeIdx ? "text-green-400 font-semibold" : "text-white/30"
            }`}>
            {format(d.date, "EEEEE")}
          </button>
        ))}
      </div>
    </div>
  );
}