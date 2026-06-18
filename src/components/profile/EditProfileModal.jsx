import { useState } from "react";
import { app } from "@/api/base44Client";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { toast } from "sonner";

const ACTIVITY_LEVELS = ["sedentary", "lightly_active", "moderately_active", "very_active", "athlete"];
const FITNESS_GOALS = ["lose_weight", "build_muscle", "improve_endurance", "stay_healthy", "increase_flexibility", "sport_performance", "stress_relief", "body_recomposition"];
const FOOD_PREFS = ["high_protein", "vegetarian", "vegan", "low_carb", "mediterranean", "balanced", "gluten_free", "dairy_free"];

export default function EditProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: user?.username || "",
    age: user?.age || "",
    height_cm: user?.height_cm || "",
    weight_kg: user?.weight_kg || "",
    goal_weight_kg: user?.goal_weight_kg || "",
    activity_level: user?.activity_level || "",
    fitness_goals: user?.fitness_goals || [],
    preferred_foods: user?.preferred_foods || []
  });
  const [saving, setSaving] = useState(false);

  const toggle = (field, val) =>
  setForm((p) => ({
    ...p,
    [field]: p[field].includes(val) ? p[field].filter((x) => x !== val) : [...p[field], val]
  }));

  const save = async () => {
    setSaving(true);
    await app.auth.updateMe({
      ...form,
      age: Number(form.age) || undefined,
      height_cm: Number(form.height_cm) || undefined,
      weight_kg: Number(form.weight_kg) || undefined,
      goal_weight_kg: Number(form.goal_weight_kg) || undefined
    });
    setSaving(false);
    toast.success("Profile updated!");
    onSaved();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-base">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Basic */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Basic Info</p>
            {[
            { field: "username", label: "Username", placeholder: "e.g. fitjohn99" }].
            map(({ field, label, placeholder }) =>
            <div key={field}>
                <label className="text-xs text-white/50 mb-1 block">{label}</label>
                <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={placeholder}
              className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-sm placeholder:text-white/25 outline-none focus:border-blue-500/50 bg-gray-500/[0.08] text-gray-300" />
              </div>
            )}
          </div>

          {/* Body Stats */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Body Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {[
              { field: "age", label: "Age", unit: "yrs" },
              { field: "height_cm", label: "Height", unit: "cm" },
              { field: "weight_kg", label: "Current Weight", unit: "kg" },
              { field: "goal_weight_kg", label: "Goal Weight", unit: "kg" }].
              map(({ field, label, unit }) =>
              <div key={field}>
                  <label className="text-xs text-white/50 mb-1 block">{label}</label>
                  <div className="relative">
                    <input type="number" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  placeholder="—"
                  className="w-full border border-white/15 rounded-xl px-3 py-2.5 pr-10 text-sm placeholder:text-white/25 outline-none focus:border-blue-500/50 text-gray-300 bg-gray-500/[0.08]" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">{unit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Activity Level</p>
            <div className="grid grid-cols-1 gap-1.5">
              {ACTIVITY_LEVELS.map((lvl) =>
              <button key={lvl} onClick={() => setForm({ ...form, activity_level: lvl })}
              className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${form.activity_level === lvl ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/8"}`}>
                  {lvl.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              )}
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Fitness Goals</p>
            <div className="flex flex-wrap gap-2">
              {FITNESS_GOALS.map((g) =>
              <button key={g} onClick={() => toggle("fitness_goals", g)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${form.fitness_goals.includes(g) ? "bg-blue-500/20 border-blue-500/50 text-blue-300" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/8"}`}>
                  {g.replace(/_/g, " ")}
                </button>
              )}
            </div>
          </div>

          {/* Food Preferences */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Food Preferences</p>
            <div className="flex flex-wrap gap-2">
              {FOOD_PREFS.map((f) =>
              <button key={f} onClick={() => toggle("preferred_foods", f)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${form.preferred_foods.includes(f) ? "bg-blue-500/20 border-blue-500/50 text-blue-300" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/8"}`}>
                  {f.replace(/_/g, " ")}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10">
          <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>);

}