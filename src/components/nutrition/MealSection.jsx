import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MEAL_CONFIG = {
  breakfast: { label: "Breakfast", emoji: "🌅", color: "from-orange-500/20 to-transparent" },
  lunch: { label: "Lunch", emoji: "☀️", color: "from-yellow-500/20 to-transparent" },
  dinner: { label: "Dinner", emoji: "🌙", color: "from-blue-500/20 to-transparent" },
  snack: { label: "Snacks", emoji: "🍎", color: "from-green-500/20 to-transparent" }
};

export default function MealSection({ mealType, entries = [], onAdd, onDelete }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (entries.length > 0) setOpen(true);
    else setOpen(false);
  }, [entries.length]);
  const cfg = MEAL_CONFIG[mealType];
  const totalCal = entries.reduce((s, e) => s + (e.calories || 0), 0);

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden" style={{ background: "hsl(248,20%,15%)" }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r ${cfg.color} text-left`}>
        
        
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{cfg.label}</p>
          <p className="text-xs text-white/50">{entries.length} items · {Math.round(totalCal)} kcal</p>
        </div>
        <button
          onClick={(e) => {e.stopPropagation();onAdd(mealType);}}
          className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/40 transition-colors mr-2">
          
          <Plus className="w-4 h-4 text-green-400" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}>
          
            {entries.length === 0 ?
          <div className="border-t border-white/5 px-4 py-3" /> :

          <div className="divide-y divide-white/5">
                {entries.map((entry) =>
            <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{entry.food_name}</p>
                      <p className="text-xs text-white/40">
                        {entry.serving_size || "—"}
                        {entry.calories ? ` · ${entry.calories} kcal` : ""}
                        {entry.protein_g ? ` · P: ${entry.protein_g}g` : ""}
                      </p>
                    </div>
                    <button
                onClick={() => onDelete(entry.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
            )}
              </div>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}