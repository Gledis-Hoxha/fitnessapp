import { useEffect, useRef } from "react";

// Schedules in-browser notifications for today's planned workout (if it has a reminder_time).
export function usePlanNotifications(plans) {
  const scheduledRef = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const dayOfWeek = now.getDay();

    plans
      .filter((p) => p.day === dayOfWeek && p.reminder_time)
      .forEach((p) => {
        const key = `${p.id}-${now.toDateString()}`;
        if (scheduledRef.current.has(key)) return;

        const [h, m] = p.reminder_time.split(":").map(Number);
        const target = new Date(now);
        target.setHours(h, m, 0, 0);
        const delay = target - now;

        if (delay > 0 && delay < 86400000) {
          scheduledRef.current.add(key);
          setTimeout(() => {
            new Notification("💪 Workout Time!", {
              body: `Scheduled today: ${p.routine_name || "Your workout"}`,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
            });
          }, delay);
        }
      });
  }, [plans]);
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}