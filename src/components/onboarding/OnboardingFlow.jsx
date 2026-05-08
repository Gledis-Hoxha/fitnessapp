import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Dumbbell, Apple, Zap, Target, Flame, Heart, Scale } from "lucide-react";

const ACTIVITY_LEVELS = [
{ value: "sedentary", label: "Sedentary", desc: "Little or no exercise", emoji: "🛋️" },
{ value: "lightly_active", label: "Lightly Active", desc: "1–3 days/week", emoji: "🚶" },
{ value: "moderately_active", label: "Moderately Active", desc: "3–5 days/week", emoji: "🏃" },
{ value: "very_active", label: "Very Active", desc: "6–7 days/week", emoji: "💪" },
{ value: "athlete", label: "Athlete", desc: "Twice a day training", emoji: "🏆" }];


const FOOD_PREFS = [
{ value: "high_protein", label: "High Protein", emoji: "🥩" },
{ value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
{ value: "vegan", label: "Vegan", emoji: "🌱" },
{ value: "low_carb", label: "Low Carb", emoji: "🥑" },
{ value: "mediterranean", label: "Mediterranean", emoji: "🫒" },
{ value: "balanced", label: "Balanced", emoji: "⚖️" },
{ value: "gluten_free", label: "Gluten Free", emoji: "🌾" },
{ value: "dairy_free", label: "Dairy Free", emoji: "🥛" }];


const FITNESS_GOALS = [
{ value: "lose_weight", label: "Lose Weight", emoji: "🔥" },
{ value: "build_muscle", label: "Build Muscle", emoji: "💪" },
{ value: "improve_endurance", label: "Improve Endurance", emoji: "🏃" },
{ value: "stay_healthy", label: "Stay Healthy", emoji: "❤️" },
{ value: "increase_flexibility", label: "Flexibility", emoji: "🧘" },
{ value: "sport_performance", label: "Sport Performance", emoji: "🏆" },
{ value: "stress_relief", label: "Stress Relief", emoji: "😌" },
{ value: "body_recomposition", label: "Body Recomposition", emoji: "⚡" }];


const TOTAL_STEPS = 5;

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    username: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    preferred_foods: [],
    fitness_goals: []
  });

  const toggleArr = (field, val) =>
  setData((prev) => ({
    ...prev,
    [field]: prev[field].includes(val) ?
    prev[field].filter((x) => x !== val) :
    [...prev[field], val]
  }));

  const canNext = () => {
    if (step === 0) return data.username.trim().length >= 2;
    if (step === 1) return data.age && data.height_cm && data.weight_kg;
    if (step === 2) return data.activity_level;
    if (step === 3) return data.preferred_foods.length > 0;
    if (step === 4) return data.fitness_goals.length > 0;
    return true;
  };

  const finish = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      ...data,
      age: Number(data.age),
      height_cm: Number(data.height_cm),
      weight_kg: Number(data.weight_kg),
      onboarding_complete: true
    });
    setSaving(false);
    onComplete();
  };

  const steps = [
  // Step 0 – Username
  <div key="username" className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-green-500/30">
          👋
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Welcome to VitalFlow!</h2>
        <p className="text-white/50 text-sm">Choose a username to get started</p>
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block">Your username</label>
        <input
        value={data.username}
        onChange={(e) => setData({ ...data, username: e.target.value })}
        placeholder="e.g. fitjohn99"
        className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3 placeholder:text-white/30 outline-none focus:border-green-500/50 text-base text-[#030303]"
        autoFocus />
      
        <p className="text-xs text-white/30 mt-2">This is how others will see you on VitalFlow.</p>
      </div>
    </div>,

  // Step 1 – Body stats
  <div key="stats" className="space-y-5">
      <div className="text-center space-y-1">
        <div className="text-3xl">📏</div>
        <h2 className="text-xl font-bold text-white">Your Body Stats</h2>
        <p className="text-white/50 text-sm">We'll use this to calculate accurate metrics</p>
      </div>
      {[
    { field: "age", label: "Age", placeholder: "25", unit: "yrs", type: "number" },
    { field: "height_cm", label: "Height", placeholder: "175", unit: "cm", type: "number" },
    { field: "weight_kg", label: "Weight", placeholder: "70", unit: "kg", type: "number" }].
    map(({ field, label, placeholder, unit, type }) =>
    <div key={field}>
          <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
          <div className="relative">
            <input
          type={type}
          value={data[field]}
          onChange={(e) => setData({ ...data, [field]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3 pr-14 text-white placeholder:text-white/30 outline-none focus:border-green-500/50 text-base" />
        
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
          </div>
        </div>
    )}
    </div>,

  // Step 2 – Activity level
  <div key="activity" className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-3xl">⚡</div>
        <h2 className="text-xl font-bold text-white">Activity Level</h2>
        <p className="text-white/50 text-sm">How active are you currently?</p>
      </div>
      <div className="space-y-2">
        {ACTIVITY_LEVELS.map((lvl) =>
      <button
        key={lvl.value}
        onClick={() => setData({ ...data, activity_level: lvl.value })}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left ${
        data.activity_level === lvl.value ?
        "bg-green-500/20 border-green-500/50 text-white" :
        "bg-white/5 border-white/10 text-white/70 hover:bg-white/8"}`
        }>
        
            <span className="text-2xl">{lvl.emoji}</span>
            <div>
              <p className="font-semibold text-sm">{lvl.label}</p>
              <p className="text-xs text-white/40">{lvl.desc}</p>
            </div>
            {data.activity_level === lvl.value &&
        <Check className="w-4 h-4 text-green-400 ml-auto" />
        }
          </button>
      )}
      </div>
    </div>,

  // Step 3 – Food preferences
  <div key="foods" className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-3xl">🥗</div>
        <h2 className="text-xl font-bold text-white">Food Preferences</h2>
        <p className="text-white/50 text-sm">Select all that apply</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FOOD_PREFS.map((pref) => {
        const selected = data.preferred_foods.includes(pref.value);
        return (
          <button
            key={pref.value}
            onClick={() => toggleArr("preferred_foods", pref.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
            selected ?
            "bg-green-500/20 border-green-500/50 text-white" :
            "bg-white/5 border-white/10 text-white/60 hover:bg-white/8"}`
            }>
            
              <span className="text-xl">{pref.emoji}</span>
              <span className="text-sm font-medium">{pref.label}</span>
              {selected && <Check className="w-3.5 h-3.5 text-green-400 ml-auto" />}
            </button>);

      })}
      </div>
    </div>,

  // Step 4 – Fitness goals
  <div key="goals" className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-3xl">🎯</div>
        <h2 className="text-xl font-bold text-white">Your Goals</h2>
        <p className="text-white/50 text-sm">What do you want to achieve?</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FITNESS_GOALS.map((goal) => {
        const selected = data.fitness_goals.includes(goal.value);
        return (
          <button
            key={goal.value}
            onClick={() => toggleArr("fitness_goals", goal.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
            selected ?
            "bg-blue-500/20 border-blue-500/50 text-white" :
            "bg-white/5 border-white/10 text-white/60 hover:bg-white/8"}`
            }>
            
              <span className="text-xl">{goal.emoji}</span>
              <span className="text-sm font-medium">{goal.label}</span>
              {selected && <Check className="w-3.5 h-3.5 text-blue-400 ml-auto" />}
            </button>);

      })}
      </div>
    </div>];


  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) =>
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? "w-8 bg-green-400" : i < step ? "w-4 bg-green-600" : "w-4 bg-white/15"}`
            } />

          )}
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}>
              
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-3">
            {step > 0 ?
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm transition-all">
              
                <ChevronLeft className="w-4 h-4" /> Back
              </button> :

            <div />
            }

            {step < TOTAL_STEPS - 1 ?
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ml-auto">
              
                Continue <ChevronRight className="w-4 h-4" />
              </button> :

            <button
              onClick={finish}
              disabled={!canNext() || saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-sm transition-all disabled:opacity-30 ml-auto shadow-lg shadow-green-500/30">
              
                {saving ? "Setting up..." : "🚀 Start My Journey"}
              </button>
            }
          </div>
        </div>

        {/* Step label */}
        <p className="text-center text-white/25 text-xs mt-4">Step {step + 1} of {TOTAL_STEPS}</p>
      </div>
    </div>);

}