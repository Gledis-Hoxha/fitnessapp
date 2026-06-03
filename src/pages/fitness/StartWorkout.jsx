import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Plus, XCircle, ArrowLeft, BookMarked, Dumbbell, CheckCircle2 } from "lucide-react";
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
        gifUrl: e.gifUrl || null,
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
            gifUrl: added.gifUrl || null,
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

  const handleDiscard = () => navigate("/fitness");

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

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const completedSets = exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0);

  return (
    <>
      <WorkoutTimer startedAt={startedAt.current} onFinish={handleFinish} />

      <div className="pt-14 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-2 rounded-xl hover:bg-white/8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-white">Active Workout</h1>
              <p className="text-xs text-white/35">{format(new Date(), "EEEE, MMMM d")}</p>
            </div>
          </div>
          {/* Progress pill */}
          {totalSets > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">{completedSets}/{totalSets}</span>
            </div>
          )}
        </div>

        {/* Exercises */}
        <AnimatePresence mode="popLayout">
          {exercises.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/8 flex items-center justify-center">
                <Dumbbell className="w-9 h-9 text-white/20" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white/50">No exercises yet</p>
                <p className="text-sm text-white/25 mt-1">Tap "Add Exercise" to get started</p>
              </div>
            </motion.div>
          )}

          {exercises.map((ex) => (
            <motion.div
              key={ex.exercise_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
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
        <div className="space-y-2.5 pt-1">
          {/* Add Exercise — primary CTA */}
          <button
            onClick={() => navigate("/fitness/exercise-picker", { state: { returnTo: "/fitness/start-workout" } })}
            className="w-full flex items-center justify-center gap-2.5 h-13 py-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-400 font-semibold text-sm hover:bg-blue-500/22 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Save as Routine */}
            <button
              onClick={() => setShowRoutineModal(true)}
              disabled={exercises.length === 0}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-white/6 border border-white/10 text-white/50 font-medium text-sm hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <BookMarked className="w-4 h-4" />
              {routineSaved ? "Saved ✓" : "Save Routine"}
            </button>

            {/* End Workout */}
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/15 transition-all active:scale-[0.98]"
            >
              <XCircle className="w-4 h-4" />
              End Workout
            </button>
          </div>
        </div>
      </div>

      {/* Save as Routine Modal */}
      <AnimatePresence>
        {showRoutineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowRoutineModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center mx-auto mb-3">
                  <BookMarked className="w-6 h-6 text-white/60" />
                </div>
                <h2 className="font-bold text-lg text-white">Save as Routine</h2>
                <p className="text-sm text-white/40 mt-1">Give this workout a name to reuse it later.</p>
              </div>
              <Input
                placeholder="e.g. Push Day, Leg Day, Full Body..."
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="h-12 bg-white/8 border-white/15 text-white placeholder:text-white/30"
                autoFocus
              />
              <button
                onClick={handleSaveRoutine}
                disabled={!routineName.trim()}
                className="w-full h-12 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                Save Routine
              </button>
              <button
                onClick={() => setShowRoutineModal(false)}
                className="w-full text-sm text-white/30 hover:text-white/60 text-center py-1 transition-colors"
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-3 shadow-2xl"
            >
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="font-bold text-lg text-white">End Workout?</h2>
                <p className="text-sm text-white/40 mt-1">
                  {completedSets > 0
                    ? `You completed ${completedSets} set${completedSets !== 1 ? "s" : ""}. Great work!`
                    : "Choose to save or discard this session."}
                </p>
              </div>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? "Saving..." : "Save Workout"}
              </button>
              <button
                onClick={handleDiscard}
                className="w-full h-12 rounded-xl bg-white/6 border border-white/10 text-red-400 font-medium text-sm hover:bg-red-500/10 transition-colors"
              >
                Discard Workout
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full text-sm text-white/30 hover:text-white/60 text-center py-1 transition-colors"
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