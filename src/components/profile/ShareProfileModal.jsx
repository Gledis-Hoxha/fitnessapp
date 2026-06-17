import { motion } from "framer-motion";
import { X, Copy, Twitter, MessageCircle, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import html2canvas from "html2canvas";

export default function ShareProfileModal({ user, workouts = [], meals = [], onClose }) {
  const cardRef = useRef(null);

  const totalSets = workouts.reduce(
    (a, w) => a + (w.exercises?.reduce((b, ex) => b + (ex.sets?.filter((s) => s.completed).length || 0), 0) || 0), 0
  );

  const recentMeals = meals.filter(m => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return new Date(m.date) >= d;
  });
  const avgCalories = recentMeals.length
    ? Math.round(recentMeals.reduce((s, m) => s + (m.calories || 0), 0) / 7)
    : 0;
  const avgProtein = recentMeals.length
    ? Math.round(recentMeals.reduce((s, m) => s + (m.protein_g || 0), 0) / 7)
    : 0;

  const profileText = `Check out ${user?.full_name || "my"} VitalFlow profile! 💪 ${workouts.length} workouts · ${totalSets} sets · ~${avgCalories} kcal/day. Join me on VitalFlow!`;
  const appUrl = window.location.origin;

  const copy = () => {
    navigator.clipboard.writeText(`${profileText}\n${appUrl}`);
    toast.success("Copied to clipboard!");
  };

  const shareToInstagram = async () => {
    if (!cardRef.current) return;
    toast.success("Generating share card…");
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vitalflow-weekly-summary.png";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded! Post it to Instagram.");
    } catch {
      toast.error("Could not generate image. Try again.");
    }
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
            <p className="font-bold text-white">{user?.full_name}</p>
          </div>

          {/* Actions */}
          <button onClick={copy} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium transition-all">
            <Copy className="w-4 h-4" /> Copy Profile Link
          </button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(profileText)}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-sm font-medium transition-all">
            <Twitter className="w-4 h-4" /> Share on Twitter / X
          </a>
          <button onClick={shareToInstagram}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 text-sm font-medium transition-all">
            <Instagram className="w-4 h-4" /> Share on Instagram
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(profileText + " " + appUrl)}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-sm font-medium transition-all">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>
      </motion.div>

      {/* Hidden card for Instagram screenshot */}
      <div ref={cardRef} className="fixed left-[-9999px] top-0 w-[600px] p-8"
        style={{ background: "hsl(248,20%,11%)" }}>
        <div className="rounded-3xl border border-white/10 p-8" style={{ background: "hsl(248,20%,15%)" }}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-6">VitalFlow · Weekly Summary</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-xl font-bold text-white">{user?.full_name}</p>
              {user?.fitness_goals?.length > 0 && (
                <p className="text-xs text-blue-300 mt-0.5">
                  {user.fitness_goals.slice(0, 2).map(g => g.replace(/_/g, " ")).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{workouts.length}</p>
              <p className="text-xs text-white/40 mt-1">Workouts</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-300">{totalSets}</p>
              <p className="text-xs text-white/40 mt-1">Sets Done</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{avgCalories}</p>
              <p className="text-xs text-white/40 mt-1">Avg kcal/day</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-green-300">{avgProtein}g</p>
              <p className="text-xs text-white/40 mt-1">Avg Protein/day</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/60">Join me on VitalFlow</p>
            <p className="text-xs text-blue-400 mt-0.5">{appUrl}</p>
          </div>
        </div>
      </div>
    </motion.div>);

}