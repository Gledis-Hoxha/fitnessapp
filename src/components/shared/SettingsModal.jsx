import { useState } from "react";
import { motion } from "framer-motion";
import { X, Target, User, Key, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { setExerciseApiKey, isExerciseApiConfigured } from "@/lib/exerciseApi";
import { setUsdaApiKey, isUsdaApiConfigured } from "@/lib/usdaApi";

const MACRO_GOALS_KEY = "macro_goals";
const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export function getMacroGoals() {
  try { return JSON.parse(localStorage.getItem(MACRO_GOALS_KEY)) || DEFAULT_GOALS; }
  catch { return DEFAULT_GOALS; }
}

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState("goals");
  const [goals, setGoals] = useState(getMacroGoals());
  const [exerciseKey, setExerciseKeyState] = useState(localStorage.getItem("rapidapi_key") || "");
  const [usdaKey, setUsdaKeyState] = useState(localStorage.getItem("usda_api_key") || "");

  const saveGoals = () => {
    localStorage.setItem(MACRO_GOALS_KEY, JSON.stringify({
      calories: Number(goals.calories),
      protein: Number(goals.protein),
      carbs: Number(goals.carbs),
      fat: Number(goals.fat),
    }));
    toast.success("Daily goals saved!");
  };

  const saveApiKeys = () => {
    if (exerciseKey) setExerciseApiKey(exerciseKey);
    if (usdaKey) setUsdaApiKey(usdaKey);
    toast.success("API keys saved!");
  };

  const TABS = [
    { id: "goals", label: "Goals", icon: Target },
    { id: "api", label: "API Keys", icon: Key },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-base">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === id ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === "goals" && (
            <>
              <p className="text-xs text-white/40">Set your daily nutrition targets used across the app.</p>
              <div className="space-y-3">
                {[
                  { key: "calories", label: "Calories", unit: "kcal", color: "text-green-400" },
                  { key: "protein", label: "Protein", unit: "g", color: "text-blue-400" },
                  { key: "carbs", label: "Carbs", unit: "g", color: "text-yellow-400" },
                  { key: "fat", label: "Fat", unit: "g", color: "text-orange-400" },
                ].map(({ key, label, unit, color }) => (
                  <div key={key}>
                    <label className={`text-xs font-semibold mb-1 block ${color}`}>{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={goals[key]}
                        onChange={(e) => setGoals({ ...goals, [key]: e.target.value })}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 pr-12 text-sm text-white outline-none focus:border-green-500/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={saveGoals}
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-all"
              >
                Save Goals
              </button>
            </>
          )}

          {tab === "api" && (
            <>
              <p className="text-xs text-white/40">API keys are stored locally on your device only.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-blue-400 mb-1 block">ExerciseDB (RapidAPI)</label>
                  <input
                    type="password"
                    value={exerciseKey}
                    onChange={(e) => setExerciseKeyState(e.target.value)}
                    placeholder="Enter RapidAPI key…"
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/50"
                  />
                  <p className="text-[10px] text-white/25 mt-1">Used for exercise library & explore page</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-green-400 mb-1 block">USDA FoodData (API Key)</label>
                  <input
                    type="password"
                    value={usdaKey}
                    onChange={(e) => setUsdaKeyState(e.target.value)}
                    placeholder="Enter USDA API key…"
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-green-500/50"
                  />
                  <p className="text-[10px] text-white/25 mt-1">Used for food search in nutrition tracking</p>
                </div>
              </div>
              <button
                onClick={saveApiKeys}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/10"
              >
                Save API Keys
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}