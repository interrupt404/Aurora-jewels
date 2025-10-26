/**
 * Module: For loading the environment configuration
 */

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import fs from "fs";

// Optional: Log that .env is being loaded
const envPath = resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  console.log("Environment file loaded from:", envPath);
} else {
  console.warn(".env file not found at:", envPath);
}

// Load the .env file
dotenvConfig({ path: envPath });

// Log the current NODE_ENV for confirmation
console.log("Environment:", process.env.NODE_ENV);

// TypeScript interface for your env variables
interface IProcessEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  MONGO_URI: string;
  PORT: string; // keep string because dotenv parses everything as string
  NODE_ENV: string;
  // Add other variables if you expand
}

// Extend NodeJS.ProcessEnv for TS safety
declare global {
  namespace NodeJS {
    interface ProcessEnv extends IProcessEnv {}
  }
}

export {};
