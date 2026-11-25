import type { NextConfig } from "next";

const ghPages = process.env.GITHUB_PAGES === "true";
const basePath = ghPages ? "/book-summary" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: { unoptimized: true },
};

export default nextConfig;