// WorkoutX exercise API — 1,400+ exercises with animated GIFs
// Routes through backend function for secure API key handling

import { base44 } from "@/api/base44Client";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

function cacheKey(search, options) {
  return JSON.stringify({ s: search || "__default__", ...options });
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

export async function searchExercises(search, options = {}) {
  const ck = cacheKey(search, options);
  const cached = getFromCache(ck);
  if (cached) return cached;

  const payload = { limit: "50" };
  if (search?.trim()) payload.search = search.trim();
  if (options.bodyPart && options.bodyPart !== "all") payload.bodyPart = options.bodyPart;
  if (options.equipment) payload.equipment = options.equipment;
  if (options.target) payload.target = options.target;

  const res = await base44.functions.invoke("searchWorkoutX", payload);
  const results = res.data?.data || [];
  setCache(ck, results);
  return results;
}

export function mapExercise(ex) {
  return {
    id: ex.id,
    name: ex.name,
    muscle: ex.target,
    secondaryMuscles: ex.secondaryMuscles || [],
    bodyPart: ex.bodyPart,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    gifUrl: ex.gifUrl,
    caloriesPerMinute: ex.caloriesPerMinute,
    instructions: ex.instructions || [],
    emoji: bodyPartEmoji(ex.bodyPart),
  };
}

export const BODY_PARTS = [
  "all", "back", "cardio", "chest", "lower arms",
  "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist",
];

export async function loadDefaultExercises() {
  const all = await searchExercises("", {});
  if (all.length > 0) return all;

  // Fallback: popular terms
  const terms = ["squat", "bench press", "deadlift", "pull up", "shoulder press"];
  const results = [];
  for (const term of terms) {
    try {
      const data = await searchExercises(term);
      results.push(...data);
    } catch {}
  }
  const seen = new Set();
  return results.filter((ex) => {
    if (seen.has(ex.name)) return false;
    seen.add(ex.name);
    return true;
  });
}

function bodyPartEmoji(bodyPart) {
  const map = {
    chest: "🏋️", back: "🔙", shoulders: "💪",
    "upper arms": "💪", "lower arms": "🤝",
    "upper legs": "🦵", "lower legs": "🦶",
    waist: "⚡", cardio: "🏃", neck: "🧠",
  };
  return map[bodyPart?.toLowerCase()] || "🏋️";
}