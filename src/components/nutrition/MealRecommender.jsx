import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAILY_GOALS = { calories: 2000, protein: 150 };

export default function MealRecommender({ todayCalories = 0, todayProtein = 0, onAddMeal, viewDate }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const remainingCal = Math.max(0, DAILY_GOALS.calories - todayCalories);
  const remainingProtein = Math.max(0, DAILY_GOALS.protein - todayProtein);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a nutrition coach. The user has eaten ${todayCalories} kcal and ${todayProtein}g protein today.
Their daily goals are ${DAILY_GOALS.calories} kcal and ${DAILY_GOALS.protein}g protein.
Remaining: ${remainingCal} kcal and ${remainingProtein}g protein.

Recommend 3 specific meals or snacks that fit their remaining budget for the rest of the day.
Keep each item practical, quick to prepare, and tasty. Vary between meals (e.g. lunch, dinner, snack).`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                  calories: { type: "number" },
                  protein_g: { type: "number" },
                  carbs_g: { type: "number" },
                  fat_g: { type: "number" },
                  serving_size: { type: "string" },
                  why: { type: "string" }
                }
              }
            }
          }
        }
      });
      setRecommendations(result.recommendations || []);
    } catch {
      setError("Could not generate recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && recommendations.length === 0 && !loading) generate();
  };

  const addToLog = (rec) => {
    onAddMeal?.({
      food_name: rec.name,
      meal_type: rec.meal_type || "snack",
      calories: rec.calories || 0,
      protein_g: rec.protein_g || 0,
      carbs_g: rec.carbs_g || 0,
      fat_g: rec.fat_g || 0,
      serving_size: rec.serving_size || "1 serving",
      date: viewDate
    });
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        
        

        
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Meal Recommendations</p>
          <p className="text-xs text-white/35">
            {remainingCal} kcal · {remainingProtein}g protein remaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/15 px-2 py-0.5 rounded-full">AI</span>
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/8 overflow-hidden">
          
            <div className="px-4 pb-4 pt-3 space-y-3">
              {loading &&
            <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <p className="text-xs text-white/40">Generating meal ideas…</p>
                </div>
            }
              {error &&
            <p className="text-xs text-red-400 text-center py-3">{error}</p>
            }
              {!loading && recommendations.map((rec, i) =>
            <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-white truncate">{rec.name}</p>
                      <span className="text-[10px] text-white/30 capitalize flex-shrink-0">{rec.meal_type}</span>
                    </div>
                    <p className="text-xs text-white/40 mb-1.5">{rec.why}</p>
                    <div className="flex gap-3 text-[10px] text-white/40">
                      <span className="text-green-400 font-semibold">{rec.calories} kcal</span>
                      <span className="text-blue-400">{rec.protein_g}g protein</span>
                      <span>{rec.carbs_g}g carbs</span>
                      <span>{rec.fat_g}g fat</span>
                    </div>
                  </div>
                  <button
                onClick={() => addToLog(rec)}
                className="flex-shrink-0 p-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/20 transition-colors">
                
                    <Plus className="w-3.5 h-3.5 text-green-400" />
                  </button>
                </div>
            )}
              {!loading && recommendations.length > 0 &&
            <button
              onClick={generate}
              className="w-full text-xs text-purple-400 hover:text-purple-300 py-1.5 transition-colors">
              
                  Regenerate suggestions ↺
                </button>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}