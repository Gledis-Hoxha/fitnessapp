import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dumbbell, Loader2 } from "lucide-react";

const gifCache = new Map();

export default function ExerciseGif({ exerciseId, className = "" }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!exerciseId) { setFailed(true); return; }
    if (gifCache.has(exerciseId)) {
      setDataUrl(gifCache.get(exerciseId));
      return;
    }
    let cancelled = false;
    setLoading(true);
    base44.functions.invoke("getExerciseGif", { exerciseId })
      .then((res) => {
        if (cancelled) return;
        const url = res.data?.dataUrl;
        if (url) {
          gifCache.set(exerciseId, url);
          setDataUrl(url);
        } else {
          setFailed(true);
        }
      })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [exerciseId]);

  return (
    <div className={`rounded-xl overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center ${className || "w-16 h-16"}`}>
      {loading ? (
        <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
      ) : dataUrl ? (
        <img src={dataUrl} alt="Exercise" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <Dumbbell className="w-6 h-6 text-muted-foreground/40" />
      )}
    </div>
  );
}