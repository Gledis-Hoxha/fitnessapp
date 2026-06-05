import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Footprints, Flame, MapPin, Dumbbell, Apple, Target, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const DAILY_STEP_GOAL = 10000;
const today = format(new Date(), "yyyy-MM-dd");

function ReviewStat({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
      <div className={`p-2 rounded-xl w-fit ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-white leading-none tabular-nums">
        {value}
        {unit && <span className="text-sm font-medium text-white/40 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-white/35">{label}</p>
    </div>
  );
}

export default function DailyReview() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const steps = Number(params.get("steps") || 0);
  const calories = Number(params.get("calories") || 0);
  const distance = params.get("distance") || "0.00";

  const { data: workouts = [] } = useQuery({
    queryKey: ["dailyReviewWorkouts", today],
    queryFn: () => base44.entities.Workout.filter({ status: "completed", date: today }, "-date", 20),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["dailyReviewMeals", today],
    queryFn: () => base44.entities.NutritionEntry.filter({ date: today }, "-created_date", 50),
  });

  const totalSets = workouts.reduce(
    (a, w) => a + (w.exercises?.reduce((b, ex) => b + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0), 0
  );
  const eatenCalories = meals.reduce((a, m) => a + (m.calories || 0), 0);
  const eatenProtein = Math.round(meals.reduce((a, m) => a + (m.protein_g || 0), 0));
  const stepProgress = Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100));

  const highlights = [
    workouts.length > 0 && `Logged ${workouts.length} workout${workouts.length > 1 ? "s" : ""} 💪`,
    stepProgress >= 100 && "Hit your step goal! 🎉",
    meals.length > 0 && `Tracked ${meals.length} meal${meals.length > 1 ? "s" : ""} 🍽️`,
    totalSets > 0 && `Completed ${totalSets} sets 🔥`,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Daily Review</h1>
          <p className="text-xs text-white/30">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/15 to-green-500/10 border border-white/10 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Today's Highlights</p>
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-white/80">{h}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Activity */}
      <div>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Activity</p>
        <div className="grid grid-cols-3 gap-2">
          <ReviewStat icon={Footprints} label="Steps" value={steps.toLocaleString()} color="bg-green-500/15 text-green-400" />
          <ReviewStat icon={Flame} label="Burned" value={calories} unit="kcal" color="bg-orange-500/15 text-orange-400" />
          <ReviewStat icon={MapPin} label="Distance" value={distance} unit="km" color="bg-blue-500/15 text-blue-400" />
        </div>
      </div>

      {/* Step goal */}
      <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Step Goal
          </span>
          <span className="text-xs font-bold text-green-400">{stepProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${stepProgress}%` }} transition={{ duration: 0.7 }} />
        </div>
      </div>

      {/* Training & Nutrition */}
      <div>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Training & Nutrition</p>
        <div className="grid grid-cols-2 gap-2">
          <ReviewStat icon={Dumbbell} label="Workouts" value={workouts.length} color="bg-blue-500/15 text-blue-400" />
          <ReviewStat icon={Target} label="Sets Done" value={totalSets} color="bg-purple-500/15 text-purple-400" />
          <ReviewStat icon={Apple} label="Calories Eaten" value={eatenCalories} unit="kcal" color="bg-green-500/15 text-green-400" />
          <ReviewStat icon={Flame} label="Protein" value={eatenProtein} unit="g" color="bg-orange-500/15 text-orange-400" />
        </div>
      </div>

      {highlights.length === 0 && (
        <p className="text-center text-sm text-white/30 py-4">
          No activity logged yet today. Start a workout or take some steps to build your review!
        </p>
      )}
    </div>
  );
}