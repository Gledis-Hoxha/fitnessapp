import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, History, Activity } from "lucide-react";
import WorkoutHistory from "@/components/fitness/WorkoutHistory";
import WorkoutStartModal from "@/components/fitness/WorkoutStartModal";
import StepTracker from "@/components/fitness/StepTracker";
import SleepTracker from "@/components/fitness/SleepTracker";
import HeartRateTracker from "@/components/fitness/HeartRateTracker";

export default function Fitness() {
  const [showStartModal, setShowStartModal] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white hidden">Fitness</h1>
          <p className="text-sm text-white/40 mt-0.5 hidden">Track & crush your workouts</p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold text-sm hover:bg-blue-500/30 transition-colors">
          
          <Plus className="w-4 h-4" />
          Start Workout
        </button>
      </div>

      {/* Health Trackers */}
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-white/30" />
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Health Tracking</p>
      </div>

      <StepTracker />
      <HeartRateTracker />
      <SleepTracker />

      {/* Section label */}
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-white/30" />
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Workout History</p>
      </div>

      <WorkoutHistory />

      <AnimatePresence>
        {showStartModal && <WorkoutStartModal onClose={() => setShowStartModal(false)} />}
      </AnimatePresence>
    </div>);

}