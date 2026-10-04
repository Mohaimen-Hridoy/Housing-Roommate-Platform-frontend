import type { NextConfig } from "next";

/**
 * `next dev` and `next build` both write here, so a build started while the dev
 * server is running overwrites its RSC client manifest and the dev server starts
 * throwing "SegmentViewNode in the React Client Manifest" on every route.
 *
 * `scripts/build.mjs` points the production build at `.next-build` to keep the
 * two apart. Override with `NEXT_DIST_DIR` if you need to.
 */
const distDir = process.env.NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
