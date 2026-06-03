import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  /** Allow LAN IP in dev so client navigation / HMR work off localhost. */
  allowedDevOrigins: ["192.168.137.1", "127.0.0.1"],
};

export default nextConfig;
