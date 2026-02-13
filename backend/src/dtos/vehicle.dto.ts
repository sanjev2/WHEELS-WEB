import { z } from "zod"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

export const AdminCreateVehicleDTO = z.object({
  name: z.string().min(2),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  category: z.enum(VEHICLE_CATEGORIES),
  isActive: z.coerce.boolean().optional(),
  image: z.string().optional(),
})

export const AdminUpdateVehicleDTO = AdminCreateVehicleDTO.partial()
