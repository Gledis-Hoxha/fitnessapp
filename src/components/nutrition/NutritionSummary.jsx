import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const MACRO_COLORS = { Protein: "#60a5fa", Carbs: "#facc15", Fat: "#fb923c" };

export default function NutritionSummary({ protein = 0, carbs = 0, fat = 0, calories = 0 }) {
  const pieData = [
    { name: "Protein", value: Math.round(protein) },
    { name: "Carbs",   value: Math.round(carbs) },
    { name: "Fat",     value: Math.round(fat) },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "Protein", value: Math.round(protein), fill: "#60a5fa" },
    { name: "Carbs",   value: Math.round(carbs),   fill: "#facc15" },
    { name: "Fat",     value: Math.round(fat),      fill: "#fb923c" },
  ];

  const hasData = protein > 0 || carbs > 0 || fat > 0;

  return (
    <div className="border border-white/10 rounded-2xl px-4 py-3 space-y-3" style={{ background: "hsl(248,20%,15%)" }}>
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">This Week</p>

      {!hasData ? (
        <p className="text-xs text-white/25 text-center py-3">Log some food to see your summary.</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={MACRO_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}g`, n]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: MACRO_COLORS[d.name] }} />
                  <span className="text-xs text-white/50">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-white">{d.value}g</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-white/8">
              <span className="text-xs text-white/40">Total</span>
              <span className="text-xs font-bold text-green-400">{Math.round(calories)} kcal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}