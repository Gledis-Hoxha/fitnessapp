import { useMemo } from "react";

// Maps exercise keywords → muscle group IDs
const MUSCLE_KEYWORDS = {
  chest: ["chest", "pec", "bench", "push"],
  shoulders: ["shoulder", "delt", "overhead", "press"],
  biceps: ["bicep", "curl", "chin"],
  triceps: ["tricep", "dip", "skull"],
  back: ["back", "lat", "row", "pull", "deadlift"],
  abs: ["abs", "core", "plank", "crunch", "sit"],
  quads: ["quad", "squat", "leg press", "lunge", "extension"],
  hamstrings: ["hamstring", "leg curl", "rdl", "romanian"],
  glutes: ["glute", "hip thrust", "bridge"],
  calves: ["calf", "calves", "raise"],
  forearms: ["forearm", "wrist"],
};

function getMuscleHeatmap(workouts) {
  const counts = {};
  workouts.forEach((w) =>
    w.exercises?.forEach((ex) => {
      const name = (ex.exercise_name || "").toLowerCase();
      Object.entries(MUSCLE_KEYWORDS).forEach(([muscle, kws]) => {
        if (kws.some((k) => name.includes(k))) {
          counts[muscle] = (counts[muscle] || 0) + 1;
        }
      });
    })
  );
  return counts;
}

function getColor(count, max) {
  if (!count || !max) return "rgba(255,255,255,0.07)";
  const intensity = count / max;
  if (intensity > 0.7) return "#22c55e";
  if (intensity > 0.4) return "#84cc16";
  if (intensity > 0.15) return "#eab308";
  return "#3b82f6";
}

const MUSCLE_LABELS = {
  chest: "Chest",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  back: "Back",
  abs: "Core",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
};

export default function MuscleMap({ workouts = [] }) {
  const heatmap = useMemo(() => getMuscleHeatmap(workouts), [workouts]);
  const max = Math.max(1, ...Object.values(heatmap));

  const sorted = Object.entries(MUSCLE_LABELS)
    .map(([id, label]) => ({ id, label, count: heatmap[id] || 0 }))
    .sort((a, b) => b.count - a.count);

  const top = sorted.filter((m) => m.count > 0).slice(0, 3);

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
      <p className="text-sm font-semibold text-white mb-4">Muscles Trained</p>

      <div className="flex gap-4">
        {/* SVG Body Front */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 100 220" width="80" height="176" className="overflow-visible">
            {/* Head */}
            <ellipse cx="50" cy="14" rx="12" ry="13" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {/* Neck */}
            <rect x="44" y="26" width="12" height="8" rx="3" fill="rgba(255,255,255,0.06)" />
            {/* Shoulders */}
            <ellipse cx="28" cy="42" rx="12" ry="8" fill={getColor(heatmap.shoulders, max)} opacity="0.9" />
            <ellipse cx="72" cy="42" rx="12" ry="8" fill={getColor(heatmap.shoulders, max)} opacity="0.9" />
            {/* Chest */}
            <path d="M36 35 Q50 28 64 35 Q64 52 50 56 Q36 52 36 35Z" fill={getColor(heatmap.chest, max)} opacity="0.9" />
            {/* Biceps */}
            <rect x="14" y="48" width="12" height="22" rx="6" fill={getColor(heatmap.biceps, max)} opacity="0.9" />
            <rect x="74" y="48" width="12" height="22" rx="6" fill={getColor(heatmap.biceps, max)} opacity="0.9" />
            {/* Forearms */}
            <rect x="12" y="72" width="10" height="20" rx="5" fill={getColor(heatmap.forearms, max)} opacity="0.9" />
            <rect x="78" y="72" width="10" height="20" rx="5" fill={getColor(heatmap.forearms, max)} opacity="0.9" />
            {/* Abs */}
            <path d="M38 56 Q50 52 62 56 L62 90 Q50 94 38 90Z" fill={getColor(heatmap.abs, max)} opacity="0.85" />
            {/* Quads */}
            <rect x="34" y="100" width="14" height="40" rx="7" fill={getColor(heatmap.quads, max)} opacity="0.9" />
            <rect x="52" y="100" width="14" height="40" rx="7" fill={getColor(heatmap.quads, max)} opacity="0.9" />
            {/* Calves */}
            <rect x="35" y="150" width="12" height="28" rx="6" fill={getColor(heatmap.calves, max)} opacity="0.9" />
            <rect x="53" y="150" width="12" height="28" rx="6" fill={getColor(heatmap.calves, max)} opacity="0.9" />
          </svg>
        </div>

        {/* SVG Body Back */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 100 220" width="80" height="176" className="overflow-visible">
            {/* Head */}
            <ellipse cx="50" cy="14" rx="12" ry="13" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {/* Neck */}
            <rect x="44" y="26" width="12" height="8" rx="3" fill="rgba(255,255,255,0.06)" />
            {/* Traps/Shoulders */}
            <ellipse cx="28" cy="40" rx="13" ry="8" fill={getColor(heatmap.shoulders, max)} opacity="0.85" />
            <ellipse cx="72" cy="40" rx="13" ry="8" fill={getColor(heatmap.shoulders, max)} opacity="0.85" />
            {/* Back/Lats */}
            <path d="M34 34 Q50 30 66 34 L64 88 Q50 92 36 88Z" fill={getColor(heatmap.back, max)} opacity="0.9" />
            {/* Triceps */}
            <rect x="14" y="48" width="11" height="20" rx="5" fill={getColor(heatmap.triceps, max)} opacity="0.9" />
            <rect x="75" y="48" width="11" height="20" rx="5" fill={getColor(heatmap.triceps, max)} opacity="0.9" />
            {/* Glutes */}
            <ellipse cx="42" cy="100" rx="10" ry="9" fill={getColor(heatmap.glutes, max)} opacity="0.9" />
            <ellipse cx="58" cy="100" rx="10" ry="9" fill={getColor(heatmap.glutes, max)} opacity="0.9" />
            {/* Hamstrings */}
            <rect x="34" y="110" width="14" height="36" rx="7" fill={getColor(heatmap.hamstrings, max)} opacity="0.9" />
            <rect x="52" y="110" width="14" height="36" rx="7" fill={getColor(heatmap.hamstrings, max)} opacity="0.9" />
            {/* Calves back */}
            <rect x="35" y="153" width="12" height="26" rx="6" fill={getColor(heatmap.calves, max)} opacity="0.9" />
            <rect x="53" y="153" width="12" height="26" rx="6" fill={getColor(heatmap.calves, max)} opacity="0.9" />
          </svg>
        </div>

        {/* Legend & Top muscles */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            {sorted.filter((m) => m.count > 0).slice(0, 5).map(({ id, label, count }) => (
              <div key={id} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getColor(count, max) }} />
                <p className="text-xs text-white/60 flex-1 truncate">{label}</p>
                <p className="text-xs font-semibold text-white/80">{count}x</p>
              </div>
            ))}
            {sorted.filter((m) => m.count > 0).length === 0 && (
              <p className="text-xs text-white/25 italic">Complete workouts to see muscle tracking</p>
            )}
          </div>

          {/* Color legend */}
          <div className="space-y-1 pt-1 border-t border-white/8">
            <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Frequency</p>
            {[
              { color: "#22c55e", label: "High" },
              { color: "#eab308", label: "Medium" },
              { color: "#3b82f6", label: "Low" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-[10px] text-white/40">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {top.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/8 flex flex-wrap gap-1.5">
          <p className="text-xs text-white/30 w-full">Most trained:</p>
          {top.map(({ id, label, count }) => (
            <span key={id} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: getColor(count, max) + "40", color: getColor(count, max), background: getColor(count, max) + "15" }}>
              {label} · {count}x
            </span>
          ))}
        </div>
      )}
    </div>
  );
}