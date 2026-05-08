import { useState } from "react";
import { startOfWeek, addDays, format, isToday, isBefore, startOfDay } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyStreak({ loggedDates = [], selectedDate, onSelectDate }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const loggedSet = new Set(loggedDates);

  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">This Week</p>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day, i) => {
          const date = addDays(monday, i);
          const dateStr = format(date, "yyyy-MM-dd");
          const logged = loggedSet.has(dateStr);
          const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
          const isCurrentDay = isToday(date);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => onSelectDate?.(isSelected ? null : dateStr)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="text-[10px] text-white/30 font-medium">{day}</span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected && logged
                    ? "bg-green-400 text-black scale-110 shadow-lg shadow-green-500/40"
                    : isSelected
                    ? "ring-2 ring-white/50 bg-white/10 text-white scale-110"
                    : logged
                    ? "bg-green-500 text-white shadow-md shadow-green-500/25"
                    : isCurrentDay
                    ? "border border-green-500/60 text-green-400"
                    : isPast
                    ? "bg-white/4 text-white/15"
                    : "bg-white/4 text-white/25 group-hover:bg-white/10"
                }`}
              >
                {logged ? "✓" : format(date, "d")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}