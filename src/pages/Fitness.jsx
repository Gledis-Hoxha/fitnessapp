import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, CalendarDays, Activity, Bell } from "lucide-react";
import WorkoutCalendar from "@/components/fitness/WorkoutCalendar";
import WorkoutStartModal from "@/components/fitness/WorkoutStartModal";
import WorkoutRemindersModal from "@/components/fitness/WorkoutRemindersModal";
import StepTracker from "@/components/fitness/StepTracker";
import SleepTracker from "@/components/fitness/SleepTracker";
import HeartRateTracker from "@/components/fitness/HeartRateTracker";

export default function Fitness() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-center relative">
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold text-sm hover:bg-blue-500/30 transition-colors">
          
          <Plus className="w-4 h-4" />
          Start Workout
        </button>
        <button
          onClick={() => setShowReminders(true)}
          aria-label="Workout reminders"
          className="absolute right-0 p-2 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 transition-colors">
          <Bell className="w-5 h-5" />
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
        <CalendarDays className="w-4 h-4 text-white/30" />
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Workout Calendar</p>
      </div>

      <WorkoutCalendar />

      <AnimatePresence>
        {showStartModal && <WorkoutStartModal onClose={() => setShowStartModal(false)} />}
        {showReminders && <WorkoutRemindersModal onClose={() => setShowReminders(false)} />}
      </AnimatePresence>
    </div>);

}