import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default wallpapers are content-named: rename a file when you change it.
  async headers() {
    return [{ source: "/wallpapers/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  // year data lives at <repo>/data, outside this app
  turbopack: {
    root: path.join(__dirname, "../.."),
    // Netlify has no cloudflare:workers module; swap in a stub so the build resolves it
    ...(process.env.NETLIFY === "true" && { resolveAlias: { "cloudflare:workers": "./src/server/cf-stub.ts" } }),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
