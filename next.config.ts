import { createMDX } from "fumadocs-mdx/next";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import "./src/env";

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  [];
const r2PublicUrl = process.env.R2_PUBLIC_URL;

if (r2PublicUrl) {
  try {
    const url = new URL(r2PublicUrl);
    const protocol = url.protocol.replace(":", "");
    const pathname =
      url.pathname && url.pathname !== "/"
        ? `${url.pathname.replace(/\/$/, "")}/**`
        : "/**";

    if (protocol === "http" || protocol === "https") {
      imageRemotePatterns.push({
        protocol,
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname,
      });
    }
  } catch {
    // Ignore invalid R2_PUBLIC_URL to avoid breaking Next config.
  }
}

const config: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: imageRemotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  serverExternalPackages: ["@aws-sdk/client-s3"],
  output: "standalone",
};

const withMDX = createMDX();
export default withBundleAnalyzer(withNextIntl(withMDX(config)));
