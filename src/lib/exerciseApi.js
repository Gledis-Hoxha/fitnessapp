// ExerciseDB API via RapidAPI
const BASE_URL = "https://exercisedb.p.rapidapi.com";

function getApiKey() {
  return localStorage.getItem("rapidapi_key") || "";
}

function getHeaders() {
  return {
    "x-rapidapi-key": getApiKey(),
    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
  };
}

export async function searchExercises(query, limit = 20) {
  const res = await fetch(
    `${BASE_URL}/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=${limit}&offset=0`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export async function getExercisesByBodyPart(bodyPart, limit = 20) {
  const res = await fetch(
    `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=0`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export async function getBodyPartList() {
  const res = await fetch(`${BASE_URL}/exercises/bodyPartList`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch body parts");
  return res.json();
}

export async function getExercises(limit = 30, offset = 0) {
  const res = await fetch(
    `${BASE_URL}/exercises?limit=${limit}&offset=${offset}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export function isExerciseApiConfigured() {
  return !!getApiKey();
}

export function setExerciseApiKey(key) {
  localStorage.setItem("rapidapi_key", key);
}

export function mapExercise(ex) {
  return {
    id: ex.id,
    name: ex.name,
    muscle: ex.target,
    bodyPart: ex.bodyPart,
    equipment: ex.equipment,
    gifUrl: ex.gifUrl,
    instructions: ex.instructions || [],
    secondaryMuscles: ex.secondaryMuscles || [],
    emoji: bodyPartEmoji(ex.bodyPart),
  };
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