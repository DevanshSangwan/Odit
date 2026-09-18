import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increases the limit from 1MB to 10MB
    },
  },
};

export default nextConfig;
