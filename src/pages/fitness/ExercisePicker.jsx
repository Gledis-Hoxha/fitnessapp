import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Loader2, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import ExerciseGif from "@/components/fitness/ExerciseGif";
import { searchExercises, mapExercise, BODY_PARTS, loadDefaultExercises } from "@/lib/exerciseApi";

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
      {/* Header with inline search */}
      <div className="flex items-center gap-3">
        




        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises (e.g. squat, bench...)"
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 focus:border-primary/50"
            autoFocus />
        </div>
      </div>

      {/* Body Part Filter */}
      <div className="flex flex-wrap gap-2">
        {BODY_PARTS.map((bp) => (
          <button
            key={bp}
            onClick={() => handleBodyPartChange(bp)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
              selectedBodyPart === bp
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-secondary border-white/5 text-muted-foreground hover:text-foreground hover:border-white/10"
            }`}
          >
            {bp === "all" ? "All" : bp}
          </button>
          ))}
          </div>

      {/* Error */}
      {error &&
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-sm text-center">
          {error}
        </div>
      }

      {/* Exercise List */}
      <div className="space-y-2">
        {loading &&
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Loading exercises...</p>
          </div>
        }

        {!loading && exercises.length === 0 && !error &&
        <div className="text-center py-12">
            <Dumbbell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No exercises found</p>
            <p className="text-muted-foreground/50 text-xs mt-1">Try a different search term</p>
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
            className="w-full flex items-center gap-3 p-3 bg-secondary border border-border rounded-2xl hover:border-primary/30 hover:bg-secondary/80 transition-all active:scale-[0.98] text-left group">
            
              {/* Exercise GIF — lazily loaded via backend proxy */}
              <ExerciseGif exerciseId={ex.id} />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm capitalize leading-snug">{ex.name}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ex.muscle &&
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {ex.muscle}
                    </span>
                }
                  {ex.bodyPart &&
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {ex.bodyPart}
                    </span>
                }
                  {ex.equipment &&
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground/60 capitalize">
                      {ex.equipment}
                    </span>
                }
                </div>
              </div>

              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <Plus className="w-4 h-4 text-primary" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>);

}