import { Link } from "react-router-dom";
import { Dumbbell, BookOpen, Compass } from "lucide-react";
import { motion } from "framer-motion";
import WorkoutHistory from "@/components/fitness/WorkoutHistory";

const actions = [
  {
    to: "/fitness/start-workout",
    icon: Dumbbell,
    label: "Start Workout",
    description: "Track exercises in real time",
    color: "bg-primary text-primary-foreground",
    iconBg: "bg-white/20",
  },
  {
    to: "/fitness/routines",
    icon: BookOpen,
    label: "Start Routine",
    description: "Follow a saved routine",
    color: "bg-accent text-white",
    iconBg: "bg-white/20",
  },
  {
    to: "/fitness/explore",
    icon: Compass,
    label: "Explore",
    description: "Discover exercises & tips",
    color: "bg-card text-foreground border border-border",
    iconBg: "bg-secondary",
  },
];

export default function Fitness() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Fitness</h1>
        <p className="text-sm text-muted-foreground mt-1">What do you want to do today?</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.map(({ to, icon: Icon, label, description, color, iconBg }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={to}
              className={`flex items-center gap-4 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] ${color}`}
            >
              <div className={`p-3 rounded-xl ${iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-base">{label}</p>
                <p className="text-sm opacity-70 mt-0.5">{description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Workout History & Analytics */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Workout History</h2>
        <WorkoutHistory />
      </div>
    </div>
  );
}