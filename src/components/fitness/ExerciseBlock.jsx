import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExerciseBlock({ exercise, onChange, onRemove }) {
  const updateSet = (setIdx, field, value) => {
    const newSets = exercise.sets.map((s, i) =>
      i === setIdx ? { ...s, [field]: value } : s
    );
    onChange({ ...exercise, sets: newSets });
  };

  const toggleComplete = (setIdx) => {
    updateSet(setIdx, "completed", !exercise.sets[setIdx].completed);
  };

  const duplicateSet = (setIdx) => {
    const original = exercise.sets[setIdx];
    const newSet = { ...original, completed: false, set_number: exercise.sets.length + 1 };
    const newSets = [...exercise.sets, newSet];
    onChange({ ...exercise, sets: newSets });
  };

  const removeSet = (setIdx) => {
    const newSets = exercise.sets
      .filter((_, i) => i !== setIdx)
      .map((s, i) => ({ ...s, set_number: i + 1 }));
    onChange({ ...exercise, sets: newSets });
  };

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      set_number: exercise.sets.length + 1,
      weight_kg: last?.weight_kg || 0,
      reps: last?.reps || 0,
      completed: false,
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Exercise Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">{exercise.emoji}</span>
          <div>
            <p className="font-semibold text-sm">{exercise.name}</p>
            <p className="text-xs text-muted-foreground">{exercise.muscle}</p>
          </div>
        </div>
        <button onClick={() => onRemove(exercise.exercise_id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sets Table Header */}
      <div className="grid grid-cols-[36px_1fr_1fr_1fr_44px_36px] gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
        <span>Set</span>
        <span>KG</span>
        <span>Reps</span>
        <span></span>
        <span className="text-center">Done</span>
        <span></span>
      </div>

      {/* Sets */}
      <div className="divide-y divide-border">
        {exercise.sets.map((set, i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-[36px_1fr_1fr_1fr_44px_36px] gap-2 items-center px-4 py-2.5 transition-colors",
              set.completed ? "bg-primary/5" : ""
            )}
          >
            <span className={cn("text-sm font-bold", set.completed ? "text-primary" : "text-muted-foreground")}>
              {set.set_number}
            </span>
            <Input
              type="number"
              value={set.weight_kg || ""}
              onChange={(e) => updateSet(i, "weight_kg", Number(e.target.value))}
              placeholder="0"
              className="h-8 text-center text-sm px-1"
            />
            <Input
              type="number"
              value={set.reps || ""}
              onChange={(e) => updateSet(i, "reps", Number(e.target.value))}
              placeholder="0"
              className="h-8 text-center text-sm px-1"
            />
            {/* Duplicate */}
            <button
              onClick={() => duplicateSet(i)}
              className="flex items-center justify-center p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Duplicate set"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {/* Check */}
            <button
              onClick={() => toggleComplete(i)}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg border-2 transition-all duration-200",
                set.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Check className="w-4 h-4" />
            </button>
            {/* Remove set */}
            {exercise.sets.length > 1 && (
              <button
                onClick={() => removeSet(i)}
                className="flex items-center justify-center p-1 rounded hover:text-destructive transition-colors text-muted-foreground/50"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {exercise.sets.length <= 1 && <span />}
          </div>
        ))}
      </div>

      {/* Add Set */}
      <div className="px-4 py-3">
        <button
          onClick={addSet}
          className="w-full text-xs font-medium text-primary hover:text-primary/80 py-1.5 border border-dashed border-primary/30 hover:border-primary/60 rounded-lg transition-colors"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
}