import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Netlify exposes these only at build time; see deploymentScope. Vercel
  // values are mapped onto Netlify's names so both hosts resolve one scope.
  env: {
    SODAI_BUILD_CONTEXT:
      process.env.CONTEXT ||
      (process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV ? "deploy-preview" : ""),
    SODAI_BUILD_DEPLOY_ID: process.env.DEPLOY_ID || process.env.VERCEL_DEPLOYMENT_ID || "",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/preview/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};
export default config;
