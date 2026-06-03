// FitGIF API — 1,300+ exercises with animated GIFs
const BASE_URL = "https://fitgif.vercel.app";
const API_KEY = "fg-AXTQoBBZu907WpP7K0S9AH45";

export async function searchExercises(query, options = {}) {
  const body = {
    key: API_KEY,
    includeData: true,
    ...(query?.trim() ? { search: query.trim() } : {}),
    ...(options.equipment ? { equipment: options.equipment } : {}),
    ...(options.bodyPart ? { bodyPart: options.bodyPart } : {}),
    ...(options.target ? { target: options.target } : {}),
  };

  const res = await fetch(`${BASE_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to fetch exercises");
  const data = await res.json();
  return data.results || [];
}

export function mapExercise(ex) {
  return {
    id: ex.name.replace(/\s+/g, "-").toLowerCase(),
    name: ex.name,
    muscle: ex.target,
    bodyPart: ex.bodyPart,
    equipment: ex.equipment,
    gifUrl: ex.url,
    instructions: ex.data ? [ex.data] : [],
    emoji: bodyPartEmoji(ex.bodyPart),
  };
}

// Valid body parts from FitGIF API
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

// Default exercise terms to show on load (used sequentially if needed)
export const DEFAULT_SEARCHES = [
  "squat", "bench press", "deadlift", "pull up", "shoulder press",
  "curl", "row", "lunge", "plank", "push up",
];

// Load a default set with a single API call
export async function loadDefaultExercises() {
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