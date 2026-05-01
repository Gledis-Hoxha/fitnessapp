import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";

const EXERCISES = [
  {
    id: "bench_press",
    name: "Bench Press",
    muscle: "Chest",
    emoji: "🏋️",
    description: "Classic chest compound movement",
  },
  {
    id: "squat",
    name: "Squat",
    muscle: "Legs",
    emoji: "🦵",
    description: "King of all lower body exercises",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscle: "Back & Legs",
    emoji: "💪",
    description: "Full body posterior chain builder",
  },
];

export default function ExercisePicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/fitness/start-workout";

  const handlePick = (exercise) => {
    navigate(returnTo, { state: { addedExercise: exercise } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold">Choose Exercise</h1>
          <p className="text-sm text-muted-foreground">Tap to add to your workout</p>
        </div>
      </div>

      <div className="space-y-3">
        {EXERCISES.map((ex, i) => (
          <motion.button
            key={ex.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => handlePick(ex)}
            className="w-full flex items-center gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] text-left"
          >
            <span className="text-3xl">{ex.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{ex.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ex.muscle} · {ex.description}</p>
            </div>
            <div className="p-2 rounded-xl bg-primary/10">
              <Plus className="w-4 h-4 text-primary" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}