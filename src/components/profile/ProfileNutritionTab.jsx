import { format, subDays } from "date-fns";
import { Scale, Bell, StickyNote, Image, Trash2, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const DEFAULT_REMINDERS = [
  { id: "breakfast", time: "8:00 AM", label: "Log Breakfast", active: true },
  { id: "lunch", time: "1:00 PM", label: "Log Lunch", active: true },
  { id: "dinner", time: "7:00 PM", label: "Log Dinner", active: false },
];

export default function ProfileNutritionTab({ meals = [], user }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState(DEFAULT_REMINDERS);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);

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
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">Weight & Stats</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-accent">{user?.weight_kg ? `${user.weight_kg} kg` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Current Weight</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-muted-foreground">{user?.goal_weight_kg ? `${user.goal_weight_kg} kg` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Goal Weight</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-500">{avgCalories ? `${avgCalories}` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Avg kcal/day</p>
          </div>
        </div>
        {recommendedCal && (
          <div className="mt-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-accent/80">Recommended daily calories</p>
            <p className="text-sm font-bold text-accent">{recommendedCal} kcal</p>
          </div>
        )}
      </div>

      {/* Calorie Trend */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">7-Day Calorie Trend</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} unit=" kcal" width={50} />
            <Tooltip formatter={(v) => [`${v} kcal`]} contentStyle={{ background: "#fff", border: "1px solid hsl(214,32%,91%)", borderRadius: 10, fontSize: 11 }} />
            <Line type="monotone" dataKey="cal" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={{ fill: "hsl(142,71%,45%)", r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Meal Reminders */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">Meal Reminders</p>
        </div>
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className={`text-sm ${r.active ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.time}</p>
              </div>
              <button
                onClick={() => toggleReminder(r.id)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${r.active ? "bg-accent" : "bg-secondary"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${r.active ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Photos */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Progress Photos</p>
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Add Photo"}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        {progressPhotos.length === 0 ? (
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full aspect-[3/1] rounded-xl bg-secondary border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <Image className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Upload your first progress photo</p>
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
              className="aspect-square rounded-xl bg-secondary border border-dashed border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">Notes</p>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Add a note..."
            className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary text-foreground"
          />
          <button
            onClick={addNote}
            className="px-4 py-2 rounded-xl bg-accent hover:opacity-90 text-accent-foreground text-sm font-semibold transition-opacity"
          >
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No notes yet</p>
          ) : notes.map((n) => (
            <div key={n.id} className="flex items-start gap-2 bg-secondary rounded-xl px-3 py-2 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(n.date), "MMM d, h:mm a")}</p>
              </div>
              <button
                onClick={() => deleteNote(n.id)}
                className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 mt-0.5 shrink-0"
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