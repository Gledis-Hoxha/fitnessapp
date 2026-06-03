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

// Default exercises to show on load (broad searches per body part)
export const DEFAULT_SEARCHES = [
  "squat", "bench press", "deadlift", "pull up", "shoulder press",
  "curl", "row", "lunge", "plank", "push up",
];

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