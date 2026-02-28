import mongoose, { Schema } from "mongoose";

export type CarCategory = "SUV" | "SEDAN" | "HATCHBACK";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid" | "CNG";

export interface ICar {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: FuelType;
  boughtDate: Date;

  // ✅ NEW
  category: CarCategory;

  owner: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const CarSchema = new Schema<ICar>(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },

    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },

    licensePlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      default: "Petrol",
      required: true,
    },

    boughtDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // ✅ NEW
    category: {
      type: String,
      enum: ["SUV", "SEDAN", "HATCHBACK"],
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const CarModel = mongoose.model<ICar>("Car", CarSchema);