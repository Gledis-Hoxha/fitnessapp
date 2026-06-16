import { useState } from "react";
import { format, subDays } from "date-fns";
import { Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceDot
} from "recharts";
import { base44 } from "@/api/base44Client";

const TABS = [
  { key: "bed", label: "Went to bed" },
  { key: "asleep", label: "Fell Asleep" },
  { key: "wake", label: "Woke up" }
];

// Parse "Bedtime: 22:30 | Wake: 06:30 | ..." note into minutes-from-midnight.
function parseNote(note = "") {
  const bed = note.match(/Bedtime:\s*(\d{1,2}):(\d{2})/);
  const wake = note.match(/Wake:\s*(\d{1,2}):(\d{2})/);
  return {
    bedMin: bed ? Number(bed[1]) * 60 + Number(bed[2]) : null,
    wakeMin: wake ? Number(wake[1]) * 60 + Number(wake[2]) : null
  };
}

// For "went to bed", late-evening times (e.g. 23:00) should sit near the top and
// after-midnight times (00:30) just below. We chart bedtime as minutes where
// evening hours stay 21:00–23:59 and 00:00–02:59 wrap above as 24:00–26:59.
function bedAxisValue(min) {
  if (min == null) return null;
  return min < 720 ? min + 1440 : min; // < 12:00 treated as next-day early morning
}

function fmtTime(min) {
  if (min == null) return "—";
  const norm = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(norm / 60)).padStart(2, "0")}:${String(norm % 60).padStart(2, "0")}`;
}

export default function SleepSummaryCard() {
  const [tab, setTab] = useState("bed");
  const { data: sleepLogs = [] } = useQuery({
    queryKey: ["sleep"],
    queryFn: () => base44.entities.FitnessActivity.filter({ activity_type: "sleep" }, "-date", 14)
  });

  // Last 7 nights aligned to calendar days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const log = sleepLogs.find((s) => s.date === dateStr);
    const { bedMin, wakeMin } = parseNote(log?.notes);
    return { date, dateStr, label: format(date, "d"), bedMin, wakeMin };
  });

  // Build the series for the active tab.
  const data = days.map((d) => {
    let value = null;
    if (tab === "wake") value = d.wakeMin;
    else value = bedAxisValue(d.bedMin); // "bed" and "asleep" both use bedtime
    return { label: d.label, value, rawBed: d.bedMin, rawWake: d.wakeMin };
  });

  const points = data.filter((d) => d.value != null);
  const hasData = points.length > 0;

  // Highlight the most recent night that has a value.
  const lastIdx = [...data].map((d, i) => ({ d, i })).filter((x) => x.d.value != null).pop()?.i ?? null;
  const highlight = lastIdx != null ? data[lastIdx] : null;
  const highlightTime = highlight
    ? fmtTime(tab === "wake" ? highlight.rawWake : highlight.rawBed)
    : null;

  // Y axis range padded around the data
  const vals = points.map((p) => p.value);
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 1440;
  const yMin = Math.floor((min - 60) / 30) * 30;
  const yMax = Math.ceil((max + 60) / 30) * 30;

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-500/15">
          <Moon className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-white">Sleep</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-xs font-semibold py-2 rounded-full border transition-colors ${
              tab === t.key
                ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 24, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false} />
            <YAxis
              domain={[yMin, yMax]}
              ticks={Array.from({ length: Math.round((yMax - yMin) / 30) + 1 }, (_, i) => yMin + i * 30)}
              tickFormatter={fmtTime}
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false}
              tickLine={false}
              width={48} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#818cf8"
              strokeWidth={2.5}
              fill="url(#sleepFill)"
              connectNulls
              dot={{ r: 4, fill: "hsl(248,20%,15%)", stroke: "#818cf8", strokeWidth: 2 }}
              activeDot={{ r: 5 }} />
            {highlight && (
              <ReferenceDot
                x={highlight.label}
                y={highlight.value}
                r={5}
                fill="#6366f1"
                stroke="#fff"
                strokeWidth={2}
                label={{
                  value: highlightTime,
                  position: "top",
                  fill: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  offset: 12
                }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[180px] flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-white/50">No sleep logged yet</p>
          <p className="text-xs text-white/30 mt-1">Log sleep on the Fitness page to see your trend</p>
        </div>
      )}
    </div>
  );
}