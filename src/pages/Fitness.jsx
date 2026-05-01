import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, Clock, Flame } from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import ActivityForm from "@/components/fitness/ActivityForm";
import ActivityCard from "@/components/fitness/ActivityCard";
import EmptyState from "@/components/shared/EmptyState";
import StatCard from "@/components/shared/StatCard";

export default function Fitness() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["fitness"],
    queryFn: () => base44.entities.FitnessActivity.list("-date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FitnessActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] });
      queryClient.invalidateQueries({ queryKey: ["fitness-home"] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FitnessActivity.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] });
      queryClient.invalidateQueries({ queryKey: ["fitness-home"] });
    },
  });

  const todayActivities = activities.filter((a) => a.date === today);
  const totalMinutes = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const totalCalories = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Fitness</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your workouts and activities</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Log Activity
        </Button>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Workouts Today" value={todayActivities.length} icon={Dumbbell} color="primary" />
        <StatCard title="Total Minutes" value={totalMinutes} icon={Clock} color="accent" />
        <StatCard title="Calories Burned" value={totalCalories} icon={Flame} color="chart3" />
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <ActivityForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Activity History</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No activities yet"
            description="Start logging your workouts to see them here."
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}