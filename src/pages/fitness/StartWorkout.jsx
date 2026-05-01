import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, XCircle, ArrowLeft, BookMarked } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import WorkoutTimer from "@/components/fitness/WorkoutTimer";
import ExerciseBlock from "@/components/fitness/ExerciseBlock";

export default function StartWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const startedAt = useRef(new Date().toISOString());

  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [routineSaved, setRoutineSaved] = useState(false);

  // Pre-load exercises from a routine
  useEffect(() => {
    const routineExercises = location.state?.routineExercises;
    if (routineExercises?.length) {
      setExercises(routineExercises.map((e) => ({
        exercise_id: e.exercise_id,
        name: e.exercise_name,
        muscle: e.muscle,
        emoji: e.emoji,
        sets: e.sets?.map((s) => ({ ...s, completed: false })) || [{ set_number: 1, weight_kg: 0, reps: 0, completed: false }],
      })));
      window.history.replaceState({}, "");
    }
  }, []);

  // When returning from ExercisePicker with an added exercise
  useEffect(() => {
    const added = location.state?.addedExercise;
    if (added) {
      setExercises((prev) => {
        if (prev.find((e) => e.exercise_id === added.id)) return prev;
        return [
          ...prev,
          {
            exercise_id: added.id,
            name: added.name,
            muscle: added.muscle,
            emoji: added.emoji,
            sets: [{ set_number: 1, weight_kg: 0, reps: 0, completed: false }],
          },
        ];
      });
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const updateExercise = (exerciseId, updated) => {
    setExercises((prev) => prev.map((e) => (e.exercise_id === exerciseId ? updated : e)));
  };

  const removeExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((e) => e.exercise_id !== exerciseId));
  };

  const handleFinish = async () => {
    setSaving(true);
    const endedAt = new Date().toISOString();
    const durationSeconds = Math.floor((new Date(endedAt) - new Date(startedAt.current)) / 1000);

    await base44.entities.Workout.create({
      status: "completed",
      started_at: startedAt.current,
      ended_at: endedAt,
      duration_seconds: durationSeconds,
      date: format(new Date(), "yyyy-MM-dd"),
      exercises: exercises.map((e) => ({
        exercise_id: e.exercise_id,
        exercise_name: e.name,
        sets: e.sets,
      })),
    });

    navigate("/fitness");
  };

  const handleDiscard = async () => {
    navigate("/fitness");
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim() || exercises.length === 0) return;
    await base44.entities.Routine.create({
      name: routineName.trim(),
      exercises: exercises.map((e) => ({
        exercise_id: e.exercise_id,
        exercise_name: e.name,
        emoji: e.emoji,
        muscle: e.muscle,
        sets: e.sets.map((s) => ({ ...s, completed: false })),
      })),
    });
    setRoutineSaved(true);
    setShowRoutineModal(false);
    setRoutineName("");
  };

  return (
    <>
      <WorkoutTimer startedAt={startedAt.current} onFinish={handleFinish} />

      <div className="pt-14 space-y-5">
        {/* Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEndConfirm(true)}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">Active Workout</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
        </div>

        {/* Exercises */}
        <AnimatePresence>
          {exercises.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-secondary rounded-2xl p-8 text-center"
            >
              <p className="text-3xl mb-2">🏋️</p>
              <p className="font-medium text-foreground">No exercises yet</p>
              <p className="text-sm text-muted-foreground mt-1">Tap "Add Exercise" to get started</p>
            </motion.div>
          )}
          {exercises.map((ex) => (
            <motion.div
              key={ex.exercise_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ExerciseBlock
                exercise={ex}
                onChange={(updated) => updateExercise(ex.exercise_id, updated)}
                onRemove={removeExercise}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() =>
              navigate("/fitness/exercise-picker", {
                state: { returnTo: "/fitness/start-workout" },
              })
            }
            variant="outline"
            className="w-full gap-2 h-12 border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </Button>

          <Button
            onClick={() => setShowRoutineModal(true)}
            variant="outline"
            disabled={exercises.length === 0}
            className="w-full gap-2 h-12"
          >
            <BookMarked className="w-5 h-5" />
            {routineSaved ? "Routine Saved ✓" : "Save as Routine"}
          </Button>

          <Button
            onClick={() => setShowEndConfirm(true)}
            variant="ghost"
            className="w-full gap-2 h-12 text-destructive hover:text-destructive hover:bg-destructive/5"
          >
            <XCircle className="w-5 h-5" />
            End Workout
          </Button>
        </div>
      </div>

      {/* Save as Routine Modal */}
      <AnimatePresence>
        {showRoutineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="bg-card rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <p className="text-2xl mb-2">📋</p>
                <h2 className="font-bold text-lg">Save as Routine</h2>
                <p className="text-sm text-muted-foreground mt-1">Give this workout a name to reuse it later.</p>
              </div>
              <Input
                placeholder="e.g. Push Day, Leg Day..."
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="h-12"
                autoFocus
              />
              <Button onClick={handleSaveRoutine} disabled={!routineName.trim()} className="w-full h-12">
                Save Routine
              </Button>
              <button
                onClick={() => setShowRoutineModal(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-1"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Confirm Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="bg-card rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <p className="text-2xl mb-2">🏁</p>
                <h2 className="font-bold text-lg">End Workout?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose to save or discard this workout session.
                </p>
              </div>
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="w-full h-12"
              >
                {saving ? "Saving..." : "Save Workout ✓"}
              </Button>
              <Button
                onClick={handleDiscard}
                variant="outline"
                className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                Discard Workout
              </Button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-1"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}