import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowLeft, Loader2, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchFoods, mapFoodItem, isUsdaApiConfigured, setUsdaApiKey } from "@/lib/usdaApi";
import ApiKeySetupModal from "@/components/shared/ApiKeySetupModal";

function MacroRow({ label, value, unit = "g", color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {value != null && value !== 0 ? `${value} ${unit}` : "—"}
      </span>
    </div>
  );
}

function FoodDetail({ food, onConfirm, onBack }) {
  const [grams, setGrams] = useState(food.servingSize || 100);
  const g = Math.max(0, Number(grams) || 0);
  const factor = g / 100;

  const cal = Math.round((food.calories_per100 || 0) * factor);
  const protein = +((food.protein_per100 || 0) * factor).toFixed(1);
  const carbs = +((food.carbs_per100 || 0) * factor).toFixed(1);
  const fat = +((food.fat_per100 || 0) * factor).toFixed(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-snug capitalize">{food.name.toLowerCase()}</h3>
          {food.brandOwner && <p className="text-xs text-white/35 truncate">{food.brandOwner}</p>}
        </div>
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
        <MacroRow label="Protein" value={protein} color="text-blue-400" />
        <MacroRow label="Carbs" value={carbs} color="text-yellow-400" />
        <MacroRow label="Fat" value={fat} color="text-orange-400" />
      </div>

      <Button
        onClick={() => onConfirm(food, g, cal, protein, carbs, fat)}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
      >
        Add {food.name.split(",")[0]}
      </Button>
    </div>
  );
}

export default function FoodSearchModal({ onClose, onAdd, mealType }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showSetup, setShowSetup] = useState(!isUsdaApiConfigured());
  const debounceRef = useRef(null);

  const doSearch = async (q, p = 1, append = false) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await searchFoods(q, 20, p);
      const items = (data.foods || []).map(mapFoodItem);
      if (append) {
        setResults((prev) => [...prev, ...items]);
      } else {
        setResults(items);
      }
      setHasMore(items.length === 20);
    } catch {
      setError("Could not reach USDA food database. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, 1, false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    doSearch(query, next, true);
  };

  const handleConfirm = (food, grams, calories, protein, carbs, fat) => {
    onAdd({
      food_name: food.name.split(",")[0],
      meal_type: mealType,
      serving_size: `${grams}g`,
      calories: calories || 0,
      protein_g: protein || 0,
      carbs_g: carbs || 0,
      fat_g: fat || 0,
      date: new Date().toISOString().split("T")[0],
    });
    // Small delay so mutation fires before closing
    setTimeout(onClose, 50);
  };

  return (
    <>
    {showSetup && (
      <AnimatePresence>
        <ApiKeySetupModal
          type="food"
          onClose={() => setShowSetup(false)}
          onSaved={() => setShowSetup(false)}
        />
      </AnimatePresence>
    )}
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
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl"
        style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        {selected ? (
          <FoodDetail food={selected} onConfirm={handleConfirm} onBack={() => setSelected(null)} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">Add Food</h3>
                <p className="text-xs text-white/35">USDA database · 300k+ items</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowSetup(true)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Configure API Key">
                  <Key className="w-4 h-4 text-white/40" />
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            <div className="relative mb-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 300,000+ foods..."
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 -mx-1 px-1">
              {error && (
                <p className="text-red-400 text-xs text-center py-4">{error}</p>
              )}

              {!query.trim() && !loading && (
                <p className="text-white/25 text-sm text-center py-8">
                  Start typing to search the USDA food database
                </p>
              )}

              <div className="space-y-1">
                {results.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelected(food)}
                    className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/8 transition-colors text-left"
                  >
                    <span className="text-xl mt-0.5">🍽️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white capitalize truncate">
                        {food.name.split(",")[0].toLowerCase()}
                      </p>
                      <p className="text-xs text-white/35 truncate">
                        {food.brandOwner || food.foodCategory || "Generic"}
                        {food.calories_per100 ? ` · ${food.calories_per100} kcal/100g` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-white/30 flex-shrink-0 mt-1">
                      {food.calories_per100 ? `${food.calories_per100} cal` : ""}
                    </span>
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                </div>
              )}

              {!loading && hasMore && results.length > 0 && (
                <button
                  onClick={loadMore}
                  className="w-full py-3 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Load more results
                </button>
              )}

              {!loading && results.length === 0 && query.trim().length >= 2 && !error && (
                <p className="text-white/30 text-sm text-center py-6">No foods found for "{query}"</p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
    </>
  );
}