import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is only needed for self-hosted Docker builds.
  // Vercel manages its own output format, so we skip this there.
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
};

export default nextConfig;
