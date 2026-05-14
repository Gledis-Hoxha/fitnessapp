import { useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, BookOpen, Compass, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WorkoutHistory from "@/components/fitness/WorkoutHistory";
import WorkoutRemindersModal from "@/components/fitness/WorkoutRemindersModal";
import StepTracker from "@/components/fitness/StepTracker";

const actions = [
{
  to: "/fitness/start-workout",
  icon: Dumbbell,
  label: "Start Workout",
  description: "Track exercises in real time",
  color: "text-primary-foreground bg-[#27272b]",
  iconBg: "bg-white/20"
},
{
  to: "/fitness/routines",
  icon: BookOpen,
  label: "Start Routine",
  description: "Follow a saved routine",
  color: "text-white bg-[#27272b]",
  iconBg: "bg-white/20"
},
{
  to: "/fitness/explore",
  icon: Compass,
  label: "Explore",
  description: "Discover exercises & tips",
  color: "text-foreground border border-border bg-[#27272b]",
  iconBg: "bg-secondary"
}];


export default function Fitness() {
  const [showReminders, setShowReminders] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fitness</h1>
          <p className="text-xs text-white/35 mt-0.5">What do you want to do today?</p>
        </div>
        <button onClick={() => setShowReminders(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-xs text-white/60 hover:text-white transition-all">
          <Bell className="w-3.5 h-3.5" /> Reminders
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.map(({ to, icon: Icon, label, description, color, iconBg }, i) =>
        <motion.div
          key={to}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}>
          
            <Link
            to={to}
            className={`flex items-center gap-4 p-6 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] rounded-2xl ${color}`}>
            
              <div className={`p-3 rounded-xl ${iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-base">{label}</p>
                <p className="text-sm opacity-70 mt-0.5">{description}</p>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Step Tracker */}
      <StepTracker />

      {/* Workout History & Analytics */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Workout History</h2>
        <WorkoutHistory />
      </div>

      <AnimatePresence>
        {showReminders && <WorkoutRemindersModal onClose={() => setShowReminders(false)} />}
      </AnimatePresence>
    </div>);

}