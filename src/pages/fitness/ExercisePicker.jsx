import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Search, Loader2, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { searchExercises, mapExercise, BODY_PARTS, loadDefaultExercises } from "@/lib/exerciseApi";

const BODY_PART_EMOJIS = {
  all: "⚡",
  back: "🔙",
  cardio: "🏃",
  chest: "🏋️",
  "lower arms": "🤝",
  "lower legs": "🦶",
  neck: "🧠",
  shoulders: "💪",
  "upper arms": "💪",
  "upper legs": "🦵",
  waist: "⚡"
};

export default function ExercisePicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/fitness/start-workout";

  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Load default exercises on mount
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
      setError("Search is busy right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() && selectedBodyPart === "all") {
      loadDefault();
      return;
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedBodyPart);
    }, 400);
  }, [query, selectedBodyPart]);

  const handleBodyPartChange = (bp) => {
    setSelectedBodyPart(bp);
    setQuery("");
  };

  const handlePick = (exercise) => {
    navigate(returnTo, { state: { addedExercise: exercise } });
  };

  return (
    <div className="flex flex-col min-h-0 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white hidden">Choose Exercise</h1>
          <p className="text-xs text-white/40 hidden">1,300+ exercises with animated demos</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises (e.g. squat, curl, bench...)"
          className="pl-9 bg-white border-white/20 text-black placeholder:text-black/40 h-11"
          autoFocus />
        
      </div>

      {/* Body Part Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {BODY_PARTS.map((bp) =>
        <button
          key={bp}
          onClick={() => handleBodyPartChange(bp)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
          selectedBodyPart === bp ?
          "bg-blue-500 text-white shadow-lg shadow-blue-500/25" :
          "bg-white/8 text-white/50 hover:bg-white/12"}`
          }>
          
            <span>{BODY_PART_EMOJIS[bp]}</span>
            {bp}
          </button>
        )}
      </div>

      {/* Error */}
      {error &&
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
          {error}
        </div>
      }

      {/* Exercise List */}
      <div className="space-y-2">
        {loading &&
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
            <p className="text-white/30 text-sm">Loading exercises...</p>
          </div>
        }

        {!loading && exercises.length === 0 && !error &&
        <div className="text-center py-12">
            <Dumbbell className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No exercises found</p>
            <p className="text-white/20 text-xs mt-1">Try a different search term</p>
          </div>
        }

        <AnimatePresence mode="popLayout">
          {!loading && exercises.map((ex, i) =>
          <motion.button
            key={ex.id + i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: Math.min(i * 0.025, 0.25) }}
            onClick={() => handlePick(ex)}
            className="w-full flex items-center gap-3 p-3 bg-[#161618] border border-white/8 rounded-2xl hover:border-blue-500/40 hover:bg-[#1a1a1f] transition-all active:scale-[0.98] text-left group">
            
              {/* GIF / Fallback */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                {ex.gifUrl ?
              <img
                src={ex.gifUrl}
                alt={ex.name}
                className="w-full h-full object-cover"
                loading="lazy" /> :


              <span className="text-2xl">{ex.emoji}</span>
              }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm capitalize leading-snug">{ex.name}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ex.muscle &&
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium capitalize">
                      {ex.muscle}
                    </span>
                }
                  {ex.bodyPart &&
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40 capitalize">
                      {ex.bodyPart}
                    </span>
                }
                  {ex.equipment &&
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 capitalize">
                      {ex.equipment}
                    </span>
                }
                </div>
              </div>

              <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                <Plus className="w-4 h-4 text-blue-400" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>);

}