import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { searchExercises, mapExercise, BODY_PARTS, loadDefaultExercises } from "@/lib/exerciseApi";
import ExerciseDetailModal from "@/components/fitness/ExerciseDetailModal";
import ExerciseGif from "@/components/fitness/ExerciseGif";

const BODY_PART_EMOJIS = {
  all: "⚡", back: "🔙", cardio: "🏃", chest: "🏋️",
  "lower arms": "🤝", "lower legs": "🦶", neck: "🧠",
  shoulders: "💪", "upper arms": "💪", "upper legs": "🦵", waist: "⚡",
};

export default function Explore() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    loadDefault();
  }, []);

  const loadDefault = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await loadDefaultExercises();
      setExercises(results.map(mapExercise));
    } catch {
      setError("Could not load exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async (q, bodyPart) => {
    setLoading(true);
    setError(null);
    try {
      const opts = bodyPart !== "all" ? { bodyPart } : {};
      const results = await searchExercises(q || "", opts);
      setExercises(results.map(mapExercise));
    } catch {
      setError("Could not load exercises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() && selectedBodyPart === "all") {
      loadDefault();
      return;
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedBodyPart);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedBodyPart]);

  const handleBodyPartChange = (bp) => {
    setSelectedBodyPart(bp);
    setQuery("");
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/8 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Explore Exercises</h1>
          <p className="text-xs text-white/40">1,300+ exercises with animated GIFs</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises..."
          className="pl-9 bg-white/8 border-white/10 text-white placeholder:text-white/35 h-11"
        />
      </div>

      {/* Body Part Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {BODY_PARTS.map((bp) => (
          <button
            key={bp}
            onClick={() => handleBodyPartChange(bp)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              selectedBodyPart === bp
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-white/8 text-white/50 hover:bg-white/12"
            }`}
          >
            <span>{BODY_PART_EMOJIS[bp]}</span>
            {bp}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">{error}</div>
      )}

      {/* Exercise List */}
      <div className="space-y-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
            <p className="text-white/30 text-sm">Loading exercises...</p>
          </div>
        )}

        {!loading && exercises.length === 0 && !error && (
          <div className="text-center py-10 text-white/30 text-sm">No exercises found</div>
        )}

        <AnimatePresence mode="popLayout">
          {!loading && exercises.map((ex, i) => (
            <motion.button
              key={ex.id + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.25) }}
              onClick={() => setSelected(ex)}
              className="w-full flex items-center gap-3 p-3 bg-[#161618] border border-white/8 rounded-2xl hover:border-blue-500/40 hover:bg-[#1a1a1f] transition-all active:scale-[0.98] text-left group"
            >
              <ExerciseGif exerciseId={ex.id} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm capitalize leading-snug">{ex.name}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ex.muscle && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium capitalize">{ex.muscle}</span>
                  )}
                  {ex.bodyPart && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40 capitalize">{ex.bodyPart}</span>
                  )}
                  {ex.equipment && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 capitalize">{ex.equipment}</span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <ExerciseDetailModal exercise={selected} onAdd={() => setSelected(null)} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}