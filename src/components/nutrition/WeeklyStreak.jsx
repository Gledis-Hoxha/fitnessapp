import { useState } from "react";
import { startOfWeek, addDays, format, isToday, isBefore, startOfDay } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarModal({ loggedDates, selectedDate, onSelectDate, onClose }) {
  const loggedSet = new Set(loggedDates);
  // Show last 5 weeks + next 1 week
  const today = new Date();
  const weeks = [];
  for (let w = -4; w <= 1; w++) {
    const monday = startOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() + w * 7), { weekStartsOn: 1 });
    weeks.push(monday);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl p-5 w-full max-w-sm">
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Nutrition Calendar</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-white/50" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => <p key={d} className="text-[10px] text-white/25 text-center font-medium">{d[0]}</p>)}
        </div>
        <div className="space-y-1">
          {weeks.map((monday, wi) =>
          <div key={wi} className="grid grid-cols-7 gap-1">
              {DAYS.map((_, di) => {
              const date = addDays(monday, di);
              const dateStr = format(date, "yyyy-MM-dd");
              const logged = loggedSet.has(dateStr);
              const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
              const isCurrentDay = isToday(date);
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={di}
                  onClick={() => {onSelectDate?.(isSelected ? null : dateStr);onClose();}}
                  className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                  isSelected ? "bg-green-400 text-black scale-110" :
                  logged ? "bg-green-500/80 text-white" :
                  isCurrentDay ? "border border-green-500/60 text-green-400" :
                  isPast ? "text-white/15" : "text-white/30 hover:bg-white/10"}`
                  }>
                  
                    {logged ? "✓" : format(date, "d")}
                  </button>);

            })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-[10px] text-white/40">Logged</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-green-500/60" /><span className="text-[10px] text-white/40">Today</span></div>
        </div>
      </motion.div>
    </motion.div>);

}

export default function WeeklyStreak({ loggedDates = [], selectedDate, onSelectDate }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const loggedSet = new Set(loggedDates);
  const weekLogged = DAYS.filter((_, i) => loggedSet.has(format(addDays(monday, i), "yyyy-MM-dd"))).length;

  return (
    <>
      <div className="bg-[#111] border border-white/8 rounded-2xl px-4 py-2.5">
        <div className="grid grid-cols-8 gap-1">
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
                className="flex flex-col items-center gap-1 group">
                
                <span className="text-[9px] text-white/25 font-medium">{day[0]}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isSelected && logged ? "bg-green-400 text-black scale-110" :
                isSelected ? "ring-2 ring-white/50 bg-white/10 text-white scale-110" :
                logged ? "bg-green-500 text-white" :
                isCurrentDay ? "border border-green-500/60 text-green-400" :
                isPast ? "bg-white/4 text-white/10" :
                "bg-white/4 text-white/20 group-hover:bg-white/10"}`
                }>
                  {logged ? "✓" : format(date, "d")}
                </div>
              </button>);

          })}
          <button
            onClick={() => setShowCalendar(true)}
            className="flex flex-col items-center justify-end gap-1 group">
            <span className="text-[9px] text-white/25 font-medium">&nbsp;</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/4 text-white/40 group-hover:bg-white/10 transition-all">
              <CalendarDays className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCalendar &&
        <CalendarModal
          loggedDates={loggedDates}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onClose={() => setShowCalendar(false)} />

        }
      </AnimatePresence>
    </>);

}