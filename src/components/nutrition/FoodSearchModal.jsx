import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Food database — calories/macros per 100g, left blank for user to fill later
export const FOODS = [
  { id: "eggs",    name: "Eggs",    emoji: "🥚", calories_per100: 0, protein_per100: 0, carbs_per100: 0, fat_per100: 0, unit: "g" },
  { id: "cheese",  name: "Cheese",  emoji: "🧀", calories_per100: 0, protein_per100: 0, carbs_per100: 0, fat_per100: 0, unit: "g" },
  { id: "chicken", name: "Chicken", emoji: "🍗", calories_per100: 0, protein_per100: 0, carbs_per100: 0, fat_per100: 0, unit: "g" },
  { id: "banana",  name: "Banana",  emoji: "🍌", calories_per100: 0, protein_per100: 0, carbs_per100: 0, fat_per100: 0, unit: "g" },
  { id: "fish",    name: "Fish",    emoji: "🐟", calories_per100: 0, protein_per100: 0, carbs_per100: 0, fat_per100: 0, unit: "g" },
];

function MacroRow({ label, value, unit = "g", color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value ?? "—"}{value != null ? ` ${unit}` : ""}</span>
    </div>
  );
}

function FoodDetail({ food, onConfirm, onBack }) {
  const [grams, setGrams] = useState(100);
  const g = Math.max(0, Number(grams) || 0);
  const factor = g / 100;
  const cal = food.calories_per100 ? Math.round(food.calories_per100 * factor) : null;
  const protein = food.protein_per100 ? +(food.protein_per100 * factor).toFixed(1) : null;
  const carbs = food.carbs_per100 ? +(food.carbs_per100 * factor).toFixed(1) : null;
  const fat = food.fat_per100 ? +(food.fat_per100 * factor).toFixed(1) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-2xl">{food.emoji}</span>
        <h3 className="text-lg font-bold text-white">{food.name}</h3>
      </div>

      <div className="mb-4">
        <label className="text-xs text-white/60 mb-1 block">Amount (grams)</label>
        <Input
          type="number"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-lg font-semibold"
          min={0}
          autoFocus
        />
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-1 mb-6">
        <MacroRow label="Calories" value={cal} unit="kcal" color="text-green-400" />
        <MacroRow label="Protein"  value={protein} color="text-blue-400" />
        <MacroRow label="Carbs"    value={carbs}   color="text-yellow-400" />
        <MacroRow label="Fat"      value={fat}      color="text-orange-400" />
      </div>

      {food.calories_per100 === 0 && (
        <p className="text-xs text-white/40 text-center mb-4">Nutritional values will be filled in soon.</p>
      )}

      <Button
        onClick={() => onConfirm(food, g, cal, protein, carbs, fat)}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
      >
        Add {food.name}
      </Button>
    </div>
  );
}

export default function FoodSearchModal({ onClose, onAdd, mealType }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = FOODS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  const handleConfirm = (food, grams, calories, protein, carbs, fat) => {
    onAdd({
      food_name: food.name,
      meal_type: mealType,
      serving_size: `${grams}g`,
      calories: calories || 0,
      protein_g: protein || 0,
      carbs_g: carbs || 0,
      fat_g: fat || 0,
      date: new Date().toISOString().split("T")[0],
    });
    onClose();
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
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[420px]"
      >
        {selected ? (
          <FoodDetail food={selected} onConfirm={handleConfirm} onBack={() => setSelected(null)} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add Food</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods..."
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              {filtered.map((food, i) => (
                <button
                  key={food.id}
                  onClick={() => setSelected(food)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  <span className="text-xl w-8 text-center">{food.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{food.name}</p>
                    <p className="text-xs text-white/40">per 100g</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}