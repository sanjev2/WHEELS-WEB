import mongoose, { Schema, InferSchemaType } from "mongoose"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"

const ProviderSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    // display address/location text
    locationText: { type: String, default: null, trim: true },

    // Open hours (simple daily same timing)
    openFrom: { type: String, required: true, trim: true }, // "09:00"
    openTo: { type: String, required: true, trim: true },   // "18:00"

    // Google map pin coordinates
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },

    // Optional place id if you use Places later
    placeId: { type: String, default: null, trim: true },

    // categories provider supports
    categories: {
      type: [String],
      enum: VEHICLE_CATEGORIES,
      default: [],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export type IProvider = InferSchemaType<typeof ProviderSchema>
export const ProviderModel = mongoose.model("Provider", ProviderSchema)