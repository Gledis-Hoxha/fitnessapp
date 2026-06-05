import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, BookOpen, Compass, X } from "lucide-react";

export default function WorkoutStartModal({ onClose }) {
  const navigate = useNavigate();

  const options = [
    {
      icon: Dumbbell,
      label: "New Workout",
      description: "Start fresh and track exercises in real time",
      color: "bg-blue-500/15 border-blue-500/20 text-blue-400",
      onClick: () => { navigate("/fitness/exercise-picker", { state: { returnTo: "/fitness/start-workout" } }); onClose(); },
    },
    {
      icon: BookOpen,
      label: "Start a Routine",
      description: "Pick a saved routine and follow it",
      color: "bg-green-500/15 border-green-500/20 text-green-400",
      onClick: () => { navigate("/fitness/routines"); onClose(); },
    },
    {
      icon: Compass,
      label: "Explore Exercises",
      description: "Browse 1300+ exercises by muscle group",
      color: "bg-purple-500/15 border-purple-500/20 text-purple-400",
      onClick: () => { navigate("/fitness/explore"); onClose(); },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl p-5 w-full max-w-sm space-y-3 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-white">Start Workout</h2>
            <p className="text-xs text-white/35">Choose how you want to train</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {options.map(({ icon: Icon, label, description, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${color} hover:opacity-80 active:scale-[0.98] transition-all text-left`}
          >
            <div className="p-2.5 rounded-xl bg-white/10">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{label}</p>
              <p className="text-xs text-white/40 mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}