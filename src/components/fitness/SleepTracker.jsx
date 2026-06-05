import { useState } from "react";
import { Moon, Bluetooth, Plus, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SLEEP_STAGES = ["awake", "light", "deep", "rem"];
const STAGE_COLORS = {
  awake: { bg: "bg-red-500/20", text: "text-red-400", bar: "bg-red-400" },
  light: { bg: "bg-blue-500/20", text: "text-blue-300", bar: "bg-blue-300" },
  deep: { bg: "bg-indigo-500/20", text: "text-indigo-400", bar: "bg-indigo-400" },
  rem: { bg: "bg-purple-500/20", text: "text-purple-400", bar: "bg-purple-400" }
};

function SleepQualityStars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) =>
      <button key={s} onClick={() => onChange(s)}>
          <Star className={`w-5 h-5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
        </button>
      )}
    </div>);

}

export default function SleepTracker() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bedtime: "22:30", wake_time: "06:30", quality: 3, notes: "" });
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: sleepLogs = [] } = useQuery({
    queryKey: ["sleep"],
    queryFn: () => base44.entities.FitnessActivity.filter({ activity_type: "sleep" }, "-date", 14)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FitnessActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleep"] });
      setOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FitnessActivity.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sleep"] })
  });

  const todayLog = sleepLogs.find((s) => s.date === today);

  const calcDuration = (bed, wake) => {
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = wh * 60 + wm - (bh * 60 + bm);
    if (mins < 0) mins += 1440;
    return mins;
  };

  const handleLog = () => {
    const mins = calcDuration(form.bedtime, form.wake_time);
    createMutation.mutate({
      activity_type: "sleep",
      duration_minutes: mins,
      date: today,
      intensity: form.quality >= 4 ? "high" : form.quality >= 3 ? "moderate" : "low",
      notes: `Bedtime: ${form.bedtime} | Wake: ${form.wake_time} | Quality: ${form.quality}/5${form.notes ? " | " + form.notes : ""}`
    });
  };

  const recent = sleepLogs.slice(0, 7);
  const avgSleep = recent.length ? Math.round(recent.reduce((a, s) => a + (s.duration_minutes || 0), 0) / recent.length) : 0;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        
        <div className={`p-2 rounded-xl ${todayLog ? "bg-indigo-500/20" : "bg-white/8"}`}>
          <Moon className={`w-4 h-4 ${todayLog ? "text-indigo-400" : "text-white/50"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Sleep Tracker</p>
          <p className="text-xs text-white/35">
            {todayLog ?
            `${Math.floor(todayLog.duration_minutes / 60)}h ${todayLog.duration_minutes % 60}m logged today` :
            avgSleep ? `Avg ${Math.floor(avgSleep / 60)}h ${avgSleep % 60}m · Tap to log` : "Apple Watch · Galaxy · Oura Ring · Tap to log"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {todayLog &&
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${todayLog.intensity === "high" ? "bg-indigo-500/20" : todayLog.intensity === "moderate" ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
              <span className={`text-xs font-semibold ${todayLog.intensity === "high" ? "text-indigo-400" : todayLog.intensity === "moderate" ? "text-yellow-400" : "text-red-400"}`}>
                {todayLog.intensity === "high" ? "Good" : todayLog.intensity === "moderate" ? "Fair" : "Poor"}
              </span>
            </div>
          }
          <Plus className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-45" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/8 px-4 pb-4 pt-3 space-y-4">
          
            {/* BLE hint */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hidden">
              <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs text-white/40">Sync from Apple Health / Galaxy Health / Oura, or log manually below.</p>
            </div>

            {/* Log form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/40 mb-1">Bedtime</p>
                  <input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })}
                className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500/50 text-gray-950" />
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Wake Time</p>
                  <input type="time" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })}
                className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500/50 text-gray-950" />
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1.5">Sleep Quality</p>
                <SleepQualityStars value={form.quality} onChange={(q) => setForm({ ...form, quality: q })} />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Duration: <span className="text-white font-semibold">{Math.floor(calcDuration(form.bedtime, form.wake_time) / 60)}h {calcDuration(form.bedtime, form.wake_time) % 60}m</span></p>
              </div>
              <button
              onClick={handleLog}
              disabled={createMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-sm font-semibold transition-colors disabled:opacity-50">
              
                {createMutation.isPending ? "Logging…" : "Log Sleep"}
              </button>
            </div>

            {/* Recent history */}
            {recent.length > 0 &&
          <div>
                <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2">Recent</p>
                <div className="space-y-1.5">
                  {recent.map((log) =>
              <div key={log.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.intensity === "high" ? "bg-indigo-400" : log.intensity === "moderate" ? "bg-yellow-400" : "bg-red-400"}`} />
                        <span className="text-xs text-white/50">{format(new Date(log.date + "T00:00:00"), "EEE MMM d")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{Math.floor(log.duration_minutes / 60)}h {log.duration_minutes % 60}m</span>
                        <button onClick={() => deleteMutation.mutate(log.id)} className="p-1 hover:bg-white/10 rounded transition-colors">
                          <X className="w-3 h-3 text-white/20 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
              )}
                </div>
              </div>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}