import dotenv from "dotenv";
import path from "path";
import type { SignOptions } from "jsonwebtoken";

// Single shared .env lives at the monorepo root, one level above backend/.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const MONGO_URI = process.env.MONGO_URI;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

// This is the important line:
const JWT_ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "24h") as SignOptions["expiresIn"];

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env");
}
if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined in .env");
}

export const env = {
  port: process.env.PORT || "5000",
  mongoUri: MONGO_URI,
  jwtAccessSecret: JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: JWT_ACCESS_EXPIRES_IN,
  // Comma-separated list of allowed origins. Undefined => reflect any origin (dev).
  corsOrigin: process.env.CORS_ORIGIN
};

// Parsed allowed origins for CORS. `true` reflects the request origin (dev default).
export const corsOrigin = env.corsOrigin
  ? env.corsOrigin.split(",").map((o) => o.trim())
  : true;
