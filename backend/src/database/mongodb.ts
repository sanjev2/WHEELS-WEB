import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export const connectDatabase = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env fil");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database Error:", error);
    process.exit(1);
  }
};
