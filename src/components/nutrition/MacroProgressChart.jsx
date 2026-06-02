import { getMacroGoals } from "@/components/shared/SettingsModal";

function MacroBar({ label, value, goal, color, bgColor }) {
  const pct = Math.min(100, goal ? Math.round((value / goal) * 100) : 0);
  const over = value > goal;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 w-10 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-500" : bgColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-semibold w-14 text-right flex-shrink-0 ${over ? "text-red-400" : color}`}>
        {Math.round(value)}<span className="text-white/20 font-normal">/{goal}</span>
      </span>
    </div>
  );
}

export default function MacroProgressChart({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const goals = getMacroGoals();
  const calPct = Math.min(100, Math.round((calories / goals.calories) * 100));

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl px-4 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">Daily Progress</p>
        <span className={`text-[10px] font-semibold ${calPct >= 100 ? "text-red-400" : "text-green-400"}`}>
          {Math.round(calories)} / {goals.calories} kcal · {calPct}%
        </span>
      </div>
      {/* Calorie bar */}
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${calPct >= 100 ? "bg-red-500" : "bg-gradient-to-r from-green-500 to-green-400"}`}
          style={{ width: `${calPct}%` }}
        />
      </div>
      {/* Macro bars */}
      <div className="space-y-1.5 pt-0.5">
        <MacroBar label="Protein" value={protein} goal={goals.protein} color="text-blue-400" bgColor="bg-blue-500" />
        <MacroBar label="Carbs"   value={carbs}   goal={goals.carbs}   color="text-yellow-400" bgColor="bg-yellow-500" />
        <MacroBar label="Fat"     value={fat}     goal={goals.fat}     color="text-orange-400" bgColor="bg-orange-500" />
      </div>
    </div>
  );
}