import { format, subDays } from "date-fns";
import { Scale, Trophy, Bell, StickyNote, Image, Trash2, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const ACHIEVEMENTS = [
  { emoji: "🥇", label: "First Meal Logged", condition: (meals) => meals.length >= 1 },
  { emoji: "🔥", label: "7 Days Streak", condition: () => false },
  { emoji: "💪", label: "50 Meals Logged", condition: (meals) => meals.length >= 50 },
  { emoji: "🥗", label: "Protein Goal Hit", condition: () => false },
  { emoji: "⚡", label: "10 Days Logged", condition: () => false },
];

const DEFAULT_REMINDERS = [
  { id: "breakfast", time: "8:00 AM", label: "Log Breakfast", active: true },
  { id: "lunch",     time: "1:00 PM", label: "Log Lunch",     active: true },
  { id: "dinner",    time: "7:00 PM", label: "Log Dinner",    active: false },
];

export default function ProfileNutritionTab({ meals = [], user }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState(DEFAULT_REMINDERS);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);

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

  // Calculate recommended calories based on weight/goal_weight
  const calcRecommendedCal = () => {
    if (!user?.weight_kg) return null;
    const base = user.weight_kg * 22 * (
      user.activity_level === "sedentary" ? 1.2 :
      user.activity_level === "lightly_active" ? 1.375 :
      user.activity_level === "moderately_active" ? 1.55 :
      user.activity_level === "very_active" ? 1.725 : 1.9
    );
    // Adjust for goal
    if (user.goal_weight_kg && user.goal_weight_kg < user.weight_kg) return Math.round(base - 300);
    if (user.goal_weight_kg && user.goal_weight_kg > user.weight_kg) return Math.round(base + 250);
    return Math.round(base);
  };
  const recommendedCal = calcRecommendedCal();

  const toggleReminder = (id) =>
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((prev) => [{ id: Date.now(), text: note, date: new Date().toISOString() }, ...prev]);
    setNote("");
  };

  const deleteNote = (id) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProgressPhotos((prev) => [...prev, { url: file_url, date: new Date().toISOString() }]);
    setUploading(false);
    toast.success("Progress photo uploaded!");
    e.target.value = "";
  };

  const deletePhoto = (index) => setProgressPhotos((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {/* Weight & Stats */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Weight & Stats</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">{user?.weight_kg ? `${user.weight_kg} kg` : "—"}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-tight">Current Weight</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/50">{user?.goal_weight_kg ? `${user.goal_weight_kg} kg` : "—"}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-tight">Goal Weight</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-yellow-400">{avgCalories ? `${avgCalories}` : "—"}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-tight">Avg kcal/day</p>
          </div>
        </div>
        {recommendedCal && (
          <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-green-300">Recommended daily calories</p>
            <p className="text-sm font-bold text-green-400">{recommendedCal} kcal</p>
          </div>
        )}
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
              <div key={a.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${unlocked ? "bg-yellow-500/10 border-yellow-500/30" : "bg-white/3 border-white/5 opacity-40"}`}>
                <span className="text-2xl">{a.emoji}</span>
                <p className="text-[10px] text-center text-white/60 leading-tight">{a.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminders — fully toggleable */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Meal Reminders</p>
        </div>
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className={`text-sm ${r.active ? "text-white" : "text-white/40"}`}>{r.label}</p>
                <p className="text-xs text-white/35">{r.time}</p>
              </div>
              <button onClick={() => toggleReminder(r.id)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${r.active ? "bg-green-500" : "bg-white/15"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${r.active ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Photos */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-green-400" />
            <p className="text-sm font-semibold text-white">Progress Photos</p>
          </div>
          <button onClick={() => photoInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Add Photo"}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        {progressPhotos.length === 0 ? (
          <button onClick={() => photoInputRef.current?.click()} className="w-full aspect-[3/1] rounded-xl bg-white/5 border border-dashed border-white/15 flex flex-col items-center justify-center gap-2 hover:bg-white/8 transition-colors">
            <Image className="w-8 h-8 text-white/20" />
            <p className="text-xs text-white/30">Upload your first progress photo</p>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {progressPhotos.map((p, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                <img src={p.url} alt="Progress" className="w-full h-full object-cover" />
                <button onClick={() => deletePhoto(i)}
                  className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <p className="absolute bottom-0 left-0 right-0 text-[9px] text-white/60 bg-black/50 text-center py-0.5">
                  {format(new Date(p.date), "MMM d")}
                </p>
              </div>
            ))}
            <button onClick={() => photoInputRef.current?.click()}
              className="aspect-square rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center hover:bg-white/8 transition-colors">
              <Plus className="w-5 h-5 text-white/30" />
            </button>
          </div>
        )}
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
          <button onClick={addNote} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-xs text-white/25 text-center py-2">No notes yet</p>
          ) : notes.map((n) => (
            <div key={n.id} className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{n.text}</p>
                <p className="text-xs text-white/30 mt-0.5">{format(new Date(n.date), "MMM d, h:mm a")}</p>
              </div>
              <button onClick={() => deleteNote(n.id)}
                className="p-1 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}