import { useState, useRef } from "react";
import { Droplets, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

const STORAGE_KEY = "hydration_log";
const GOAL = 2000; // ml
const STEP = 250; // ml per tap
const MAX = 3000; // ml

function getLog() {
  try {return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};} catch {return {};}
}

function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export default function HydrationTracker({ date }) {
  const today = date || format(new Date(), "yyyy-MM-dd");
  const [log, setLog] = useState(getLog);
  const ml = log[today] || 0;

  const update = (val) => {
    const next = Math.max(0, Math.min(MAX, val));
    const newLog = { ...log, [today]: next };
    setLog(newLog);
    saveLog(newLog);
  };

  const pct = Math.min(100, ml / GOAL * 100);
  const done = ml >= GOAL;

  const bottleRef = useRef(null);
  const dragging = useRef(false);

  const setFromClientY = (clientY) => {
    const el = bottleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (rect.bottom - clientY) / rect.height; // 0 at bottom, 1 at top
    const raw = Math.max(0, Math.min(1, ratio)) * MAX;
    update(Math.round(raw / STEP) * STEP);
  };

  const handleDown = (e) => {
    dragging.current = true;
    setFromClientY(e.touches ? e.touches[0].clientY : e.clientY);
  };

  const handleMove = (e) => {
    if (!dragging.current) return;
    setFromClientY(e.touches ? e.touches[0].clientY : e.clientY);
  };

  const handleUp = () => {dragging.current = false;};

  return (
    <div className="border border-white/10 rounded-2xl p-4 h-full flex flex-col" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">Hydration</p>
        </div>
        <span className={`text-xs font-semibold hidden ${done ? "text-blue-400" : "text-white/40"}`}>
          {ml}/{GOAL} ml {done ? "✓" : ""}
        </span>
      </div>

      {/* Vertical filling bottle — drag up/down to fill/empty */}
      <div className="flex justify-center mb-4">
        <div
          ref={bottleRef}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
          className="relative w-20 h-44 rounded-[2rem] border-2 border-white/15 bg-white/5 overflow-hidden cursor-ns-resize select-none touch-none">
          {/* Water fill */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-out"
            style={{
              height: `${pct}%`,
              background: done ?
              "linear-gradient(to top, #16a34a, #22c55e)" :
              "linear-gradient(to top, #2563eb, #3b82f6)"
            }}>
            
            {/* Surface shimmer */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-white/25" />
          </div>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-xl font-bold text-white drop-shadow">{ml}</span>
            <span className="text-[10px] text-white/70 drop-shadow">/ {GOAL} ml</span>
          </div>
        </div>
      </div>

      {/* +/- controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => update(ml - STEP)}
          disabled={ml === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/6 border border-white/8 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors text-xs font-semibold">
          
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => update(ml + STEP)}
          disabled={ml >= MAX}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 transition-colors text-xs font-semibold">
          
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>);

}