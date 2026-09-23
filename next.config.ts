import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Uploaded covers live on Cloudinary; the wildcard also allows pasted image URLs
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
