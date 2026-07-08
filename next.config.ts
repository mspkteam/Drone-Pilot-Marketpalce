import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: "tsconfig.build.json",
  },
  serverExternalPackages: [
    "@prisma/adapter-neon",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
  /** Allow LAN IP in dev so client navigation / HMR work off localhost. */
  allowedDevOrigins: ["192.168.137.1", "127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["next-auth"],
  },
};

export default nextConfig;
