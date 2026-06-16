import { useRef, useState, useEffect } from "react";
import { Moon, AlarmClock } from "lucide-react";

// Converts an "HH:MM" time into an angle on a 12-hour clock face (degrees, 0 = top/12 o'clock, clockwise).
function timeToAngle(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const hour12 = h % 12;
  return (hour12 * 60 + m) / 720 * 360; // 720 min = 12h = full circle
}

// Converts an angle back into an "HH:MM" time. Since the face is 12h, we keep
// the existing AM/PM half from the previous value so dragging stays in the same period.
function angleToTime(angle, prevTimeStr, snapMinutes = 5) {
  const [prevH] = prevTimeStr.split(":").map(Number);
  let totalMin = Math.round((angle / 360) * 720); // minutes within a 12h cycle
  totalMin = Math.round(totalMin / snapMinutes) * snapMinutes;
  totalMin = ((totalMin % 720) + 720) % 720;
  const isPM = prevH >= 12;
  let hour12 = Math.floor(totalMin / 60); // 0..11
  const min = totalMin % 60;
  let hour24 = hour12 + (isPM ? 12 : 0);
  if (hour24 === 24) hour24 = 12;
  return `${String(hour24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Builds an SVG arc path going clockwise from startAngle to endAngle.
function arcPath(cx, cy, r, startAngle, endAngle) {
  let sweep = endAngle - startAngle;
  if (sweep < 0) sweep += 360;
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function SleepClock({ bedtime, wakeTime, durationLabel, onChangeBedtime, onChangeWakeTime }) {
  const SIZE = 240;
  const C = SIZE / 2;
  const R = 96; // arc radius

  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // "bed" | "wake" | null

  const bedAngle = timeToAngle(bedtime);
  const wakeAngle = timeToAngle(wakeTime);
  const bedPos = polar(C, C, R, bedAngle);
  const wakePos = polar(C, C, R, wakeAngle);

  const majorLabels = [
    { n: 12, angle: 0 },
    { n: 3, angle: 90 },
    { n: 6, angle: 180 },
    { n: 9, angle: 270 }
  ];
  const ticks = Array.from({ length: 60 }, (_, i) => i * 6);

  // Maps a pointer event to an angle (0 = top, clockwise) relative to the SVG center.
  const pointerToAngle = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    let angle = Math.atan2(py - C, px - C) * (180 / Math.PI) + 90;
    return ((angle % 360) + 360) % 360;
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const point = e.touches ? e.touches[0] : e;
      const angle = pointerToAngle(point);
      if (dragging === "bed") {
        onChangeBedtime?.(angleToTime(angle, bedtime));
      } else {
        onChangeWakeTime?.(angleToTime(angle, wakeTime));
      }
    };
    const handleUp = () => setDragging(null);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, bedtime, wakeTime, onChangeBedtime, onChangeWakeTime]);

  return (
    <div className="relative mx-auto select-none" style={{ width: SIZE, height: SIZE }}>
      <svg ref={svgRef} width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="touch-none">
        <defs>
          <linearGradient id="sleepArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />

        {/* Sleep duration arc */}
        <path
          d={arcPath(C, C, R, bedAngle, wakeAngle)}
          fill="none"
          stroke="url(#sleepArc)"
          strokeWidth={14}
          strokeLinecap="round"
        />

        {/* Clock face ticks */}
        {ticks.map((angle, i) => {
          const isMajor = angle % 90 === 0;
          const isHour = angle % 30 === 0;
          const outer = polar(C, C, R - 26, angle);
          const inner = polar(C, C, R - (isHour ? 33 : 30), angle);
          return (
            <line
              key={i}
              x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke={isMajor ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}
              strokeWidth={isHour ? 1.5 : 1}
            />
          );
        })}

        {/* Hour numbers */}
        {majorLabels.map(({ n, angle }) => {
          const pos = polar(C, C, R - 46, angle);
          return (
            <text
              key={n}
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.45)" fontSize="12" fontWeight="600">
              {n}
            </text>
          );
        })}
      </svg>

      {/* Center duration */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-3xl font-black text-white tabular-nums leading-none">{durationLabel}</p>
        <p className="text-xs text-white/40 mt-2">sleep duration</p>
      </div>

      {/* Bedtime moon marker (draggable) */}
      <div
        onPointerDown={(e) => { e.preventDefault(); setDragging("bed"); }}
        onTouchStart={() => setDragging("bed")}
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-4 ring-[#111] cursor-grab touch-none transition-transform ${dragging === "bed" ? "cursor-grabbing scale-110" : "hover:scale-105"}`}
        style={{ left: bedPos.x, top: bedPos.y }}>
        <Moon className="w-4 h-4 text-white pointer-events-none" />
      </div>

      {/* Wake alarm marker (draggable) */}
      <div
        onPointerDown={(e) => { e.preventDefault(); setDragging("wake"); }}
        onTouchStart={() => setDragging("wake")}
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-4 ring-[#111] cursor-grab touch-none transition-transform ${dragging === "wake" ? "cursor-grabbing scale-110" : "hover:scale-105"}`}
        style={{ left: wakePos.x, top: wakePos.y }}>
        <AlarmClock className="w-4 h-4 text-white pointer-events-none" />
      </div>
    </div>
  );
}