import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/claude-academy" : "",
  assetPrefix: isProd ? "/claude-academy/" : "",
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default nextConfig;
