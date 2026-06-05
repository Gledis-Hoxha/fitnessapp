import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function WorkoutTimer({ startedAt, onFinish, onEnd }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="font-mono font-bold text-lg tracking-widest">{formatTime(elapsed)}</span>
          <span className="text-xs text-primary-foreground/70 ml-1">Workout in progress</span>
        </div>
        <div className="flex items-center gap-2">
          {onEnd && (
            <Button
              size="sm"
              onClick={onEnd}
              className="bg-red-500/20 text-white hover:bg-red-500/30 font-semibold gap-1.5 text-xs"
            >
              <XCircle className="w-4 h-4" />
              End
            </Button>
          )}
          <Button
            size="sm"
            onClick={onFinish}
            className="bg-white text-primary hover:bg-white/90 font-semibold gap-1.5 text-xs"
          >
            <CheckCircle className="w-4 h-4" />
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
}