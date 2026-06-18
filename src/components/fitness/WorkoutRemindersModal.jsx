import { useState, useEffect, useRef } from "react";
import { app } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Bell, BellOff, Smartphone } from "lucide-react";
import { toast } from "sonner";

// Request browser push permission and schedule in-browser notifications
function usePushNotifications(reminders) {
  const scheduledRef = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const dayOfWeek = now.getDay();

    reminders.filter((r) => r.enabled && r.days?.includes(dayOfWeek)).forEach((r) => {
      const key = `${r.id}-${now.toDateString()}`;
      if (scheduledRef.current.has(key)) return;

      const [h, m] = (r.time || "07:00").split(":").map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      const delay = target - now;
      if (delay > 0 && delay < 86400000) {
        scheduledRef.current.add(key);
        setTimeout(() => {
          new Notification("💪 Workout Time!", {
            body: `Time to start: ${r.label}`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });
        }, delay);
      }
    });
  }, [reminders]);
}

async function requestPushPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WorkoutRemindersModal({ onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list"); // "list" | "create"
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("07:00");
  const [days, setDays] = useState([1, 3, 5]); // Mon, Wed, Fri default
  const [pushGranted, setPushGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["workout-reminders"],
    queryFn: () => app.entities.WorkoutReminder.list("-created_date", 50),
  });

  usePushNotifications(reminders);

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushGranted(granted);
    if (granted) toast.success("Push notifications enabled!");
    else toast.error("Permission denied. Enable notifications in browser settings.");
  };

  const createReminder = useMutation({
    mutationFn: (data) => app.entities.WorkoutReminder.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workout-reminders"] }); setView("list"); toast.success("Reminder saved!"); },
  });

  const toggleEnabled = useMutation({
    mutationFn: ({ id, enabled }) => app.entities.WorkoutReminder.update(id, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-reminders"] }),
  });

  const deleteReminder = useMutation({
    mutationFn: (id) => app.entities.WorkoutReminder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-reminders"] }),
  });

  const toggleDay = (d) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const save = () => {
    if (!label.trim()) return toast.error("Enter a label");
    if (!days.length) return toast.error("Select at least one day");
    createReminder.mutate({ label: label.trim(), time, days, enabled: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {view === "create" && (
              <button onClick={() => setView("list")} className="text-white/50 hover:text-white text-sm">← Back</button>
            )}
            <h2 className="font-bold text-white text-base">{view === "list" ? "Workout Reminders" : "New Reminder"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button onClick={() => setView("create")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {view === "list" && (
            <>
              {isLoading && <p className="text-white/40 text-sm text-center py-8">Loading...</p>}
              {!isLoading && reminders.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No reminders yet.</p>
                  <button onClick={() => setView("create")} className="mt-3 text-blue-400 text-sm font-medium hover:underline">Set your first reminder →</button>
                </div>
              )}
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                  <button onClick={() => toggleEnabled.mutate({ id: r.id, enabled: !r.enabled })} className={r.enabled ? "text-blue-400" : "text-white/20"}>
                    {r.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${r.enabled ? "text-white" : "text-white/40"}`}>{r.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {r.time} · {(r.days || []).sort().map((d) => DAY_LABELS[d]).join(", ")}
                    </p>
                  </div>
                  <button onClick={() => deleteReminder.mutate(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!pushGranted && (
                <button
                  onClick={handleEnablePush}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/25 transition-colors mt-1"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Enable phone notifications
                </button>
              )}
              {pushGranted && reminders.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-green-400 pt-1">
                  <Bell className="w-3 h-3" /> Push notifications active
                </div>
              )}
            </>
          )}

          {view === "create" && (
            <div className="space-y-5">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Label</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Leg Day, Morning Run" className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-2 block">Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAY_LABELS.map((d, i) => (
                    <button key={i} onClick={() => toggleDay(i)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${days.includes(i) ? "bg-blue-500 text-white" : "bg-white/8 text-white/40 hover:bg-white/15"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={save} disabled={createReminder.isPending} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-colors disabled:opacity-50">
                {createReminder.isPending ? "Saving..." : "Save Reminder"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}