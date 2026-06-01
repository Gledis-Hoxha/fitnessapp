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
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/30 transition-colors"
      >
        <Dumbbell className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs text-foreground truncate">
            {workout.exercises?.map((e) => e.exercise_name).join(", ") || "Workout"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {workout.date ? format(new Date(workout.date), "MMM d") : ""}
            {" · "}{workout.exercises?.length || 0} ex · {completedSets}/{totalSets} sets
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <p className="text-xs font-semibold text-foreground">{formatDuration(workout.duration_seconds)}</p>
          {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-2">
          {workout.exercises?.map((ex, i) => (
            <div key={i}>
              <p className="text-xs font-semibold mb-1">{ex.emoji || "💪"} {ex.exercise_name}</p>
              {ex.sets?.map((set, j) => (
                <div key={j} className={`grid grid-cols-3 gap-1 text-xs px-1 py-0.5 rounded ${set.completed ? "text-primary font-medium" : "text-foreground/60"}`}>
                  <span>#{set.set_number}</span>
                  <span>{set.weight_kg || 0}kg</span>
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
    <div className="space-y-2">
      {/* Compact analytics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Workouts", value: totalWorkouts },
          { label: "Avg", value: `${avgDuration}m` },
          { label: "Sets", value: totalSetsCompleted },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-3 py-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-bold text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Workout cards */}
      <div className="space-y-1.5">
        {workouts.map((w) => (
          <WorkoutCard key={w.id} workout={w} />
        ))}
      </div>
    </div>
  );
}