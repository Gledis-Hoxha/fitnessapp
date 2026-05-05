import { startOfWeek, addDays, format, isToday, isBefore, startOfDay } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyStreak({ loggedDates = [] }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const loggedSet = new Set(loggedDates);

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Weekly Streak</p>
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, i) => {
          const date = addDays(monday, i);
          const dateStr = format(date, "yyyy-MM-dd");
          const logged = loggedSet.has(dateStr);
          const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
          const isCurrentDay = isToday(date);

          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-white/40 font-medium">{day}</span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  logged
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : isCurrentDay
                    ? "border-2 border-green-500 text-green-400"
                    : isPast
                    ? "bg-white/5 text-white/20"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {logged ? "✓" : format(date, "d")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}