import { getMacroGoals } from "@/components/shared/SettingsModal";

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

function MacroStat({ label, value, goal, color }) {
  const pct = Math.min(100, goal ? Math.round((value / goal) * 100) : 0);
  const over = value > goal;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        <Ring pct={pct} size={48} stroke={5} color={over ? "#ef4444" : color} />
        <span className="absolute text-[9px] font-bold text-white">{pct}%</span>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-white/50">{label}</p>
        <p className={`text-[10px] font-semibold ${over ? "text-red-400" : "text-white/70"}`}>
          {Math.round(value)}<span className="text-white/25 font-normal">/{goal}g</span>
        </p>
      </div>
    </div>
  );
}

export default function MacroProgressChart({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const goals = getMacroGoals();
  const calPct = Math.min(100, Math.round((calories / goals.calories) * 100));
  const over = calories > goals.calories;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4 h-full flex flex-col items-center justify-center gap-4">
      {/* Calorie circular progress */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <Ring pct={calPct} size={104} stroke={9} color={over ? "#ef4444" : "#22c55e"} />
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-bold text-white leading-none">{Math.round(calories)}</span>
          <span className="text-[9px] text-white/35 mt-0.5">/ {goals.calories} kcal</span>
          <span className={`text-[10px] font-semibold mt-0.5 ${over ? "text-red-400" : "text-green-400"}`}>{calPct}%</span>
        </div>
      </div>

      {/* Macro mini rings */}
      <div className="w-full grid grid-cols-3 gap-2">
        <MacroStat label="Protein" value={protein} goal={goals.protein} color="#3b82f6" />
        <MacroStat label="Carbs" value={carbs} goal={goals.carbs} color="#eab308" />
        <MacroStat label="Fat" value={fat} goal={goals.fat} color="#f97316" />
      </div>
    </div>
  );
}