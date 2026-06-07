import { Trophy } from "lucide-react";
import { useMemo } from "react";

const ACHIEVEMENTS = [
{ id: "first_workout", emoji: "🏋️", label: "First Workout", desc: "Complete your first workout", condition: (w) => w.length >= 1 },
{ id: "five_workouts", emoji: "🔥", label: "On Fire", desc: "Complete 5 workouts", condition: (w) => w.length >= 5 },
{ id: "ten_workouts", emoji: "💪", label: "Dedicated", desc: "Complete 10 workouts", condition: (w) => w.length >= 10 },
{ id: "twenty_five", emoji: "⚡", label: "Beast Mode", desc: "Complete 25 workouts", condition: (w) => w.length >= 25 },
{ id: "fifty_workouts", emoji: "🏆", label: "Elite", desc: "Complete 50 workouts", condition: (w) => w.length >= 50 },
{ id: "hundred_sets", emoji: "🎯", label: "Set Crusher", desc: "Complete 100 sets total", condition: (w) => {
    const sets = w.reduce((a, wk) => a + (wk.exercises?.reduce((b, ex) => b + (ex.sets?.filter((s) => s.completed).length || 0), 0) || 0), 0);
    return sets >= 100;
  } },
{ id: "thirty_min", emoji: "⏱️", label: "Endurance", desc: "Log a 30+ min workout", condition: (w) => w.some((wk) => (wk.duration_seconds || 0) >= 1800) },
{ id: "hour_workout", emoji: "🦁", label: "Iron Will", desc: "Log a 60+ min workout", condition: (w) => w.some((wk) => (wk.duration_seconds || 0) >= 3600) },
{ id: "five_exercises", emoji: "🧠", label: "Full Body", desc: "Log 5+ exercises in one workout", condition: (w) => w.some((wk) => (wk.exercises?.length || 0) >= 5) }];


export default function FitnessAchievements({ workouts = [] }) {
  const results = useMemo(() => ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.condition(workouts) })), [workouts]);
  const unlocked = results.filter((a) => a.unlocked);

  return null;










































}