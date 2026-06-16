import { format, subDays } from "date-fns";
import { Scale, Bell, StickyNote, Image, Trash2, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import NutritionRadarChart from "@/components/profile/NutritionRadarChart";

const DEFAULT_REMINDERS = [
  { id: "breakfast", time: "8:00 AM", label: "Log Breakfast", active: true },
  { id: "lunch", time: "1:00 PM", label: "Log Lunch", active: true },
  { id: "dinner", time: "7:00 PM", label: "Log Dinner", active: false },
];

const MEAL_REMINDERS_KEY = "meal_reminders";

function getStoredReminders() {
  try {
    const stored = JSON.parse(localStorage.getItem(MEAL_REMINDERS_KEY));
    if (!Array.isArray(stored)) return DEFAULT_REMINDERS;
    // Merge stored active states onto defaults so labels/times stay current
    return DEFAULT_REMINDERS.map((r) => {
      const match = stored.find((s) => s.id === r.id);
      return match ? { ...r, active: match.active } : r;
    });
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export default function ProfileNutritionTab({ meals = [], user }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState(getStoredReminders);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayMeals = meals.filter((m) => m.date === date);
    return {
      name: format(subDays(new Date(), 6 - i), "EEE"),
      date,
      cal: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
      protein: dayMeals.reduce((s, m) => s + (m.protein_g || 0), 0),
      carbs: dayMeals.reduce((s, m) => s + (m.carbs_g || 0), 0),
      fats: dayMeals.reduce((s, m) => s + (m.fat_g || 0), 0),
    };
  });

  // Hydration from localStorage
  const getHydration = () => {
    try {
      const log = JSON.parse(localStorage.getItem("hydration_log") || "{}");
      const weekDates = chartData.map((d) => d.date);
      const vals = weekDates.map((d) => log[d] || 0).filter((v) => v > 0);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    } catch { return 0; }
  };

  // Actual weekly averages for radar
  const loggedDays = chartData.filter((d) => d.cal > 0);
  const radarActual = {
    calories: loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.cal, 0) / loggedDays.length) : 0,
    protein: loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.protein, 0) / loggedDays.length) : 0,
    carbs: loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.carbs, 0) / loggedDays.length) : 0,
    fats: loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.fats, 0) / loggedDays.length) : 0,
    hydration: getHydration(),
  };

  const uniqueDays = new Set(meals.map((m) => m.date)).size;
  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const avgCalories = uniqueDays ? Math.round(totalCalories / uniqueDays) : 0;

  const calcRecommendedCal = () => {
    if (!user?.weight_kg) return null;
    const base = user.weight_kg * 22 * (
      user.activity_level === "sedentary" ? 1.2 :
      user.activity_level === "lightly_active" ? 1.375 :
      user.activity_level === "moderately_active" ? 1.55 :
      user.activity_level === "very_active" ? 1.725 : 1.9
    );
    if (user.goal_weight_kg && user.goal_weight_kg < user.weight_kg) return Math.round(base - 300);
    if (user.goal_weight_kg && user.goal_weight_kg > user.weight_kg) return Math.round(base + 250);
    return Math.round(base);
  };
  const recommendedCal = calcRecommendedCal();

  const toggleReminder = (id) =>
    setReminders((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, active: !r.active } : r);
      localStorage.setItem(MEAL_REMINDERS_KEY, JSON.stringify(next.map(({ id, active }) => ({ id, active }))));
      return next;
    });

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
      <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Weight & Stats</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">{user?.weight_kg ? `${user.weight_kg} kg` : "—"}</p>
            <p className="text-xs text-white/40 mt-0.5 leading-tight">Current Weight</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/60">{user?.goal_weight_kg ? `${user.goal_weight_kg} kg` : "—"}</p>
            <p className="text-xs text-white/40 mt-0.5 leading-tight">Goal Weight</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-yellow-400">{avgCalories ? `${avgCalories}` : "—"}</p>
            <p className="text-xs text-white/40 mt-0.5 leading-tight">Avg kcal/day</p>
          </div>
        </div>
        {recommendedCal && (
          <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-green-400/70">Recommended daily calories</p>
            <p className="text-sm font-bold text-green-400">{recommendedCal} kcal</p>
          </div>
        )}
      </div>

      {/* Nutrition Radar Chart */}
      <NutritionRadarChart actual={radarActual} user={user} />

      {/* Meal Reminders */}
      <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Meal Reminders</p>
        </div>
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className={`text-sm ${r.active ? "text-white" : "text-white/40"}`}>{r.label}</p>
                <p className="text-xs text-white/30">{r.time}</p>
              </div>
              <button
                onClick={() => toggleReminder(r.id)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${r.active ? "bg-green-500" : "bg-white/10"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${r.active ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Photos */}
      <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-green-400" />
            <p className="text-sm font-semibold text-white">Progress Photos</p>
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/15 text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Add Photo"}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        {progressPhotos.length === 0 ? (
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full aspect-[3/1] rounded-xl bg-white/3 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Image className="w-8 h-8 text-white/15" />
            <p className="text-xs text-white/25">Upload your first progress photo</p>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {progressPhotos.map((p, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                <img src={p.url} alt="Progress" className="w-full h-full object-cover" />
                <button
                  onClick={() => deletePhoto(i)}
                  className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <p className="absolute bottom-0 left-0 right-0 text-[9px] text-white bg-black/50 text-center py-0.5">
                  {format(new Date(p.date), "MMM d")}
                </p>
              </div>
            ))}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="aspect-square rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center hover:bg-white/8 transition-colors"
            >
              <Plus className="w-5 h-5 text-white/30" />
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
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
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-white/25 outline-none focus:border-green-500/40 text-white"
          />
          <button
            onClick={addNote}
            className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors"
          >
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
              <button
                onClick={() => deleteNote(n.id)}
                className="p-1 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}