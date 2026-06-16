import { format } from "date-fns";

export const DAILY_STEP_GOAL = 10000;
export const STEP_LENGTH_M = 0.762;
export const CALORIES_PER_STEP = 0.04;

// Deterministic hash from a string so sample data stays constant across renders.
function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Deterministic pseudo-random sample step count for a given date so history
// stays constant across renders. Today's value is provided live by the tracker.
export function getStepsForDate(date) {
  const dateStr = format(date, "yyyy-MM-dd");
  // Wider spread between ~2,500 and ~15,500 steps for clear day-to-day variance
  return 2500 + (hashStr(dateStr) % 13000);
}

// Sample active minutes for a date, varied independently of steps (~20–95 min).
export function getMinutesForDate(date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return 20 + (hashStr(dateStr + "min") % 76);
}

// Sample calories for a date, varied independently of steps (~180–620 kcal).
export function getCaloriesForDate(date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return 180 + (hashStr(dateStr + "cal") % 441);
}

export function stepMetrics(steps) {
  return {
    steps,
    calories: Math.round(steps * CALORIES_PER_STEP),
    distanceKm: (steps * STEP_LENGTH_M / 1000).toFixed(2),
    progress: Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100)),
  };
}