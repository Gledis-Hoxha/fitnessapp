import { useRef, useEffect, useCallback } from "react";

const ITEM_HEIGHT = 48;

// A single vertical scroll-snap wheel of zero-padded numbers (0..max).
export default function TimeWheel({ values, value, onChange }) {
  const ref = useRef(null);
  const scrollTimer = useRef(null);

  // Sync scroll position to the selected value
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx < 0) return;
    const target = idx * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 2) {
      el.scrollTop = target;
    }
  }, [value, values]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
      const next = values[clamped];
      if (next !== value) onChange(next);
    }, 120);
  }, [values, value, onChange]);

  return (
    <div className="relative h-[240px] flex-1 overflow-hidden">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none" }}>
        {/* top + bottom padding so first/last item can center */}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
        {values.map((v) => {
          const active = v === value;
          return (
            <div
              key={v}
              className="snap-center flex items-center justify-center"
              style={{ height: ITEM_HEIGHT }}>
              <span
                className={`tabular-nums transition-all ${
                  active
                    ? "text-3xl font-bold text-indigo-400"
                    : "text-2xl font-medium text-white/30"
                }`}>
                {String(v).padStart(2, "0")}
              </span>
            </div>
          );
        })}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>

      {/* center selection lines */}
      <div className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[48px] border-y border-indigo-500/40" />
    </div>
  );
}