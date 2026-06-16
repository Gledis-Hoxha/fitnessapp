import { useState } from "react";
import { motion } from "framer-motion";
import TimeWheel from "@/components/fitness/TimeWheel";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// title: "Bedtime" | "Alarm"; accent controls the theme color
export default function TimePickerModal({ title, accent = "indigo", value, onConfirm, onClose }) {
  const [h, setH] = useState(Number(value.split(":")[0]));
  const [m, setM] = useState(Number(value.split(":")[1]));

  const isPM = h >= 12;
  const okClass =
    accent === "amber"
      ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/20"
      : "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/20";

  const handleConfirm = () => {
    onConfirm(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl overflow-hidden">
        {/* Title */}
        <div className="px-6 pt-5 pb-4 text-center border-b border-white/8">
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        {/* Wheels */}
        <div className="relative flex items-center px-6">
          <TimeWheel values={HOURS} value={h} onChange={setH} />
          <span className="text-3xl font-bold text-white/40 pb-0.5">:</span>
          <TimeWheel values={MINUTES} value={m} onChange={setM} />
          <span className="absolute right-7 top-1/2 -translate-y-1/2 translate-x-1 text-xs font-semibold text-white/40">
            {isPM ? "PM" : "AM"}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 p-4 border-t border-white/8">
          <button
            onClick={onClose}
            className="py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`py-3 rounded-2xl text-white text-sm font-semibold shadow-lg transition-all hover:brightness-110 ${okClass}`}>
            OK
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}