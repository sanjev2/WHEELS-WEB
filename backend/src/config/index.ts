import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/wheels_db",
  JWT_SECRET: process.env.JWT_SECRET || "hello",
  NODE_ENV: process.env.NODE_ENV || "development"
};

// Export individual variables for backward compatibility
export const PORT = config.PORT;
export const MONGODB_URI = config.MONGODB_URI;
export const JWT_SECRET = config.JWT_SECRET;