import type { NextConfig } from "next";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/claude-academy" : "",
  assetPrefix: isGitHubPages ? "/claude-academy/" : "",
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default nextConfig;
