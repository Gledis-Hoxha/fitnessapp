import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { X, Dumbbell, Apple, Bell, CheckCircle2, Flame, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function NotificationsModal({ onClose }) {
  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.filter({ status: "completed" }, "-date", 20),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => base44.entities.NutritionEntry.list("-date", 200),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["workout-reminders"],
    queryFn: () => base44.entities.WorkoutReminder.list("-created_date", 50),
  });

  const todayMeals = meals.filter((m) => m.date === today);
  const todayWorkout = workouts.find((w) => w.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const enabledReminders = reminders.filter((r) => r.enabled);

  const dayOfWeek = new Date().getDay();
  const todayReminders = enabledReminders.filter((r) => r.days?.includes(dayOfWeek));

  // Build smart notifications
  const notifications = [];

  if (!todayWorkout) {
    notifications.push({
      id: "no-workout",
      icon: Dumbbell,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      title: "No workout logged today",
      body: "Head to the Fitness tab to start a session.",
      type: "warning",
    });
  } else {
    notifications.push({
      id: "workout-done",
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      title: "Workout completed ✓",
      body: `Great job — ${todayWorkout.exercises?.length || 0} exercises done today!`,
      type: "success",
    });
  }

  if (todayMeals.length === 0) {
    notifications.push({
      id: "no-meals",
      icon: Apple,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      title: "No meals logged today",
      body: "Open the Nutrition tab to track what you've eaten.",
      type: "warning",
    });
  } else {
    notifications.push({
      id: "calories",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      title: `${Math.round(todayCalories)} kcal eaten today`,
      body: `${Math.round(todayProtein)}g protein tracked across ${todayMeals.length} meal${todayMeals.length > 1 ? "s" : ""}.`,
      type: "info",
    });
  }

  if (todayReminders.length > 0) {
    notifications.push({
      id: "reminders",
      icon: Bell,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      title: `${todayReminders.length} workout reminder${todayReminders.length > 1 ? "s" : ""} today`,
      body: todayReminders.map((r) => `${r.label} at ${r.time}`).join(" · "),
      type: "info",
    });
  }

  const weeklyStreak = [...new Set(meals.map((m) => m.date))].length;
  if (weeklyStreak >= 3) {
    notifications.push({
      id: "streak",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      title: `${weeklyStreak}-day nutrition streak! 🔥`,
      body: "You've been logging meals consistently. Keep it up!",
      type: "success",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-14 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -12, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -12, opacity: 0, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="font-bold text-white text-sm">Notifications</p>
            <p className="text-[10px] text-white/35 mt-0.5">Good {getGreeting()} — here's your summary</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/30">You're all caught up! 🎉</p>
            </div>
          ) : notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className={`p-2 rounded-xl ${n.bg} border ${n.border} shrink-0 mt-0.5`}>
                <n.icon className={`w-3.5 h-3.5 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{n.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{n.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-white/8 bg-white/2">
          <p className="text-[10px] text-white/25 text-center">
            {format(new Date(), "EEEE, MMMM d")} · Auto-refreshes when you open
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}