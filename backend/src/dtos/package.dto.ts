import { z } from "zod"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

export const AdminCreatePackageDTO = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(VEHICLE_CATEGORIES),
  price: z.coerce.number().min(0),
  durationMins: z.coerce.number().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
})

export const AdminUpdatePackageDTO = AdminCreatePackageDTO.partial()
