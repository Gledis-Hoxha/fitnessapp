import { format, subDays } from "date-fns";
import { Scale, Trophy, Bell, StickyNote, Image } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";

const ACHIEVEMENTS = [
  { emoji: "🥇", label: "First Meal Logged", condition: (meals) => meals.length >= 1 },
  { emoji: "🔥", label: "7 Days Streak", condition: () => false },
  { emoji: "💪", label: "50 Meals Logged", condition: (meals) => meals.length >= 50 },
  { emoji: "🥗", label: "Protein Goal Hit", condition: () => false },
  { emoji: "⚡", label: "10 Days Logged", condition: () => false },
];

export default function ProfileNutritionTab({ meals = [] }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  // Last 7 days calorie trend
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayMeals = meals.filter((m) => m.date === date);
    return {
      name: format(subDays(new Date(), 6 - i), "EEE"),
      cal: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
    };
  });

  const uniqueDays = new Set(meals.map((m) => m.date)).size;
  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const avgCalories = uniqueDays ? Math.round(totalCalories / uniqueDays) : 0;

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((prev) => [{ text: note, date: new Date().toISOString() }, ...prev]);
    setNote("");
  };

  return (
    <div className="space-y-4">
      {/* Weight & Stats */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Weight & Stats</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Current Weight", value: "— kg", color: "text-green-400" },
            { label: "Goal Weight",    value: "— kg", color: "text-white/50" },
            { label: "Avg Calories",   value: avgCalories ? `${avgCalories} kcal` : "—", color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/35 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calorie Trend */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <p className="text-sm font-semibold text-white mb-3">7-Day Calorie Trend</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} unit=" kcal" width={50} />
            <Tooltip formatter={(v) => [`${v} kcal`]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, fontSize: 11 }} />
            <Line type="monotone" dataKey="cal" stroke="#4ade80" strokeWidth={2} dot={{ fill: "#4ade80", r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Achievements */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <p className="text-sm font-semibold text-white">Achievements</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.condition(meals);
            return (
              <div
                key={a.label}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  unlocked ? "bg-yellow-500/10 border-yellow-500/30" : "bg-white/3 border-white/5 opacity-40"
                }`}
              >
                <span className="text-2xl">{a.emoji}</span>
                <p className="text-[10px] text-center text-white/60 leading-tight">{a.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Reminders</p>
        </div>
        <div className="space-y-2">
          {[
            { time: "8:00 AM", label: "Log Breakfast", active: true },
            { time: "1:00 PM", label: "Log Lunch", active: true },
            { time: "7:00 PM", label: "Log Dinner", active: false },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm text-white">{r.label}</p>
                <p className="text-xs text-white/35">{r.time}</p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all cursor-pointer ${r.active ? "bg-green-500" : "bg-white/15"}`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-all ${r.active ? "ml-5.5" : "ml-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Album */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Progress Photos</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:bg-white/8 transition-colors">
              <span className="text-white/20 text-2xl">+</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/25 text-center mt-2">Add progress photos (coming soon)</p>
      </div>

      {/* Notes */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Notes</p>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Add a note..."
            className="flex-1 bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-green-500/50"
          />
          <button
            onClick={addNote}
            className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-xs text-white/25 text-center py-2">No notes yet</p>
          ) : notes.map((n, i) => (
            <div key={i} className="bg-white/5 rounded-xl px-3 py-2">
              <p className="text-sm text-white">{n.text}</p>
              <p className="text-xs text-white/30 mt-0.5">{format(new Date(n.date), "MMM d, h:mm a")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}