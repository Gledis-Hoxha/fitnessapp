import { Moon, AlarmClock, Pencil } from "lucide-react";

// Formats "HH:MM" (24h) into a clock display with AM/PM, matching the screenshots.
function formatDisplay(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  return { time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, period };
}

const ACCENTS = {
  indigo: { icon: "text-indigo-400", iconBg: "bg-indigo-500/15" },
  amber: { icon: "text-amber-400", iconBg: "bg-amber-500/15" }
};

export default function TimeSummaryCard({ type = "bedtime", value, onEdit }) {
  const isBed = type === "bedtime";
  const accent = ACCENTS[isBed ? "indigo" : "amber"];
  const Icon = isBed ? Moon : AlarmClock;
  const label = isBed ? "Bedtime" : "Alarm";
  const { time, period } = formatDisplay(value);

  return (
    <button
      onClick={onEdit}
      className="text-left rounded-2xl bg-white/[0.04] border border-white/8 p-4 hover:bg-white/[0.06] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${accent.iconBg}`}>
            <Icon className={`w-3.5 h-3.5 ${accent.icon}`} />
          </div>
          <span className="text-sm font-medium text-white/70">{label}</span>
        </div>
        <Pencil className="w-3.5 h-3.5 text-white/30" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white tabular-nums">{time}</span>
        <span className="text-xs font-semibold text-white/40">{period}</span>
      </div>
    </button>
  );
}