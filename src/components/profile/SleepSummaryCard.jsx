import { format, subDays } from "date-fns";
import { Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const SLEEP_GOAL_MIN = 480; // 8h target

function fmtDur(min) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default function SleepSummaryCard() {
  const { data: sleepLogs = [] } = useQuery({
    queryKey: ["sleep"],
    queryFn: () => base44.entities.FitnessActivity.filter({ activity_type: "sleep" }, "-date", 14)
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Last 7 nights, aligned to calendar days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const log = sleepLogs.find((s) => s.date === dateStr);
    return { date, isToday: dateStr === todayStr, minutes: log?.duration_minutes || 0 };
  });

  const logged = days.filter((d) => d.minutes > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, d) => a + d.minutes, 0) / logged.length) : 0;
  const todayLog = days.find((d) => d.isToday);
  const maxMin = Math.max(SLEEP_GOAL_MIN, ...days.map((d) => d.minutes));

  return (
    <div className="border border-white/10 rounded-2xl p-4" style={{ background: "hsl(248,20%,15%)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15">
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-white">Sleep</p>
        </div>
        <span className="text-xs text-white/35">7-day avg {avg ? fmtDur(avg) : "—"}</span>
      </div>

      {/* Today / latest */}
      <div className="mb-3">
        {todayLog?.minutes ? (
          <>
            <p className="text-3xl font-black text-white tabular-nums leading-none">{fmtDur(todayLog.minutes)}</p>
            <p className="text-xs text-white/35 mt-1">
              last night · {Math.min(100, Math.round((todayLog.minutes / SLEEP_GOAL_MIN) * 100))}% of 8h goal
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-white/50 leading-none">No sleep logged</p>
            <p className="text-xs text-white/30 mt-1">Log sleep on the Fitness page</p>
          </>
        )}
      </div>

      {/* 7-day bars */}
      <div className="flex items-end justify-between gap-1.5 h-20">
        {days.map((d, i) => {
          const h = d.minutes ? Math.max(6, Math.round((d.minutes / maxMin) * 100)) : 4;
          const hitGoal = d.minutes >= SLEEP_GOAL_MIN;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full rounded-md transition-all ${
                  !d.minutes ? "bg-white/5" : d.isToday ? "bg-indigo-400" : hitGoal ? "bg-indigo-500/70" : "bg-indigo-500/40"
                }`}
                style={{ height: `${h}%` }} />
              <span className={`text-[10px] ${d.isToday ? "text-indigo-400 font-semibold" : "text-white/30"}`}>
                {format(d.date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}