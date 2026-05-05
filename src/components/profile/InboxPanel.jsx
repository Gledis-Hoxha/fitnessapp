import { motion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";

const DEMO_MESSAGES = [
  { from: "VitalFlow", avatar: "💚", text: "Welcome to VitalFlow! Start tracking your health journey today.", time: "Just now", unread: true },
  { from: "Coach Bot", avatar: "🤖", text: "Great job completing 3 workouts this week! Keep it up 💪", time: "2h ago", unread: true },
  { from: "Reminder", avatar: "⏰", text: "Don't forget to log your lunch today!", time: "5h ago", unread: false },
];

export default function InboxPanel({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="font-semibold text-white">Inbox</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {DEMO_MESSAGES.map((msg, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{msg.from}</p>
                  <p className="text-xs text-white/35 shrink-0">{msg.time}</p>
                </div>
                <p className="text-xs text-white/50 mt-0.5 truncate">{msg.text}</p>
              </div>
              {msg.unread && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/10">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-sm text-white/50 transition-colors">
            <MessageCircle className="w-4 h-4" />
            New Message
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}