import z from "zod"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"
import { ENGINE_OIL_TYPES } from "../models/package.model"

const cleanStringArray = z
  .array(z.string().trim())
  .transform((arr) => arr.map((s) => s.trim()).filter((s) => s.length > 0))

const cleanOilTypes = z
  .array(z.enum(ENGINE_OIL_TYPES))
  .transform((arr) => Array.from(new Set(arr))) // remove duplicates
  .optional()

export const AdminCreatePackageDTO = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().nullable().optional(),

  category: z.enum(VEHICLE_CATEGORIES),

  price: z.number().min(0, "Price must be >= 0"),

  durationMins: z.number().min(0).nullable().optional(),

  // ✅ CHANGED: allow multiple
  engineOilTypes: cleanOilTypes,

  services: cleanStringArray.optional(),
  addons: cleanStringArray.optional(),

  isActive: z.boolean().optional(),
})

export const AdminUpdatePackageDTO = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().nullable().optional(),

  category: z.enum(VEHICLE_CATEGORIES),

  price: z.number().min(0, "Price must be >= 0"),

  durationMins: z.number().min(0).nullable().optional(),

  // ✅ CHANGED: allow multiple
  engineOilTypes: cleanOilTypes,

  services: cleanStringArray.optional(),
  addons: cleanStringArray.optional(),

  isActive: z.boolean().optional(),
})

export type AdminCreatePackageInput = z.infer<typeof AdminCreatePackageDTO>
export type AdminUpdatePackageInput = z.infer<typeof AdminUpdatePackageDTO>