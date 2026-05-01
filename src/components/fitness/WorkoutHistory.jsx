import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Clock, Dumbbell, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function WorkoutCard({ workout }) {
  const [open, setOpen] = useState(false);
  const totalSets = workout.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0;
  const completedSets = workout.exercises?.reduce(
    (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length || 0), 0
  ) || 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="p-2 rounded-xl bg-primary/10">
          <Dumbbell className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {workout.exercises?.map((e) => e.exercise_name).join(", ") || "Workout"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {workout.date ? format(new Date(workout.date), "MMM d, yyyy") : ""}
            {" · "}{workout.exercises?.length || 0} exercises · {completedSets}/{totalSets} sets done
          </p>
        </div>
        <div className="flex items-center gap-3 text-right shrink-0">
          <div>
            <p className="text-xs font-semibold text-foreground">{formatDuration(workout.duration_seconds)}</p>
            <p className="text-xs text-muted-foreground">duration</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {workout.exercises?.map((ex, i) => (
            <div key={i}>
              <p className="text-xs font-semibold mb-1">{ex.emoji || "💪"} {ex.exercise_name}</p>
              <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground mb-1 px-1">
                <span>Set</span><span>Weight</span><span>Reps</span>
              </div>
              {ex.sets?.map((set, j) => (
                <div key={j} className={`grid grid-cols-3 gap-1 text-xs px-1 py-0.5 rounded ${set.completed ? "text-primary font-medium" : "text-foreground"}`}>
                  <span>{set.set_number}</span>
                  <span>{set.weight_kg || 0} kg</span>
                  <span>{set.reps || 0} reps</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkoutHistory() {
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 20),
  });

  // Chart data: last 7 workouts duration in minutes
  const chartData = workouts.slice(0, 7).reverse().map((w, i) => ({
    name: w.date ? format(new Date(w.date), "MMM d") : `W${i + 1}`,
    minutes: Math.round((w.duration_seconds || 0) / 60),
    sets: w.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0,
  }));

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (workouts.length === 0) return (
    <div className="bg-card rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">
      Complete your first workout to see your history here.
    </div>
  );

  const avgDuration = Math.round(workouts.reduce((a, w) => a + (w.duration_seconds || 0), 0) / workouts.length / 60);
  const totalWorkouts = workouts.length;
  const totalSetsCompleted = workouts.reduce((a, w) =>
    a + (w.exercises?.reduce((b, ex) => b + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Analytics summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Workouts", value: totalWorkouts, icon: "🏋️" },
          { label: "Avg Duration", value: `${avgDuration}m`, icon: "⏱️" },
          { label: "Sets Completed", value: totalSetsCompleted, icon: "✅" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl">{s.icon}</p>
            <p className="font-bold text-lg mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      {chartData.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Workout Duration Progress</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="m" width={32} />
              <Tooltip formatter={(v) => [`${v} min`, "Duration"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Workout cards */}
      <div className="space-y-2">
        {workouts.map((w) => (
          <WorkoutCard key={w.id} workout={w} />
        ))}
      </div>
    </div>
  );
}