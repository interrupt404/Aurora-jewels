import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Standard way to get __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. Extend Next.js best practices
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // 2. Global ignores (node_modules, build artifacts, etc.)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  
  // 3. Custom OVERRIDE for next.config.ts (The fix for require())
  {
    // Target the specific configuration file
    files: ["next.config.ts"], 
    rules: {
      // Allow require() calls specifically in the config file
      "@typescript-eslint/no-require-imports": "off", 
      "@typescript-eslint/no-var-requires": "off" 
    },
  },
];

export default eslintConfig;