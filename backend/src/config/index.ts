import dotenv from "dotenv"
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  override: true,
})

export const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/wheels_db",
  JWT_SECRET: process.env.JWT_SECRET || "hello",
  NODE_ENV: process.env.NODE_ENV || "development",

  // ✅ Add these
  API_BASE_URL: process.env.API_BASE_URL || "http://192.168.1.69:5000",
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:3000",
  MOBILE_DEEP_LINK_BASE: process.env.MOBILE_DEEP_LINK_BASE || "wheels://payment",
}

// Export individual variables
export const PORT = config.PORT
export const MONGODB_URI = config.MONGODB_URI
export const JWT_SECRET = config.JWT_SECRET

// ✅ Export these too (recommended)
export const API_BASE_URL = config.API_BASE_URL
export const APP_BASE_URL = config.APP_BASE_URL
export const MOBILE_DEEP_LINK_BASE = config.MOBILE_DEEP_LINK_BASE