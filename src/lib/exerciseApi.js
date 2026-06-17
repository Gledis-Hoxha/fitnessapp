// WorkoutX API client — 1,400+ exercises with animated GIFs
// Calls the API directly from the frontend (CORS is enabled by WorkoutX)

const BASE_URL = "https://api.workoutxapp.com/v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const cache = new Map();

function cacheKey(query, options) {
  return JSON.stringify({ q: query || "__default__", ...options });
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

function getApiKey() {
  return import.meta.env.VITE_WORKOUTX_API_KEY || "";
}

export async function searchExercises(query, options = {}) {
  const ck = cacheKey(query, options);
  const cached = getFromCache(ck);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (query?.trim()) params.set("search", query.trim());
  if (options.bodyPart && options.bodyPart !== "all") params.set("bodyPart", options.bodyPart);
  if (options.equipment) params.set("equipment", options.equipment);
  if (options.target) params.set("target", options.target);
  if (options.difficulty) params.set("difficulty", options.difficulty);
  params.set("limit", "50");

  const url = `${BASE_URL}/exercises?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "X-WorkoutX-Key": getApiKey(),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limited. Please try again shortly.");
    throw new Error(`WorkoutX API error (${res.status})`);
  }

  const data = await res.json();
  const results = data.exercises || data.results || data.data || [];
  setCache(ck, results);
  return results;
}

export function mapExercise(ex) {
  return {
    id: ex.id || ex.name?.replace(/\s+/g, "-").toLowerCase(),
    name: ex.name,
    muscle: ex.target || ex.targetMuscle,
    secondaryMuscles: ex.secondaryMuscles || [],
    bodyPart: ex.bodyPart,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    gifUrl: ex.gifUrl || ex.gif_url || ex.animationUrl,
    caloriesPerMinute: ex.caloriesPerMinute || ex.calories_per_minute,
    instructions: ex.instructions || [],
    emoji: bodyPartEmoji(ex.bodyPart),
  };
}

// Valid body parts from WorkoutX API
export const BODY_PARTS = [
  "all",
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
];

// Default exercise terms to show on load
export const DEFAULT_SEARCHES = [
  "squat", "bench press", "deadlift", "pull up", "shoulder press",
  "curl", "row", "lunge", "plank", "push up",
];

// Load a default set with caching
export async function loadDefaultExercises() {
  // Try fetching all exercises first for best results
  try {
    const all = await searchExercises("", {});
    if (all.length > 0) return all;
  } catch {}

  // Fallback: search popular terms
  const terms = ["squat", "bench press", "deadlift", "pull up", "shoulder press"];
  const results = [];
  for (const term of terms) {
    try {
      const data = await searchExercises(term);
      results.push(...data);
    } catch {}
  }
  // Deduplicate by name
  const seen = new Set();
  return results.filter((ex) => {
    if (seen.has(ex.name)) return false;
    seen.add(ex.name);
    return true;
  });
}

function bodyPartEmoji(bodyPart) {
  const map = {
    chest: "🏋️",
    back: "🔙",
    shoulders: "💪",
    "upper arms": "💪",
    "lower arms": "🤝",
    "upper legs": "🦵",
    "lower legs": "🦶",
    waist: "⚡",
    cardio: "🏃",
    neck: "🧠",
  };
  return map[bodyPart?.toLowerCase()] || "🏋️";
}