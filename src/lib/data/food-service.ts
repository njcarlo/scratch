import { FOOD_DB } from "./food-db";
import type { FoodCategory, FoodItem } from "../types";

/**
 * Food data access layer. Screens and components call these functions —
 * never `FOOD_DB` directly — so the data source can move from this static
 * seed file to a real database/CMS (see Section 11/32 roadmap in
 * ARCHITECTURE.md) without touching any UI code.
 */

export function listAllFoods(): FoodItem[] {
  return FOOD_DB;
}

export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_DB.find((f) => f.id === id);
}

export function listFoodsByCategory(category: FoodCategory): FoodItem[] {
  return FOOD_DB.filter((f) => f.category === category);
}

export function searchFoods(query: string): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_DB;
  return FOOD_DB.filter((f) =>
    [f.name, f.nameEn, f.nameTl, f.brand, f.source]
      .filter(Boolean)
      .some((s) => (s as string).toLowerCase().includes(q))
  );
}

export const FOOD_CATEGORY_LABEL: Record<FoodCategory, string> = {
  rice_viand: "Rice & Viand",
  fast_food: "Fast Food",
  coffee_beverage: "Coffee & Beverages",
  street_food: "Street Food",
  snack: "Snacks",
  convenience_store: "Convenience Store",
  soup: "Soups",
  noodles: "Noodles",
  dessert: "Desserts",
  staple: "Everyday Staples",
};
