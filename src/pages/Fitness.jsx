import { useState } from "react";
import { Dumbbell, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WorkoutHistory from "@/components/fitness/WorkoutHistory";
import WorkoutRemindersModal from "@/components/fitness/WorkoutRemindersModal";
import StepTracker from "@/components/fitness/StepTracker";
import HeartRateTracker from "@/components/fitness/HeartRateTracker";
import SleepTracker from "@/components/fitness/SleepTracker";
import WorkoutStartModal from "@/components/fitness/WorkoutStartModal";

export default function Fitness() {
  const [showReminders, setShowReminders] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fitness</h1>
          <p className="text-xs text-white/35 mt-0.5">What do you want to do today?</p>
        </div>
        <button onClick={() => setShowReminders(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-xs text-white/60 hover:text-white transition-all">
          <Bell className="w-3.5 h-3.5" /> Reminders
        </button>
      </div>

      {/* Start Workout CTA */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowStartModal(true)}
        className="w-full flex items-center gap-4 p-5 rounded-2xl bg-[#27272b] hover:bg-[#2f2f34] active:scale-[0.98] transition-all shadow-sm"
      >
        <div className="p-3 rounded-xl bg-white/15">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-base text-white">Start Workout</p>
          <p className="text-sm text-white/50 mt-0.5">New workout, routine, or explore exercises</p>
        </div>
      </motion.button>

      {/* Health Trackers */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Health Monitoring</p>
        <HeartRateTracker />
        <SleepTracker />
      </div>

      {/* Step Tracker */}
      <StepTracker />

      {/* Workout History */}
      <div>
        <h2 className="text-base font-semibold mb-2 text-white">Workout History</h2>
        <WorkoutHistory />
      </div>

      <AnimatePresence>
        {showReminders && <WorkoutRemindersModal onClose={() => setShowReminders(false)} />}
        {showStartModal && <WorkoutStartModal onClose={() => setShowStartModal(false)} />}
      </AnimatePresence>
    </div>
  );
}