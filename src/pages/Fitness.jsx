import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, History, BookOpen, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import WorkoutHistory from "@/components/fitness/WorkoutHistory";
import WorkoutStartModal from "@/components/fitness/WorkoutStartModal";

export default function Fitness() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [tab, setTab] = useState("history");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fitness</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track & crush your workouts</p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Start Workout
        </button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { to: "/fitness/start-workout", icon: Dumbbell, label: "New Workout", color: "bg-blue-50 text-blue-600 border-blue-100" },
          { to: "/fitness/routines", icon: BookOpen, label: "Routines", color: "bg-green-50 text-green-600 border-green-100" },
          { to: "/fitness/explore", icon: Compass, label: "Explore", color: "bg-purple-50 text-purple-600 border-purple-100" },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color} hover:opacity-80 transition-opacity`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary">
        {[
          { id: "history", label: "Workout History", icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "history" && <WorkoutHistory />}

      <AnimatePresence>
        {showStartModal && <WorkoutStartModal onClose={() => setShowStartModal(false)} />}
      </AnimatePresence>
    </div>
  );
}