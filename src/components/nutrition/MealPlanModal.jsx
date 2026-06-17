import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, PlayCircle, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function MealTypePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white/80 capitalize hover:border-white/25 transition-colors"
      >
        {value}
        <ChevronDown className="w-3 h-3 text-white/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a1a] border border-white/15 rounded-xl py-1 min-w-[120px] shadow-xl">
            {MEAL_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { onChange(t); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs capitalize transition-colors ${
                  t === value ? "text-green-400 bg-green-500/10" : "text-white/70 hover:bg-white/8"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MealPlanModal({ onClose, onLogged }) {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [view, setView] = useState("list"); // "list" | "create"
  const [newPlanName, setNewPlanName] = useState("");
  const [newFoods, setNewFoods] = useState([{ food_name: "", meal_type: "breakfast", calories: "", protein_g: "", carbs_g: "", fat_g: "", serving_size: "" }]);
  const [expanded, setExpanded] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: () => base44.entities.MealPlan.list("-created_date", 50),
  });

  const createPlan = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["meal-plans"] }); setView("list"); },
  });

  const deletePlan = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });

  const logPlan = useMutation({
    mutationFn: async (plan) => {
      const entries = (plan.foods || []).map((f) => ({
        food_name: f.food_name,
        meal_type: f.meal_type,
        calories: f.calories || 0,
        protein_g: f.protein_g || 0,
        carbs_g: f.carbs_g || 0,
        fat_g: f.fat_g || 0,
        serving_size: f.serving_size || "",
        date: today,
      }));
      return base44.entities.NutritionEntry.bulkCreate(entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-home"] });
      toast.success("Meal plan logged for today!");
      onLogged?.();
      onClose();
    },
  });

  const addFood = () => setNewFoods([...newFoods, { food_name: "", meal_type: "breakfast", calories: "", protein_g: "", carbs_g: "", fat_g: "", serving_size: "" }]);
  const removeFood = (i) => setNewFoods(newFoods.filter((_, idx) => idx !== i));
  const updateFood = (i, field, val) => setNewFoods(newFoods.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  const savePlan = () => {
    if (!newPlanName.trim()) return toast.error("Enter a plan name");
    const foods = newFoods.filter((f) => f.food_name.trim());
    if (!foods.length) return toast.error("Add at least one food");
    createPlan.mutate({ name: newPlanName.trim(), foods: foods.map((f) => ({ ...f, calories: +f.calories || 0, protein_g: +f.protein_g || 0, carbs_g: +f.carbs_g || 0, fat_g: +f.fat_g || 0 })) });
  };

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
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {view === "create" && (
              <button onClick={() => setView("list")} className="text-white/50 hover:text-white text-sm">← Back</button>
            )}
            <h2 className="font-bold text-white text-base">{view === "list" ? "Meal Plans" : "New Meal Plan"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button onClick={() => setView("create")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Plan
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {view === "list" && (
            <>
              {isLoading && <p className="text-white/40 text-sm text-center py-8">Loading...</p>}
              {!isLoading && plans.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/40 text-sm">No meal plans yet.</p>
                  <button onClick={() => setView("create")} className="mt-3 text-green-400 text-sm font-medium hover:underline">Create your first plan →</button>
                </div>
              )}
              {plans.map((plan) => {
                const totalCal = (plan.foods || []).reduce((s, f) => s + (f.calories || 0), 0);
                const isOpen = expanded === plan.id;
                return (
                  <div key={plan.id} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                    <button onClick={() => setExpanded(isOpen ? null : plan.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                      <div>
                        <p className="font-semibold text-white text-sm">{plan.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">{(plan.foods || []).length} foods · {totalCal} kcal</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); logPlan.mutate(plan); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-xs font-semibold transition-colors"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Log Today
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deletePlan.mutate(plan.id); }} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isOpen ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/8 px-4 py-3 space-y-1.5">
                        {(plan.foods || []).map((f, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-white/70">{f.food_name} <span className="text-white/30">({f.meal_type})</span></span>
                            <span className="text-white/40">{f.calories || 0} kcal · {f.protein_g || 0}p · {f.carbs_g || 0}c · {f.fat_g || 0}f</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {view === "create" && (
            <div className="space-y-4">
              <input
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Plan name (e.g. 'High Protein Day')"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-green-500/50"
              />
              {newFoods.map((food, i) => (
                <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={food.food_name} onChange={(e) => updateFood(i, "food_name", e.target.value)} placeholder="Food name" className="flex-1 bg-transparent border-b border-white/15 pb-1 text-sm text-white placeholder:text-white/30 outline-none" />
                    <MealTypePicker value={food.meal_type} onChange={(v) => updateFood(i, "meal_type", v)} />
                    {newFoods.length > 1 && (
                      <button onClick={() => removeFood(i)} className="text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["calories", "protein_g", "carbs_g", "fat_g"].map((field) => (
                      <input key={field} type="number" value={food[field]} onChange={(e) => updateFood(i, field, e.target.value)} placeholder={field === "calories" ? "kcal" : field.replace("_g", "g")} className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-white/20 outline-none text-center" />
                    ))}
                  </div>
                  <input value={food.serving_size} onChange={(e) => updateFood(i, "serving_size", e.target.value)} placeholder="Serving size (e.g. 100g)" className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white/50 placeholder:text-white/20 outline-none" />
                </div>
              ))}
              <button onClick={addFood} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white/70 hover:border-white/30 text-sm transition-colors">
                <Plus className="w-4 h-4" /> Add Food
              </button>
              <button onClick={savePlan} disabled={createPlan.isPending} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors disabled:opacity-50">
                {createPlan.isPending ? "Saving..." : "Save Meal Plan"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}