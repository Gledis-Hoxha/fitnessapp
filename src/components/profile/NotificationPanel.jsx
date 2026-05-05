import { motion } from "framer-motion";
import { X, Dumbbell, Apple, Bell } from "lucide-react";

export default function NotificationPanel({ todayMeals, todayWorkout, onClose }) {
  const notifications = [
    !todayWorkout && {
      icon: Dumbbell,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      title: "No workout today",
      body: "You haven't logged a workout yet. Stay consistent!",
    },
    todayMeals.length === 0 && {
      icon: Apple,
      color: "text-green-400",
      bg: "bg-green-500/10",
      title: "No meals logged today",
      body: "Don't forget to track your meals to hit your goals.",
    },
    {
      icon: Bell,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      title: "Dinner reminder",
      body: "Time to log your dinner! Keep your nutrition on track.",
    },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="font-semibold text-white">Notifications</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-white/30">You're all caught up! 🎉</div>
          ) : notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4">
              <div className={`p-2 rounded-xl ${n.bg} shrink-0`}>
                <n.icon className={`w-4 h-4 ${n.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <p className="text-xs text-white/45 mt-0.5">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}