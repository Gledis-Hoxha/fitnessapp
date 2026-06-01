import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExerciseDetailModal({ exercise, onAdd, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white capitalize truncate pr-2">{exercise.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {exercise.gifUrl && (
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-40 object-contain rounded-xl bg-white/5 mb-4"
          />
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: exercise.bodyPart, color: "bg-blue-500/15 text-blue-400" },
            { label: exercise.muscle, color: "bg-green-500/15 text-green-400" },
            { label: exercise.equipment, color: "bg-orange-500/15 text-orange-400" },
          ].map((tag) => (
            <span key={tag.label} className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${tag.color}`}>
              {tag.label}
            </span>
          ))}
        </div>

        {exercise.secondaryMuscles?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-1.5">Secondary muscles</p>
            <div className="flex flex-wrap gap-1.5">
              {exercise.secondaryMuscles.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-lg text-xs bg-white/6 text-white/50 capitalize">{m}</span>
              ))}
            </div>
          </div>
        )}

        {exercise.instructions?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-white/40 mb-2">Instructions</p>
            <ol className="space-y-1.5">
              {exercise.instructions.slice(0, 4).map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/60">
                  <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <Button
          onClick={() => { onAdd(exercise); onClose(); }}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to Workout
        </Button>
      </motion.div>
    </motion.div>
  );
}