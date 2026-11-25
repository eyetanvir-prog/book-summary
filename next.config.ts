import type { NextConfig } from "next";

const ghPages = process.env.GITHUB_PAGES === "true";
const basePath = ghPages ? "/book-summary" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;