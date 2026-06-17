const MACRO_GOALS_KEY = "macro_goals";
const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

function getMacroGoals() {
  try { return JSON.parse(localStorage.getItem(MACRO_GOALS_KEY)) || DEFAULT_GOALS; }
  catch { return DEFAULT_GOALS; }
}

function Ring({ pct, size, stroke, color, trackColor = "rgba(255,255,255,0.08)" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, pct) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function MacroStat({ label, value, goal, color, unit = "g" }) {
  const pct = Math.min(100, goal ? Math.round((value / goal) * 100) : 0);
  const over = value > goal;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <Ring pct={pct} size={64} stroke={6} color={over ? "#ef4444" : color} />
        <span className="absolute text-[11px] font-bold text-white">{pct}%</span>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-white/50">{label}</p>
        <p className={`text-[11px] font-semibold ${over ? "text-red-400" : "text-white/70"}`}>
          {Math.round(value)}<span className="text-white/25 font-normal">/{goal}{unit}</span>
        </p>
      </div>
    </div>
  );
}

export default function MacroProgressChart({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const goals = getMacroGoals();

  return (
    <div className="border border-white/10 rounded-2xl p-4 h-full flex items-center justify-center" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="w-full grid grid-cols-2 gap-4 place-items-center">
        <MacroStat label="Calories" value={calories} goal={goals.calories} color="#22c55e" unit=" kcal" />
        <MacroStat label="Protein" value={protein} goal={goals.protein} color="#3b82f6" />
        <MacroStat label="Carbs" value={carbs} goal={goals.carbs} color="#eab308" />
        <MacroStat label="Fat" value={fat} goal={goals.fat} color="#f97316" />
      </div>
    </div>
  );
}