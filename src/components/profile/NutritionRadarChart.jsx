const PENTAGON_ANGLES = Array.from({ length: 5 }, (_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);

const MAX_RECOMMENDED = {
  calories: 2500,
  protein: 200,
  carbs: 325,
  fats: 78,
  hydration: 3000
};

function polarToCartesian(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function polygonPoints(cx, cy, r, angles) {
  return angles.map((a) => polarToCartesian(cx, cy, r, a))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

function pointsFromArray(pts) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

export default function NutritionRadarChart({ actual = {}, user, label }) {
  const cx = 140, cy = 140, maxR = 110;

  const recommended = {};
  if (user?.weight_kg) {
    const base = user.weight_kg * 22 * (
      user.activity_level === "sedentary" ? 1.2 :
      user.activity_level === "lightly_active" ? 1.375 :
      user.activity_level === "moderately_active" ? 1.55 :
      user.activity_level === "very_active" ? 1.725 : 1.9
    );
    const adj = user.goal_weight_kg && user.goal_weight_kg < user.weight_kg ? -300 : user.goal_weight_kg && user.goal_weight_kg > user.weight_kg ? 250 : 0;
    recommended.calories = Math.round(base + adj);
    recommended.protein = Math.round(user.weight_kg * 1.8);
    recommended.carbs = Math.round((recommended.calories * 0.5) / 4);
    recommended.fats = Math.round((recommended.calories * 0.28) / 9);
    recommended.hydration = Math.round(user.weight_kg * 35);
  } else {
    Object.assign(recommended, MAX_RECOMMENDED);
  }

  const labels = [
    { key: "calories", label: "Calories", unit: "kcal", max: recommended.calories },
    { key: "protein", label: "Protein", unit: "g", max: recommended.protein },
    { key: "carbs", label: "Carbs", unit: "g", max: recommended.carbs },
    { key: "fats", label: "Fats", unit: "g", max: recommended.fats },
    { key: "hydration", label: "Water", unit: "ml", max: recommended.hydration },
  ];

  const ringLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPct = labels.map((l) => Math.min(1, (actual[l.key] || 0) / (l.max || 1)));

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <p className="text-sm font-semibold text-white mb-3">
        Nutrition Overview{label ? ` · ${label}` : ""}
      </p>

      <div className="flex justify-center">
        <svg width={280} height={280} viewBox="0 0 280 280">
          {/* Grid rings */}
          {ringLevels.map((level, ri) => (
            <polygon
              key={ri}
              points={polygonPoints(cx, cy, maxR * level, PENTAGON_ANGLES)}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={ri === 3 ? 1.5 : 1}
            />
          ))}

          {/* Axes */}
          {PENTAGON_ANGLES.map((angle, i) => {
            const end = polarToCartesian(cx, cy, maxR, angle);
            return (
              <line
                key={i}
                x1={cx} y1={cy} x2={end.x} y2={end.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            );
          })}

          {/* Data polygon */}
          {dataPct.some((p) => p > 0) && (
            <polygon
              points={pointsFromArray(
                PENTAGON_ANGLES.map((angle, i) =>
                  polarToCartesian(cx, cy, Math.max(4, maxR * dataPct[i]), angle)
                )
              )}
              fill="rgba(34,197,94,0.2)"
              stroke="#22c55e"
              strokeWidth={2}
            />
          )}

          {/* Data points */}
          {PENTAGON_ANGLES.map((angle, i) => {
            const r = Math.max(4, maxR * dataPct[i]);
            const p = polarToCartesian(cx, cy, r, angle);
            return (
              <circle
                key={i}
                cx={p.x} cy={p.y} r={4}
                fill="#22c55e"
                stroke="#fff"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Axis labels */}
          {PENTAGON_ANGLES.map((angle, i) => {
            const labelR = maxR + 22;
            const p = polarToCartesian(cx, cy, labelR, angle);
            const l = labels[i];
            return (
              <text
                key={i}
                x={p.x} y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize={10}
                fontWeight={600}
              >
                {l.label}
              </text>
            );
          })}

          {/* Value labels at each point */}
          {PENTAGON_ANGLES.map((angle, i) => {
            const r = maxR * dataPct[i] + (dataPct[i] > 0.85 ? -18 : 14);
            const p = polarToCartesian(cx, cy, Math.max(14, r), angle);
            const l = labels[i];
            const val = actual[l.key] || 0;
            const isOver = val > l.max;
            return (
              <text
                key={i}
                x={p.x} y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isOver ? "#f87171" : "#22c55e"}
                fontSize={10}
                fontWeight={700}
              >
                {val}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 gap-1 mt-3 pt-3 border-t border-white/8">
        {labels.map((l) => {
          const val = actual[l.key] || 0;
          const pct = Math.min(100, Math.round((val / (l.max || 1)) * 100));
          const over = val > l.max;
          return (
            <div key={l.key} className="text-center">
              <p className={`text-xs font-bold ${over ? "text-red-400" : "text-green-400"}`}>
                {val}
              </p>
              <p className="text-[10px] text-white/30">/ {l.max} {l.unit}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${over ? "text-red-400" : "text-white/40"}`}>
                {pct}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}