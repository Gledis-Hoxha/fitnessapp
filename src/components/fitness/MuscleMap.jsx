import { useMemo } from "react";
import { Activity } from "lucide-react";

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
  if (!count || !max) return null;
  const intensity = count / max;
  if (intensity > 0.7) return "#22c55e";
  if (intensity > 0.4) return "#84cc16";
  if (intensity > 0.15) return "#f59e0b";
  return "#3b82f6";
}

const MUSCLE_LABELS = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps",
  triceps: "Triceps", back: "Back", abs: "Core",
  quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Calves",
};

const MUSCLE_GROUP_ORDER = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "abs", "quads", "hamstrings", "glutes", "calves",
];

export default function MuscleMap({ workouts = [] }) {
  const heatmap = useMemo(() => getMuscleHeatmap(workouts), [workouts]);
  const max = Math.max(1, ...Object.values(heatmap));

  const muscles = MUSCLE_GROUP_ORDER.map((id) => ({
    id,
    label: MUSCLE_LABELS[id],
    count: heatmap[id] || 0,
    color: getColor(heatmap[id] || 0, max),
  }));

  const trained = muscles.filter((m) => m.count > 0);

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">Muscles Trained</p>
        </div>
        {trained.length > 0 && (
          <span className="text-xs text-white/30">{trained.length} muscle groups</span>
        )}
      </div>

      {trained.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-white/25 italic">Complete workouts to see muscle tracking</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {muscles.map(({ id, label, count, color }) => {
              const pct = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={id} className="flex items-center gap-3">
                  <p className="text-xs text-white/40 w-20 flex-shrink-0">{label}</p>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    {count > 0 && (
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-semibold w-6 text-right flex-shrink-0" style={{ color: color || "rgba(255,255,255,0.2)" }}>
                    {count > 0 ? `${count}x` : ""}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/8">
            {trained.sort((a, b) => b.count - a.count).slice(0, 4).map(({ id, label, count, color }) => (
              <span
                key={id}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium border"
                style={{
                  borderColor: color + "40",
                  color,
                  background: color + "18",
                }}
              >
                {label} · {count}x
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}