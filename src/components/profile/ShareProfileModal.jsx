import { motion } from "framer-motion";
import { X, Copy, Twitter, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ShareProfileModal({ user, workoutCount, onClose }) {
  const profileText = `Check out ${user?.username || user?.full_name || "my"} VitalFlow profile! 💪 ${workoutCount} workouts logged. Join me on VitalFlow!`;
  const appUrl = window.location.origin;

  const copy = () => {
    navigator.clipboard.writeText(`${profileText}\n${appUrl}`);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-base">Share Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview card */}
          <div className="bg-gradient-to-br from-green-900/40 to-blue-900/30 border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <p className="font-bold text-white">{user?.username || user?.full_name}</p>
            <p className="text-xs text-white/50 mt-0.5 hidden">🌿 VitalFlow Member · {workoutCount} workouts</p>
            {user?.fitness_goals?.length > 0 &&
            <div className="flex flex-wrap gap-1 justify-center mt-2">
                {user.fitness_goals.slice(0, 2).map((g) =>
              <span key={g} className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full hidden">{g.replace(/_/g, " ")}</span>
              )}
              </div>
            }
          </div>

          {/* Actions */}
          <button onClick={copy} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium transition-all">
            <Copy className="w-4 h-4" /> Copy Profile Link
          </button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(profileText)}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-sm font-medium transition-all">
            <Twitter className="w-4 h-4" /> Share on Twitter / X
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(profileText + " " + appUrl)}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-sm font-medium transition-all">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>
      </motion.div>
    </motion.div>);

}