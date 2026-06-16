import { format } from "date-fns";

export const DAILY_STEP_GOAL = 10000;
export const STEP_LENGTH_M = 0.762;
export const CALORIES_PER_STEP = 0.04;

// Deterministic pseudo-random sample step count for a given date so history
// stays constant across renders. Today's value is provided live by the tracker.
export function getStepsForDate(date) {
  const dateStr = format(date, "yyyy-MM-dd");
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  // Spread between ~4,000 and ~14,000 steps
  return 4000 + (hash % 10000);
}

export function stepMetrics(steps) {
  return {
    steps,
    calories: Math.round(steps * CALORIES_PER_STEP),
    distanceKm: (steps * STEP_LENGTH_M / 1000).toFixed(2),
    progress: Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100)),
  };
}