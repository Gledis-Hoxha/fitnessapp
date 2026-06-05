import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, History } from "lucide-react";
import WorkoutHistory from "@/components/fitness/WorkoutHistory";
import WorkoutStartModal from "@/components/fitness/WorkoutStartModal";

export default function Fitness() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [tab, setTab] = useState("history");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Fitness</h1>
          <p className="text-sm text-white/40 mt-0.5">Track your workouts</p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Start
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "hsl(248,20%,15%)" }}>
        {[
          { id: "history", label: "History", icon: History },
          { id: "exercises", label: "Exercises", icon: Dumbbell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === id
                ? "bg-primary text-primary-foreground shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "history" && <WorkoutHistory />}
      {tab === "exercises" && (
        <div className="text-center py-12 text-white/30">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Browse exercises from the Start Workout screen</p>
        </div>
      )}

      <AnimatePresence>
        {showStartModal && <WorkoutStartModal onClose={() => setShowStartModal(false)} />}
      </AnimatePresence>
    </div>
  );
}