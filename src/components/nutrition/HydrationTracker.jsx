import { useState, useEffect } from "react";
import { Droplets, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

const STORAGE_KEY = "hydration_log";
const GOAL = 8;

function getLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export default function HydrationTracker({ date }) {
  const today = date || format(new Date(), "yyyy-MM-dd");
  const [log, setLog] = useState(getLog);
  const glasses = log[today] || 0;

  const update = (val) => {
    const next = Math.max(0, Math.min(12, val));
    const newLog = { ...log, [today]: next };
    setLog(newLog);
    saveLog(newLog);
  };

  const pct = Math.min(100, (glasses / GOAL) * 100);
  const done = glasses >= GOAL;

  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">Hydration</p>
        </div>
        <span className={`text-xs font-semibold ${done ? "text-blue-400" : "text-white/40"}`}>
          {glasses}/{GOAL} glasses {done ? "✓" : ""}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/8 rounded-full mb-4 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: done ? "#22c55e" : "#3b82f6",
          }}
        />
      </div>

      {/* Glass icons */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {Array.from({ length: GOAL }).map((_, i) => (
          <button
            key={i}
            onClick={() => update(i < glasses ? i : i + 1)}
            className="transition-transform active:scale-90"
            title={i < glasses ? "Remove" : "Add"}
          >
            <Droplets
              className={`w-5 h-5 transition-colors ${
                i < glasses ? "text-blue-400" : "text-white/15"
              }`}
              fill={i < glasses ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      {/* +/- controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => update(glasses - 1)}
          disabled={glasses === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/6 border border-white/8 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors text-xs font-semibold"
        >
          <Minus className="w-3.5 h-3.5" /> Remove
        </button>
        <button
          onClick={() => update(glasses + 1)}
          disabled={glasses >= 12}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 transition-colors text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Add Glass
        </button>
      </div>
    </div>
  );
}