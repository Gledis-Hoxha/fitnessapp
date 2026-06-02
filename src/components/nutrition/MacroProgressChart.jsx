import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const GOALS = { protein: 150, carbs: 250, fat: 65, calories: 2000 };

function MacroBar({ label, value, goal, color, bgColor }) {
  const pct = Math.min(100, goal ? Math.round((value / goal) * 100) : 0);
  const over = value > goal;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <span className={`text-xs font-semibold ${over ? "text-red-400" : color}`}>
          {Math.round(value)}<span className="text-white/25 font-normal">/{goal}g</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-500" : bgColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-white/25 text-right">{pct}% of goal</p>
    </div>
  );
}

export default function MacroProgressChart({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const calPct = Math.min(100, Math.round((calories / GOALS.calories) * 100));

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl px-4 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Daily Progress</p>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${calPct >= 100 ? "bg-red-400" : "bg-green-400"}`} />
          <span className={`text-xs font-semibold ${calPct >= 100 ? "text-red-400" : "text-green-400"}`}>
            {Math.round(calories)} / {GOALS.calories} kcal
          </span>
        </div>
      </div>

      {/* Calorie bar */}
      <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${calPct >= 100 ? "bg-red-500" : "bg-gradient-to-r from-green-500 to-green-400"}`}
          style={{ width: `${calPct}%` }}
        />
      </div>

      {/* Macro bars */}
      <div className="space-y-3 pt-1">
        <MacroBar label="Protein" value={protein} goal={GOALS.protein} color="text-blue-400" bgColor="bg-blue-500" />
        <MacroBar label="Carbs"   value={carbs}   goal={GOALS.carbs}   color="text-yellow-400" bgColor="bg-yellow-500" />
        <MacroBar label="Fat"     value={fat}     goal={GOALS.fat}     color="text-orange-400" bgColor="bg-orange-500" />
      </div>
    </div>
  );
}