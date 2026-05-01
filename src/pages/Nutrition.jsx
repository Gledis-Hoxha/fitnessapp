import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Apple, Flame, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import MealForm from "@/components/nutrition/MealForm";
import MealCard from "@/components/nutrition/MealCard";
import EmptyState from "@/components/shared/EmptyState";
import StatCard from "@/components/shared/StatCard";

export default function Nutrition() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NutritionEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-home"] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutritionEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-home"] });
    },
  });

  const todayMeals = meals.filter((m) => m.date === today);
  const totalCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Nutrition</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your meals and macros</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Log Meal
        </Button>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Meals Today" value={todayMeals.length} icon={Apple} color="primary" />
        <StatCard title="Calories" value={totalCalories} icon={Flame} color="accent" />
        <StatCard title="Protein" value={`${totalProtein}g`} icon={TrendingUp} color="chart4" />
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <MealForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Meal History</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : meals.length === 0 ? (
          <EmptyState
            icon={Apple}
            title="No meals logged yet"
            description="Start tracking your nutrition to see your meals here."
          />
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}