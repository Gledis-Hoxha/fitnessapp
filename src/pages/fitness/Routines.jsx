import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { app } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import WeeklyPlanner from "@/components/fitness/WeeklyPlanner";

export default function Routines() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ["routines"],
    queryFn: () => app.entities.Routine.list("-created_date", 50)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => app.entities.Routine.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routines"] })
  });

  const handleStart = (routine) => {
    // Navigate to start-workout with routine exercises pre-loaded
    navigate("/fitness/start-workout", { state: { routineExercises: routine.exercises } });
  };

  return (
    <div className="space-y-6">
      







      

      <WeeklyPlanner routines={routines} />

      {isLoading ?
      <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div> :
      routines.length === 0 ?
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No routines yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start a workout and tap <strong>"Save as Routine"</strong> to create one.
          </p>
        </div> :

      <div className="space-y-3">
          {routines.map((routine, i) =>
        <motion.div
          key={routine.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-card border border-border rounded-2xl p-4">
          
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{routine.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {routine.exercises?.map((e) => e.exercise_name).join(" · ") || "No exercises"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {routine.exercises?.length || 0} exercises ·{" "}
                    {routine.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) || 0} sets
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                onClick={() => deleteMutation.mutate(routine.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button size="sm" onClick={() => handleStart(routine)} className="gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    Start
                  </Button>
                </div>
              </div>
            </motion.div>
        )}
        </div>
      }
    </div>);

}