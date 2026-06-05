import { useState } from "react";
import { format, startOfWeek, addDays, isToday, addWeeks } from "date-fns";
import { Dumbbell, Clock, Calendar, ChevronLeft, ChevronRight, User, Pencil, Check, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import MuscleMap from "@/components/fitness/MuscleMap";
import FitnessAchievements from "@/components/fitness/FitnessAchievements";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

function StatPill({ label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

const GOAL_LABELS = {
  lose_weight: "Lose Weight 🔥", build_muscle: "Build Muscle 💪",
  improve_endurance: "Endurance 🏃", stay_healthy: "Stay Healthy ❤️",
  increase_flexibility: "Flexibility 🧘", sport_performance: "Sport 🏆",
  stress_relief: "Stress Relief 😌", body_recomposition: "Recomposition ⚡",
};

export default function ProfileFitnessTab({ workouts = [], user }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingGoalWeight, setEditingGoalWeight] = useState(false);
  const [weightVal, setWeightVal] = useState(user?.weight_kg || "");
  const [goalWeightVal, setGoalWeightVal] = useState(user?.goal_weight_kg || "");

  const saveWeight = async () => {
    await base44.auth.updateMe({ weight_kg: Number(weightVal) || undefined });
    toast.success("Weight updated!");
    setEditingWeight(false);
  };

  const saveGoalWeight = async () => {
    await base44.auth.updateMe({ goal_weight_kg: Number(goalWeightVal) || undefined });
    toast.success("Goal weight updated!");
    setEditingGoalWeight(false);
  };

  const totalSets = workouts.reduce(
    (a, w) => a + (w.exercises?.reduce((b, ex) => b + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0), 0
  );
  const avgDuration = workouts.length
    ? Math.round(workouts.reduce((a, w) => a + (w.duration_seconds || 0), 0) / workouts.length / 60)
    : 0;

  const monday = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const workoutDates = new Set(workouts.map(w => w.date));

  const chartData = workouts.slice(0, 6).reverse().map((w, i) => ({
    name: w.date ? format(new Date(w.date), "MMM d") : `W${i + 1}`,
    min: Math.round((w.duration_seconds || 0) / 60),
  }));

  const selectedDateStr = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedWorkouts = selectedDateStr ? workouts.filter(w => w.date === selectedDateStr) : [];

  const bmi = user?.height_cm && user?.weight_kg
    ? (user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Workouts" value={workouts.length} color="text-primary" />
        <StatPill label="Sets Done" value={totalSets} color="text-blue-500" />
        <StatPill label="Avg min" value={avgDuration} color="text-accent" />
      </div>

      {/* Weekly Calendar */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              {format(monday, "MMM d")} – {format(addDays(monday, 6), "MMM d")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(wo => wo - 1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-primary px-2 hover:underline">Today</button>
            )}
            <button onClick={() => setWeekOffset(wo => wo + 1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {["M","T","W","T","F","S","S"].map((d, i) => {
            const date = weekDays[i];
            const dateStr = format(date, "yyyy-MM-dd");
            const hasWorkout = workoutDates.has(dateStr);
            const isSelected = selectedDay && format(selectedDay, "yyyy-MM-dd") === dateStr;
            const today = isToday(date);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : date)}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted-foreground">{d}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected ? "ring-2 ring-primary/50 scale-110" : "hover:scale-105"
                } ${
                  hasWorkout ? "bg-primary text-primary-foreground shadow-sm"
                  : today ? "border-2 border-primary text-primary"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}>
                  {hasWorkout ? "✓" : format(date, "d")}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">{format(selectedDay, "EEEE, MMM d")}</p>
            {selectedWorkouts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No workout logged this day</p>
            ) : selectedWorkouts.map((w, i) => (
              <div key={i} className="space-y-1">
                {w.exercises?.slice(0, 3).map((ex, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{ex.exercise_name}</span>
                    <span className="text-xs text-primary font-medium">{ex.sets?.filter(s => s.completed).length || 0} sets</span>
                  </div>
                ))}
                {(w.exercises?.length || 0) > 3 && (
                  <p className="text-xs text-muted-foreground">+{w.exercises.length - 3} more exercises</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration Chart */}
      {chartData.length > 1 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Workout Duration</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} unit="m" width={28} />
              <Tooltip formatter={(v) => [`${v} min`]} contentStyle={{ background: "#fff", border: "1px solid hsl(214,32%,91%)", borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="min" fill="hsl(221,83%,53%)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Muscle Map */}
      <MuscleMap workouts={workouts} />

      {/* Personal Measures */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Personal Measures</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Age", value: user?.age ? `${user.age} yrs` : "—", color: "text-primary" },
            { label: "Height", value: user?.height_cm ? `${user.height_cm} cm` : "—", color: "text-blue-500" },
            { label: "BMI", value: bmi || "—", color: "text-amber-500" },
            { label: "Activity Level", value: user?.activity_level ? user.activity_level.replace(/_/g, " ") : "—", color: "text-purple-500" },
          ].map((m) => (
            <div key={m.label} className="bg-secondary rounded-xl px-3 py-2.5">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-sm font-semibold mt-0.5 capitalize ${m.color}`}>{m.value}</p>
            </div>
          ))}

          {/* Editable: Weight */}
          <div className="bg-secondary rounded-xl px-3 py-2.5">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs text-muted-foreground">Weight</p>
              {!editingWeight ? (
                <button onClick={() => { setWeightVal(user?.weight_kg || ""); setEditingWeight(true); }} className="p-0.5 rounded hover:bg-border transition-colors">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={saveWeight} className="p-0.5 rounded hover:bg-green-100 transition-colors"><Check className="w-3 h-3 text-green-600" /></button>
                  <button onClick={() => setEditingWeight(false)} className="p-0.5 rounded hover:bg-red-100 transition-colors"><X className="w-3 h-3 text-red-500" /></button>
                </div>
              )}
            </div>
            {editingWeight ? (
              <input type="number" value={weightVal} onChange={(e) => setWeightVal(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                autoFocus onKeyDown={(e) => e.key === "Enter" && saveWeight()} />
            ) : (
              <p className="text-sm font-semibold text-green-600">{user?.weight_kg ? `${user.weight_kg} kg` : "—"}</p>
            )}
          </div>

          {/* Editable: Goal Weight */}
          <div className="bg-secondary rounded-xl px-3 py-2.5">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs text-muted-foreground">Goal Weight</p>
              {!editingGoalWeight ? (
                <button onClick={() => { setGoalWeightVal(user?.goal_weight_kg || ""); setEditingGoalWeight(true); }} className="p-0.5 rounded hover:bg-border transition-colors">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={saveGoalWeight} className="p-0.5 rounded hover:bg-green-100 transition-colors"><Check className="w-3 h-3 text-green-600" /></button>
                  <button onClick={() => setEditingGoalWeight(false)} className="p-0.5 rounded hover:bg-red-100 transition-colors"><X className="w-3 h-3 text-red-500" /></button>
                </div>
              )}
            </div>
            {editingGoalWeight ? (
              <input type="number" value={goalWeightVal} onChange={(e) => setGoalWeightVal(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                autoFocus onKeyDown={(e) => e.key === "Enter" && saveGoalWeight()} />
            ) : (
              <p className="text-sm font-semibold text-orange-500">{user?.goal_weight_kg ? `${user.goal_weight_kg} kg` : "—"}</p>
            )}
          </div>
        </div>

        {user?.fitness_goals?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Fitness Goals</p>
            <div className="flex flex-wrap gap-1.5">
              {user.fitness_goals.map((g) => (
                <span key={g} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                  {GOAL_LABELS[g] || g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <FitnessAchievements workouts={workouts} />
    </div>
  );
}