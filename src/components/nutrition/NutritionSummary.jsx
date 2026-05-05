import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4 space-y-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Today's Summary</p>

      {!hasData ? (
        <p className="text-sm text-white/30 text-center py-6">Log some food to see your summary.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pie */}
          <div>
            <p className="text-xs text-white/40 mb-2 text-center">Macro split</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={MACRO_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}g`, n]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: MACRO_COLORS[d.name] }} />
                  <span className="text-xs text-white/50">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar */}
          <div>
            <p className="text-xs text-white/40 mb-2 text-center">Grams breakdown</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} unit="g" width={32} />
                <Tooltip formatter={(v) => [`${v}g`]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Total calories callout */}
      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
        <span className="text-sm text-white/60">Total calories today</span>
        <span className="text-lg font-bold text-green-400">{Math.round(calories)} <span className="text-xs font-normal text-white/40">kcal</span></span>
      </div>
    </div>
  );
}