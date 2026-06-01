// USDA FoodData Central API
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

function getApiKey() {
  return localStorage.getItem("usda_fdc_key") || "DEMO_KEY";
}

export function isUsdaApiConfigured() {
  const key = localStorage.getItem("usda_fdc_key");
  return !!key && key !== "DEMO_KEY";
}

export function setUsdaApiKey(key) {
  localStorage.setItem("usda_fdc_key", key);
}

export async function searchFoods(query, pageSize = 25, pageNumber = 1) {
  const res = await fetch(
    `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${pageNumber}&api_key=${getApiKey()}&dataType=Foundation,SR%20Legacy,Branded`
  );
  if (!res.ok) throw new Error("Failed to search foods");
  return res.json();
}

export function extractNutrients(food) {
  const nutrients = food.foodNutrients || [];

  const get = (name) => {
    const n = nutrients.find((n) =>
      n.nutrientName?.toLowerCase().includes(name.toLowerCase())
    );
    return n?.value ?? 0;
  };

  const energyKcal = nutrients.find(
    (n) => n.nutrientName === "Energy" && n.unitName === "KCAL"
  );
  const energyKj = nutrients.find(
    (n) => n.nutrientName === "Energy" && n.unitName === "kJ"
  );
  const calories = energyKcal?.value ?? (energyKj ? energyKj.value / 4.184 : get("energy"));

  return {
    calories_per100: Math.round(calories || 0),
    protein_per100: +(get("protein")).toFixed(1),
    carbs_per100: +(get("carbohydrate")).toFixed(1),
    fat_per100: +(get("total lipid") || get("fat")).toFixed(1),
  };
}

export function mapFoodItem(food) {
  const nutrients = extractNutrients(food);
  return {
    id: String(food.fdcId),
    name: food.description,
    brandOwner: food.brandOwner || food.brandName || "",
    foodCategory: food.foodCategory || food.foodCategoryLabel || "",
    servingSize: food.servingSize,
    servingSizeUnit: food.servingSizeUnit,
    ...nutrients,
  };
}