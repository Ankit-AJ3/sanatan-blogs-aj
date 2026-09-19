import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow cover images from any HTTPS host (admins paste image URLs)
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
