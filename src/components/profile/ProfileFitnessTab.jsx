import { format, startOfWeek, addDays, isToday } from "date-fns";
import { Dumbbell, Clock, Zap, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function StatPill({ label, value, color }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}

export default function ProfileFitnessTab({ workouts = [] }) {
  const totalSets = workouts.reduce(
    (a, w) => a + (w.exercises?.reduce((b, ex) => b + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0), 0
  );
  const avgDuration = workouts.length
    ? Math.round(workouts.reduce((a, w) => a + (w.duration_seconds || 0), 0) / workouts.length / 60)
    : 0;

  // Weekly calendar
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const workoutDates = new Set(workouts.map(w => w.date));

  // Chart: last 6 workouts
  const chartData = workouts.slice(0, 6).reverse().map((w, i) => ({
    name: w.date ? format(new Date(w.date), "MMM d") : `W${i + 1}`,
    min: Math.round((w.duration_seconds || 0) / 60),
  }));

  // Most trained exercise
  const exerciseCounts = {};
  workouts.forEach(w => w.exercises?.forEach(ex => {
    exerciseCounts[ex.exercise_name] = (exerciseCounts[ex.exercise_name] || 0) + 1;
  }));
  const topExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">This Week</p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {["M","T","W","T","F","S","S"].map((d, i) => {
            const date = weekDays[i];
            const dateStr = format(date, "yyyy-MM-dd");
            const hasWorkout = workoutDates.has(dateStr);
            const today = isToday(date);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs text-white/30">{d}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  hasWorkout ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : today ? "border-2 border-blue-500 text-blue-400"
                  : "bg-white/5 text-white/20"
                }`}>
                  {hasWorkout ? "✓" : format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Top Exercises */}
      {topExercises.length > 0 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-semibold text-white">Top Exercises</p>
          </div>
          <div className="space-y-2">
            {topExercises.map(([name, count], i) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 w-4">{i + 1}</span>
                  <span className="text-sm text-white">{name}</span>
                </div>
                <span className="text-xs text-blue-400 font-semibold">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Measures */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <p className="text-sm font-semibold text-white mb-3">Personal Measures</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Height", placeholder: "— cm" },
            { label: "Weight", placeholder: "— kg" },
            { label: "Body Fat", placeholder: "— %" },
            { label: "Muscle Mass", placeholder: "— kg" },
          ].map((m) => (
            <div key={m.label} className="bg-white/5 rounded-xl px-3 py-2.5">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className="text-sm font-semibold text-white/50 mt-0.5">{m.placeholder}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/25 text-center mt-3">Tap to edit measures (coming soon)</p>
      </div>
    </div>
  );
}