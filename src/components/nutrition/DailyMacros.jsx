export default function DailyMacros({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const macros = [
    { label: "Calories", value: Math.round(calories), unit: "kcal", color: "text-green-400", bg: "bg-green-500/20", bar: "bg-green-500", max: 2000 },
    { label: "Protein",  value: Math.round(protein),  unit: "g",    color: "text-blue-400",  bg: "bg-blue-500/20",  bar: "bg-blue-500",  max: 150 },
    { label: "Carbs",    value: Math.round(carbs),    unit: "g",    color: "text-yellow-400",bg: "bg-yellow-500/20",bar: "bg-yellow-500",max: 300 },
    { label: "Fat",      value: Math.round(fat),      unit: "g",    color: "text-orange-400",bg: "bg-orange-500/20",bar: "bg-orange-500",max: 65 },
  ];

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Today's Intake</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {macros.map((m) => {
          const pct = Math.min(100, m.max ? (m.value / m.max) * 100 : 0);
          return (
            <div key={m.label} className={`rounded-xl p-3 ${m.bg}`}>
              <p className="text-xs text-white/50 mb-1">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}<span className="text-xs font-normal text-white/40 ml-1">{m.unit}</span></p>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className={`h-full rounded-full ${m.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}