import { Trophy } from "lucide-react";
import { useMemo } from "react";

const ACHIEVEMENTS = [
  { id: "first_workout", emoji: "🏋️", label: "First Workout", desc: "Complete your first workout", condition: (w) => w.length >= 1 },
  { id: "five_workouts", emoji: "🔥", label: "On Fire", desc: "Complete 5 workouts", condition: (w) => w.length >= 5 },
  { id: "ten_workouts", emoji: "💪", label: "Dedicated", desc: "Complete 10 workouts", condition: (w) => w.length >= 10 },
  { id: "twenty_five", emoji: "⚡", label: "Beast Mode", desc: "Complete 25 workouts", condition: (w) => w.length >= 25 },
  { id: "fifty_workouts", emoji: "🏆", label: "Elite", desc: "Complete 50 workouts", condition: (w) => w.length >= 50 },
  { id: "hundred_sets", emoji: "🎯", label: "Set Crusher", desc: "Complete 100 sets total", condition: (w) => {
    const sets = w.reduce((a, wk) => a + (wk.exercises?.reduce((b, ex) => b + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0), 0);
    return sets >= 100;
  }},
  { id: "thirty_min", emoji: "⏱️", label: "Endurance", desc: "Log a 30+ min workout", condition: (w) => w.some(wk => (wk.duration_seconds || 0) >= 1800) },
  { id: "hour_workout", emoji: "🦁", label: "Iron Will", desc: "Log a 60+ min workout", condition: (w) => w.some(wk => (wk.duration_seconds || 0) >= 3600) },
  { id: "five_exercises", emoji: "🧠", label: "Full Body", desc: "Log 5+ exercises in one workout", condition: (w) => w.some(wk => (wk.exercises?.length || 0) >= 5) },
];

export default function FitnessAchievements({ workouts = [] }) {
  const results = useMemo(() => ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.condition(workouts) })), [workouts]);
  const unlocked = results.filter(a => a.unlocked);

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <p className="text-sm font-semibold text-white">Achievements</p>
        </div>
        <span className="text-xs text-yellow-400 font-semibold">{unlocked.length}/{ACHIEVEMENTS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/8 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {results.map((a) => (
          <div
            key={a.id}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              a.unlocked
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-white/3 border-white/5 opacity-35 grayscale"
            }`}
            title={a.desc}
          >
            <span className="text-2xl">{a.emoji}</span>
            <p className="text-[10px] text-center text-white/70 leading-tight font-medium">{a.label}</p>
            {a.unlocked && (
              <span className="text-[9px] text-yellow-400 font-semibold">Unlocked!</span>
            )}
          </div>
        ))}
      </div>

      {unlocked.length === 0 && (
        <p className="text-xs text-white/25 text-center mt-2">Complete workouts to unlock achievements</p>
      )}
    </div>
  );
}