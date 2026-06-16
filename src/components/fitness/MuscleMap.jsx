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

// Group the raw muscles into 6 axes so the chart forms a clean hexagon
const AXES = [
  { id: "chest", label: "Chest", muscles: ["chest"] },
  { id: "shoulders", label: "Shoulders", muscles: ["shoulders"] },
  { id: "arms", label: "Arms", muscles: ["biceps", "triceps"] },
  { id: "legs", label: "Legs", muscles: ["quads", "hamstrings", "glutes", "calves"] },
  { id: "core", label: "Core", muscles: ["abs"] },
  { id: "back", label: "Back", muscles: ["back"] },
];

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

export default function MuscleMap({ workouts = [] }) {
  const heatmap = useMemo(() => getMuscleHeatmap(workouts), [workouts]);

  const axes = useMemo(() => {
    return AXES.map((axis) => ({
      ...axis,
      count: axis.muscles.reduce((sum, m) => sum + (heatmap[m] || 0), 0),
    }));
  }, [heatmap]);

  const max = Math.max(1, ...axes.map((a) => a.count));
  const trainedCount = axes.filter((a) => a.count > 0).length;

  // SVG geometry
  const SIZE = 240;
  const CENTER = SIZE / 2;
  const RADIUS = 88;
  const RINGS = 4;

  // Point on a given axis (0..5) at value ratio (0..1). Start at top, go clockwise.
  const pointAt = (axisIndex, ratio) => {
    const angle = (Math.PI * 2 * axisIndex) / 6 - Math.PI / 2;
    const r = RADIUS * ratio;
    return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
  };

  // Background grid hexagons
  const gridRings = Array.from({ length: RINGS }, (_, ring) => {
    const ratio = (ring + 1) / RINGS;
    return AXES.map((_, i) => pointAt(i, ratio).join(",")).join(" ");
  });

  // Spokes + label positions
  const spokes = AXES.map((axis, i) => {
    const [x, y] = pointAt(i, 1);
    const [lx, ly] = pointAt(i, 1.28);
    return { ...axis, x, y, lx, ly };
  });

  // Data polygon
  const dataPoints = axes.map((axis, i) => {
    const ratio = max > 0 ? axis.count / max : 0;
    return pointAt(i, Math.max(0.04, ratio));
  });
  const dataPolygon = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">Muscles Trained</p>
        </div>
        {trainedCount > 0 && (
          <span className="text-xs text-white/30">{trainedCount}/6 areas</span>
        )}
      </div>

      {trainedCount === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-white/25 italic">Complete workouts to see muscle tracking</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
              <defs>
                <radialGradient id="muscleFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.35" />
                </radialGradient>
              </defs>

              {/* Grid hexagons */}
              {gridRings.map((pts, i) => (
                <polygon
                  key={i}
                  points={pts}
                  fill="none"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="1"
                />
              ))}

              {/* Spokes */}
              {spokes.map((s) => (
                <line
                  key={s.id}
                  x1={CENTER}
                  y1={CENTER}
                  x2={s.x}
                  y2={s.y}
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="1"
                />
              ))}

              {/* Data polygon */}
              <polygon
                points={dataPolygon}
                fill="url(#muscleFill)"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Data vertices */}
              {dataPoints.map((p, i) => (
                axes[i].count > 0 ? (
                  <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#22c55e" stroke="#0a0a0f" strokeWidth="1.5" />
                ) : null
              ))}

              {/* Axis labels */}
              {spokes.map((s) => {
                const anchor = s.lx < CENTER - 4 ? "end" : s.lx > CENTER + 4 ? "start" : "middle";
                return (
                  <text
                    key={s.id}
                    x={s.lx}
                    y={s.ly}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="fill-white/55"
                    style={{ fontSize: "10px", fontWeight: 600 }}
                  >
                    {s.label}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-3 mt-1 border-t border-white/8">
            {axes.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white/4 rounded-lg px-2 py-1">
                <span className="text-[10px] text-white/40 truncate">{a.label}</span>
                <span className={`text-[11px] font-semibold ${a.count > 0 ? "text-green-400" : "text-white/20"}`}>
                  {a.count}x
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}