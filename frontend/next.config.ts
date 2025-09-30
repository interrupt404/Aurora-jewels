import type { NextConfig } from "next";

// NOTE: We must use require() here because module resolution for next.config.ts 
// often defaults back to CommonJS compatibility for the config file itself.
const withMDX = require('@next/mdx')()

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  // Add pageExtensions to include md and mdx files
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Required for next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'YOUR_SUPABASE_STORAGE_BUCKET_ID.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

// The wrapper ensures the MDX configuration is applied correctly
// We use module.exports here because TypeScript configuration files 
// are typically compiled back to CommonJS for Node execution.
export default withMDX(nextConfig) as NextConfig;