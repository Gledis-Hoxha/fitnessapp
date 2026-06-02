import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Loader2, ChevronDown, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { searchExercises, getExercisesByBodyPart, getBodyPartList, getExercises, mapExercise, isExerciseApiConfigured } from "@/lib/exerciseApi";
import ExerciseDetailModal from "@/components/fitness/ExerciseDetailModal";
import ApiKeySetupModal from "@/components/shared/ApiKeySetupModal";

const LIMIT = 20;

export default function Explore() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showSetup, setShowSetup] = useState(!isExerciseApiConfigured());

  useEffect(() => {
    if (!isExerciseApiConfigured()) return;
    getBodyPartList().then((list) => setBodyParts(["all", ...list])).catch(() => {});
    loadExercises(0, "all", "");
  }, []);

  const loadExercises = useCallback(async (off, bodyPart, q) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (q.trim().length >= 2) {
        data = await searchExercises(q, 30);
      } else if (bodyPart !== "all") {
        data = await getExercisesByBodyPart(bodyPart, LIMIT);
      } else {
        data = await getExercises(LIMIT, off);
      }
      const mapped = data.map(mapExercise);
      if (off === 0) setExercises(mapped);
      else setExercises((prev) => [...prev, ...mapped]);
      setHasMore(mapped.length === LIMIT && !q.trim());
    } catch {
      setError("Could not load exercises. Check your RapidAPI key.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) { loadExercises(0, selectedBodyPart, ""); setOffset(0); return; }
    if (query.trim().length < 2) return;
    const t = setTimeout(() => { loadExercises(0, selectedBodyPart, query); setOffset(0); }, 400);
    return () => clearTimeout(t);
  }, [query, selectedBodyPart]);

  const handleBodyPartChange = (bp) => {
    setSelectedBodyPart(bp); setOffset(0); setQuery(""); loadExercises(0, bp, "");
  };

  const loadMore = () => {
    const next = offset + LIMIT;
    setOffset(next);
    loadExercises(next, selectedBodyPart, query);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Explore Exercises</h1>
          <p className="text-xs text-white/40">1300+ exercises from ExerciseDB</p>
        </div>
        <button onClick={() => setShowSetup(true)} className="ml-auto p-2 rounded-xl hover:bg-white/10 transition-colors">
          <Key className="w-4 h-4 text-white/40" />
        </button>
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
        {bodyParts.map((bp) => (
          <button
            key={bp}
            onClick={() => handleBodyPartChange(bp)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              selectedBodyPart === bp ? "bg-primary text-white" : "bg-white/8 text-white/50 hover:bg-white/12"
            }`}
          >
            {bp}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">{error}</div>
      )}

      {/* No API key state */}
      {!isExerciseApiConfigured() && !showSetup && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-white/40 text-sm mb-3">Connect ExerciseDB to browse 1300+ exercises</p>
          <button onClick={() => setShowSetup(true)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
            Add API Key
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {exercises.map((ex, i) => (
            <motion.button
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setSelected(ex)}
              className="w-full flex items-center gap-3 p-3 bg-[#1a1a1e] border border-white/8 rounded-2xl hover:border-primary/40 transition-all active:scale-[0.98] text-left"
            >
              {ex.gifUrl ? (
                <img src={ex.gifUrl} alt={ex.name} className="w-12 h-12 rounded-xl object-cover bg-white/5 flex-shrink-0" loading="lazy" />
              ) : (
                <span className="text-2xl w-12 text-center flex-shrink-0">{ex.emoji}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm capitalize truncate">{ex.name}</p>
                <p className="text-xs text-white/40 capitalize mt-0.5">{ex.muscle} · {ex.bodyPart} · {ex.equipment}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!loading && hasMore && exercises.length > 0 && (
          <button onClick={loadMore} className="w-full flex items-center justify-center gap-2 py-3 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ChevronDown className="w-4 h-4" /> Load more
          </button>
        )}

        {!loading && exercises.length === 0 && !error && isExerciseApiConfigured() && (
          <div className="text-center py-10 text-white/30 text-sm">No exercises found</div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <ExerciseDetailModal exercise={selected} onAdd={() => setSelected(null)} onClose={() => setSelected(null)} />
        )}
        {showSetup && (
          <ApiKeySetupModal
            type="exercise"
            onClose={() => setShowSetup(false)}
            onSaved={() => {
              setShowSetup(false);
              getBodyPartList().then((list) => setBodyParts(["all", ...list])).catch(() => {});
              loadExercises(0, "all", "");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}