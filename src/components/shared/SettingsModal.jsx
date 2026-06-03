import { useState } from "react";
import { motion } from "framer-motion";
import { X, Target, Key, Ruler, Bell, LogOut, User, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { setExerciseApiKey } from "@/lib/exerciseApi";
import { setUsdaApiKey } from "@/lib/usdaApi";

const MACRO_GOALS_KEY = "macro_goals";
const UNIT_PREF_KEY = "unit_prefs";
const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
const DEFAULT_UNITS = { weight: "kg", distance: "km", height: "cm" };

export function getMacroGoals() {
  try { return JSON.parse(localStorage.getItem(MACRO_GOALS_KEY)) || DEFAULT_GOALS; }
  catch { return DEFAULT_GOALS; }
}

export function getUnitPrefs() {
  try { return JSON.parse(localStorage.getItem(UNIT_PREF_KEY)) || DEFAULT_UNITS; }
  catch { return DEFAULT_UNITS; }
}

const TABS = [
  { id: "goals", label: "Goals", icon: Target },
  { id: "units", label: "Units", icon: Ruler },
  { id: "api", label: "API Keys", icon: Key },
  { id: "account", label: "Account", icon: User },
];

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState("goals");
  const [goals, setGoals] = useState(getMacroGoals());
  const [units, setUnits] = useState(getUnitPrefs());
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

  const saveUnits = () => {
    localStorage.setItem(UNIT_PREF_KEY, JSON.stringify(units));
    toast.success("Units saved!");
  };

  const saveApiKeys = () => {
    if (exerciseKey.trim()) setExerciseApiKey(exerciseKey.trim());
    if (usdaKey.trim()) setUsdaApiKey(usdaKey.trim());
    toast.success("API keys saved!");
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-base">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                tab === id ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Goals ── */}
          {tab === "goals" && (
            <>
              <p className="text-xs text-white/40">Set your daily nutrition targets. These apply to the progress bars across the app.</p>
              <div className="space-y-3">
                {[
                  { key: "calories", label: "Calories", unit: "kcal", color: "text-green-400" },
                  { key: "protein", label: "Protein", unit: "g", color: "text-blue-400" },
                  { key: "carbs", label: "Carbs", unit: "g", color: "text-yellow-400" },
                  { key: "fat", label: "Fat", unit: "g", color: "text-orange-400" },
                ].map(({ key, label, unit, color }) => (
                  <div key={key}>
                    <label className={`text-xs font-semibold mb-1.5 block ${color}`}>{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={goals[key]}
                        onChange={(e) => setGoals({ ...goals, [key]: e.target.value })}
                        className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 pr-12 text-sm text-white outline-none focus:border-green-500/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={saveGoals} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-all">
                Save Goals
              </button>
            </>
          )}

          {/* ── Units ── */}
          {tab === "units" && (
            <>
              <p className="text-xs text-white/40">Choose your preferred measurement units used throughout the app.</p>
              <div className="space-y-4">
                {[
                  { key: "weight", label: "Body Weight", options: ["kg", "lbs"] },
                  { key: "distance", label: "Distance", options: ["km", "miles"] },
                  { key: "height", label: "Height", options: ["cm", "ft/in"] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-white/60 mb-2">{label}</p>
                    <div className="flex gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setUnits({ ...units, [key]: opt })}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                            units[key] === opt
                              ? "bg-white/15 border-white/25 text-white"
                              : "bg-white/4 border-white/8 text-white/35 hover:bg-white/8"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={saveUnits} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/10">
                Save Units
              </button>
            </>
          )}

          {/* ── API Keys ── */}
          {tab === "api" && (
            <>
              <p className="text-xs text-white/40">API keys are stored locally on your device only and never sent to our servers.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-blue-400 mb-1.5 block">ExerciseDB (RapidAPI)</label>
                  <input
                    type="password"
                    value={exerciseKey}
                    onChange={(e) => setExerciseKeyState(e.target.value)}
                    placeholder="Paste your RapidAPI key…"
                    className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/50"
                  />
                  <p className="text-[10px] text-white/25 mt-1">Powers the exercise library & explore page with 1,300+ exercises</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-green-400 mb-1.5 block">USDA FoodData (API Key)</label>
                  <input
                    type="password"
                    value={usdaKey}
                    onChange={(e) => setUsdaKeyState(e.target.value)}
                    placeholder="Paste your USDA API key…"
                    className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-green-500/50"
                  />
                  <p className="text-[10px] text-white/25 mt-1">Powers food search with 300,000+ items and full nutritional data</p>
                </div>
              </div>
              <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                <p className="text-[10px] text-white/35 leading-relaxed">
                  🔒 Keys are saved to your browser's local storage and never transmitted to our servers.
                  Get a free ExerciseDB key at <span className="text-blue-400">rapidapi.com</span> and a USDA key at <span className="text-green-400">fdc.nal.usda.gov</span>.
                </p>
              </div>
              <button onClick={saveApiKeys} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/10">
                Save API Keys
              </button>
            </>
          )}

          {/* ── Account ── */}
          {tab === "account" && (
            <div className="space-y-3">
              <p className="text-xs text-white/40">Manage your account and app data.</p>

              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">App Info</p>
                {[
                  { label: "Version", value: "1.0.0" },
                  { label: "Platform", value: "Protein Tracker" },
                  { label: "Data storage", value: "Secure cloud" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                    <span className="text-sm text-white/60">{label}</span>
                    <span className="text-xs text-white/30">{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Data & Privacy</p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    toast.success("Local preferences cleared!");
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8 hover:bg-white/8 transition-colors"
                >
                  <span className="text-sm text-white/70">Clear local preferences</span>
                  <ChevronRight className="w-4 h-4 text-white/25" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 font-semibold text-sm hover:bg-red-500/25 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}