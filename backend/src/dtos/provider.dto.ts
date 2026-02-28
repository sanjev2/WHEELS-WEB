import z from "zod"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

const timeHHMM = z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM (e.g. 09:30)")

export const AdminCreateProviderDTO = z.object({
  name: z.string().min(1).trim(),
  locationText: z.string().trim().nullable().optional(),
  openFrom: timeHHMM,
  openTo: timeHHMM,
  lat: z.number(),
  lng: z.number(),
  placeId: z.string().trim().nullable().optional(),
  categories: z.array(z.enum(VEHICLE_CATEGORIES)).optional(),
  isActive: z.boolean().optional(),
})

export const AdminUpdateProviderDTO = AdminCreateProviderDTO