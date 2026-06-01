import { useState } from "react";
import { format, startOfWeek, addDays, isToday, subWeeks, addWeeks } from "date-fns";
import { Dumbbell, Clock, Calendar, ChevronLeft, ChevronRight, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import MuscleMap from "@/components/fitness/MuscleMap";

function StatPill({ label, value, color }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
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

  // BMI calculation
  const bmi = user?.height_cm && user?.weight_kg
    ? (user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Workouts" value={workouts.length} color="text-blue-400" />
        <StatPill label="Sets Done" value={totalSets} color="text-blue-300" />
        <StatPill label="Avg min" value={avgDuration} color="text-blue-200" />
      </div>

      {/* Weekly Calendar */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-semibold text-white">
              {format(monday, "MMM d")} – {format(addDays(monday, 6), "MMM d")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(wo => wo - 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-blue-400 px-2 hover:underline">Today</button>
            )}
            <button onClick={() => setWeekOffset(wo => wo + 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
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
                className="flex flex-col items-center gap-1 group"
              >
                <span className="text-xs text-white/30">{d}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected ? "ring-2 ring-white/50 scale-110"
                  : "hover:scale-105"
                } ${
                  hasWorkout ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : today ? "border-2 border-blue-500 text-blue-400"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}>
                  {hasWorkout ? "✓" : format(date, "d")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="mt-3 pt-3 border-t border-white/8">
            <p className="text-xs font-semibold text-white/50 mb-2">{format(selectedDay, "EEEE, MMM d")}</p>
            {selectedWorkouts.length === 0 ? (
              <p className="text-xs text-white/25 italic">No workout logged this day</p>
            ) : selectedWorkouts.map((w, i) => (
              <div key={i} className="space-y-1">
                {w.exercises?.slice(0, 3).map((ex, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-xs text-white/70">{ex.exercise_name}</span>
                    <span className="text-xs text-blue-400">{ex.sets?.filter(s => s.completed).length || 0} sets</span>
                  </div>
                ))}
                {(w.exercises?.length || 0) > 3 && (
                  <p className="text-xs text-white/30">+{w.exercises.length - 3} more exercises</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration Chart */}
      {chartData.length > 1 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-3">Workout Duration</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} unit="m" width={28} />
              <Tooltip formatter={(v) => [`${v} min`]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="min" fill="#3b82f6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Muscle Map */}
      <MuscleMap workouts={workouts} />

      {/* Personal Measures from onboarding */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">Personal Measures</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Age", value: user?.age ? `${user.age} yrs` : "—", color: "text-blue-300" },
            { label: "Height", value: user?.height_cm ? `${user.height_cm} cm` : "—", color: "text-blue-300" },
            { label: "Weight", value: user?.weight_kg ? `${user.weight_kg} kg` : "—", color: "text-green-400" },
            { label: "BMI", value: bmi || "—", color: "text-yellow-400" },
            { label: "Activity Level", value: user?.activity_level ? user.activity_level.replace(/_/g, " ") : "—", color: "text-purple-400" },
            { label: "Goal Weight", value: user?.goal_weight_kg ? `${user.goal_weight_kg} kg` : "—", color: "text-orange-400" },
          ].map((m) => (
            <div key={m.label} className="bg-white/5 rounded-xl px-3 py-2.5">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`text-sm font-semibold mt-0.5 capitalize ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
        {user?.fitness_goals?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-white/40 mb-2">Fitness Goals</p>
            <div className="flex flex-wrap gap-1.5">
              {user.fitness_goals.map((g) => (
                <span key={g} className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  {GOAL_LABELS[g] || g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}