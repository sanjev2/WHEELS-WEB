import mongoose, { Schema, InferSchemaType } from "mongoose"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

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
    durationMins: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

/**
 * ✅ Automatic type from schema
 */
export type IPackage = InferSchemaType<typeof PackageSchema>

export const PackageModel = mongoose.model("Package", PackageSchema)
