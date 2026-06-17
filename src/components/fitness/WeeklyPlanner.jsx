import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Plus, X, Bell, BellOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { usePlanNotifications, requestNotificationPermission } from "@/lib/usePlanNotifications";
import ReminderTimeInput from "@/components/fitness/ReminderTimeInput";

const DAYS = [
  { idx: 1, label: "Mon" },
  { idx: 2, label: "Tue" },
  { idx: 3, label: "Wed" },
  { idx: 4, label: "Thu" },
  { idx: 5, label: "Fri" },
  { idx: 6, label: "Sat" },
  { idx: 0, label: "Sun" },
];

export default function WeeklyPlanner({ routines = [] }) {
  const queryClient = useQueryClient();
  const [pickerDay, setPickerDay] = useState(null);
  const todayIdx = new Date().getDay();
  const [pushGranted, setPushGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  const { data: plans = [] } = useQuery({
    queryKey: ["weeklyPlan"],
    queryFn: () => base44.entities.WeeklyPlan.list("-created_date", 50),
  });

  usePlanNotifications(plans);

  const planByDay = {};
  plans.forEach((p) => { planByDay[p.day] = p; });

  const timeMutation = useMutation({
    mutationFn: ({ id, reminder_time }) => base44.entities.WeeklyPlan.update(id, { reminder_time }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] }),
  });

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPushGranted(granted);
    if (granted) toast.success("Notifications enabled!");
    else toast.error("Permission denied. Enable notifications in browser settings.");
  };

  const assignMutation = useMutation({
    mutationFn: async ({ day, routine }) => {
      const existing = planByDay[day];
      const payload = { day, routine_id: routine.id, routine_name: routine.name };
      if (existing) return base44.entities.WeeklyPlan.update(existing.id, payload);
      return base44.entities.WeeklyPlan.create({ ...payload, reminder_time: "07:00" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
      setPickerDay(null);
    },
  });

  const clearMutation = useMutation({
    mutationFn: (id) => base44.entities.WeeklyPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] }),
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-primary" />
        <p className="text-sm font-bold text-foreground">Weekly Plan</p>
      </div>

      <div className="space-y-2">
        {DAYS.map(({ idx, label }) => {
          const plan = planByDay[idx];
          const isToday = idx === todayIdx;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${
                isToday ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/30"
              }`}
            >
              <div className="w-10 flex-shrink-0">
                <p className={`text-xs font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{label}</p>
              </div>
              {plan ? (
                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-sm text-foreground truncate flex-1">{plan.routine_name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {plan.reminder_time ? (
                      <Bell className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <ReminderTimeInput
                      value={plan.reminder_time}
                      onCommit={(reminder_time) => timeMutation.mutate({ id: plan.id, reminder_time })}
                    />
                    <button
                      onClick={() => clearMutation.mutate(plan.id)}
                      className="p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPickerDay(idx)}
                  className="flex-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add workout
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!pushGranted ? (
        <button
          onClick={handleEnablePush}
          className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 rounded-xl bg-primary/15 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          Enable workout reminders
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1.5 text-xs text-accent pt-3">
          <Bell className="w-3 h-3" /> Reminders active for scheduled days
        </div>
      )}

      {/* Routine picker */}
      <AnimatePresence>
        {pickerDay !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setPickerDay(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="font-bold text-sm">Pick a routine</p>
                <button onClick={() => setPickerDay(null)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {routines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No routines saved yet.</p>
                ) : (
                  routines.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => assignMutation.mutate({ day: pickerDay, routine: r })}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-border transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.exercises?.length || 0} exercises</p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}