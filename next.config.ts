import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.98.13.35", "localhost", "127.0.0.1"],
  devIndicators: false,
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
    };
    return config;
  },
};

export default nextConfig;
