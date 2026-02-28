export const VEHICLE_CATEGORIES = ["SUV", "SEDAN", "HATCHBACK"] as const

export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number]