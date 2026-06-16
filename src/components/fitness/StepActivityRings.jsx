import { Footprints } from "lucide-react";

// A rounded-square (squircle) progress ring drawn with SVG stroke-dasharray.
function SquircleRing({ size, inset, color, track, progress }) {
  const s = size - inset * 2;
  const r = s * 0.32; // corner radius
  const x = inset;
  const y = inset;
  // Approximate perimeter of a rounded rectangle
  const straight = 2 * (s - 2 * r) + 2 * (s - 2 * r);
  const corners = 2 * Math.PI * r;
  const perimeter = straight + corners;
  const dash = (Math.min(100, progress) / 100) * perimeter;
  const strokeW = 14;

  return (
    <g>
      <rect
        x={x} y={y} width={s} height={s} rx={r} ry={r}
        fill="none" stroke={track} strokeWidth={strokeW}
      />
      <rect
        x={x} y={y} width={s} height={s} rx={r} ry={r}
        fill="none" stroke={color} strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${perimeter}`}
        style={{ transition: "stroke-dasharray 0.8s ease-out" }}
      />
    </g>
  );
}

export default function StepActivityRings({ stepsProgress = 0, distanceProgress = 0, caloriesProgress = 0 }) {
  const SIZE = 220;
  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 origin-center">
        {/* Outer ring — steps (orange) */}
        <SquircleRing size={SIZE} inset={12} color="#f97316" track="rgba(255,255,255,0.06)" progress={stepsProgress} />
        {/* Middle ring — distance (light gray) */}
        <SquircleRing size={SIZE} inset={44} color="#d4d4d8" track="rgba(255,255,255,0.05)" progress={distanceProgress} />
        {/* Inner ring — calories (blue) */}
        <SquircleRing size={SIZE} inset={76} color="#3b82f6" track="rgba(255,255,255,0.05)" progress={caloriesProgress} />
      </svg>
      {/* Center footprints */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/8 flex items-center justify-center">
          <Footprints className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}