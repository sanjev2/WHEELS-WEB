/**
 * =========================================================
 * Vehicle Category Master Definition
 * =========================================================
 * Single source of truth for:
 * - DB enums
 * - DTO validation
 * - Services
 * - Controllers
 * - Public API
 *
 * If you want to add more categories later (EV, VAN, etc),
 * change ONLY here.
 * =========================================================
 */

export const VEHICLE_CATEGORIES = ["SUV", "SEDAN", "HATCHBACK"] as const

/**
 * Type:
 * category: "SUV" | "SEDAN" | "HATCHBACK"
 */
export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number]

/**
 * Runtime validator
 * Example:
 * if (!isValidVehicleCategory(input)) -> reject
 */
export function isValidVehicleCategory(value: any): value is VehicleCategory {
  return VEHICLE_CATEGORIES.includes(value)
}

/**
 * Normalize input safely.
 * Converts:
 * suv -> SUV
 * Sedan -> SEDAN
 *
 * Returns undefined if invalid.
 */
export function normalizeVehicleCategory(value: any): VehicleCategory | undefined {
  if (!value) return undefined
  const normalized = String(value).trim().toUpperCase()
  return VEHICLE_CATEGORIES.find((c) => c === normalized)
}

/**
 * Helpful for dropdowns / public API
 */
export function getVehicleCategories(): readonly VehicleCategory[] {
  return VEHICLE_CATEGORIES
}
