import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export default function ExerciseBlock({ exercise, onChange, onRemove }) {
  const [showGif, setShowGif] = useState(false);
  const previousExerciseRef = useRef(null);

  const toggleMutation = useMutation({
    mutationFn: async ({ setIdx }) => {
      // Optimistically already applied; this is a no-op placeholder
      // Actual persistence happens when the workout is saved
      return { setIdx, completed: !exercise.sets[setIdx].completed };
    },
    onMutate: async ({ setIdx }) => {
      previousExerciseRef.current = JSON.parse(JSON.stringify(exercise));
      const newSets = exercise.sets.map((s, i) =>
      i === setIdx ? { ...s, completed: !s.completed } : s
      );
      onChange({ ...exercise, sets: newSets });
    },
    onError: () => {
      if (previousExerciseRef.current) {
        onChange(previousExerciseRef.current);
      }
    }
  });

  const updateSet = (setIdx, field, value) => {
    const newSets = exercise.sets.map((s, i) =>
    i === setIdx ? { ...s, [field]: value } : s
    );
    onChange({ ...exercise, sets: newSets });
  };

  const toggleComplete = (setIdx) => {
    toggleMutation.mutate({ setIdx });
  };

  const duplicateSet = (setIdx) => {
    const original = exercise.sets[setIdx];
    const newSet = { ...original, completed: false, set_number: exercise.sets.length + 1 };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setIdx) => {
    const newSets = exercise.sets.
    filter((_, i) => i !== setIdx).
    map((s, i) => ({ ...s, set_number: i + 1 }));
    onChange({ ...exercise, sets: newSets });
  };

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      set_number: exercise.sets.length + 1,
      weight_kg: last?.weight_kg || 0,
      reps: last?.reps || 0,
      completed: false
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <div className="bg-[#141416] border border-white/10 rounded-2xl overflow-hidden">
      {/* Exercise Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
        {/* GIF thumbnail toggle */}
        <button
          onClick={() => setShowGif((v) => !v)}
          className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
          title={showGif ? "Hide GIF" : "Show exercise GIF"}>
          
          {exercise.gifUrl ?
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-full object-cover" /> :


          <span className="text-xl">{exercise.emoji || "🏋️"}</span>
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm capitalize truncate">{exercise.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-white/40 capitalize">{exercise.muscle}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className={cn(
              "text-xs font-semibold",
              completedCount === totalSets ? "text-green-400" : "text-white/35"
            )}>
              {completedCount}/{totalSets} sets
            </span>
          </div>
        </div>

        {exercise.gifUrl &&
        <button
          onClick={() => setShowGif((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
          
            {showGif ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        }

        <button
          onClick={() => onRemove(exercise.exercise_id)}
          className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-white/25 transition-colors flex-shrink-0">
          
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable GIF */}
      {showGif && exercise.gifUrl &&
      <div className="flex justify-center py-4 px-4 bg-white/3 border-b border-white/8">
          <img
          src={exercise.gifUrl}
          alt={exercise.name}
          className="h-44 rounded-xl object-contain" />
        
        </div>
      }

      {/* Sets Table Header */}
      <div className="grid grid-cols-[32px_1fr_1fr_36px_40px_28px] gap-2 px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/6">
        <span>#</span>
        <span>KG</span>
        <span>Reps</span>
        <span></span>
        <span className="text-center">✓</span>
        <span></span>
      </div>

      {/* Sets */}
      <div className="divide-y divide-white/5">
        {exercise.sets.map((set, i) =>
        <div
          key={i}
          className={cn(
            "grid grid-cols-[32px_1fr_1fr_36px_40px_28px] gap-2 items-center px-4 py-2.5 transition-colors",
            set.completed ? "bg-green-500/5" : ""
          )}>
          
            <span className={cn(
            "text-xs font-bold",
            set.completed ? "text-green-400" : "text-white/25"
          )}>
              {set.set_number}
            </span>
            <Input
            type="number"
            value={set.weight_kg || ""}
            onChange={(e) => updateSet(i, "weight_kg", Number(e.target.value))}
            placeholder="0"
            className="h-8 text-center text-sm px-1 border-white/10 text-gray-50 bg-[#2d2a38]" />
          
            <Input
            type="number"
            value={set.reps || ""}
            onChange={(e) => updateSet(i, "reps", Number(e.target.value))}
            placeholder="0"
            className="h-8 text-center text-sm px-1 bg-white/6 border-white/10 text-[#070708]" />
          
            <button
            onClick={() => duplicateSet(i)}
            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/25 hover:text-white/60"
            title="Duplicate set">
            
              <Copy className="w-3 h-3" />
            </button>
            <button
            onClick={() => toggleComplete(i)}
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg border-2 transition-all duration-200 mx-auto",
              set.completed ?
              "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25" :
              "border-white/15 hover:border-green-500/50"
            )}>
            
              <Check className="w-3.5 h-3.5" />
            </button>
            {exercise.sets.length > 1 ?
          <button
            onClick={() => removeSet(i)}
            className="flex items-center justify-center p-1 rounded hover:text-red-400 transition-colors text-white/15">
            
                <Trash2 className="w-3 h-3" />
              </button> :
          <span />}
          </div>
        )}
      </div>

      {/* Add Set */}
      <div className="px-4 py-3">
        <button
          onClick={addSet}
          className="w-full text-xs font-semibold text-white/35 hover:text-white/60 py-2 border border-dashed border-white/10 hover:border-white/20 rounded-xl transition-colors">
          
          + Add Set
        </button>
      </div>
    </div>);

}