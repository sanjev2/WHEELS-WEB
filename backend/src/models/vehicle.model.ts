import mongoose, { Schema, InferSchemaType } from "mongoose"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

const VehicleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: null, trim: true },
    model: { type: String, default: null, trim: true },
    year: { type: Number, default: null },
    category: {
      type: String,
      enum: VEHICLE_CATEGORIES,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
)

/**
 * ✅ Automatic type from schema
 */
export type IVehicle = InferSchemaType<typeof VehicleSchema>

export const VehicleModel = mongoose.model("Vehicle", VehicleSchema)
