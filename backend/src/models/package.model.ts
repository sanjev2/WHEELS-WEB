import mongoose, { Schema, InferSchemaType } from "mongoose"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

export const ENGINE_OIL_TYPES = ["Synthetic", "Fully Synthetic"] as const
export type EngineOilType = (typeof ENGINE_OIL_TYPES)[number]

const PackageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },

    category: {
      type: String,
      enum: VEHICLE_CATEGORIES,
      required: true,
    },

    price: { type: Number, required: true, min: 0 },

    durationMins: { type: Number, default: null, min: 0 },

    // ✅ CHANGED: allow BOTH types (array)
    engineOilTypes: {
      type: [String],
      enum: ENGINE_OIL_TYPES,
      default: [],
    },

    services: {
      type: [String],
      default: [],
    },

    addons: {
      type: [String],
      default: [],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export type IPackage = InferSchemaType<typeof PackageSchema>
export const PackageModel = mongoose.model("Package", PackageSchema)