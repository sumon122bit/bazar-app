import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // ✅ স্ট্যাটিক এক্সপোর্ট চালু করা হলো
  allowedDevOrigins: ["10.98.13.35", "localhost", "127.0.0.1", "192.168.43.1"],
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // ✅ স্ট্যাটিক অ্যাপে ইমেজের জন্য জরুরি
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
    };
    return config;
  },
};

export default nextConfig;
