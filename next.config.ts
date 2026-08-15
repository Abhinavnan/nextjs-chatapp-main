import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  reactCompiler: true,
  cacheComponents: true,
  allowedDevOrigins: ['192.168.1.3', '192.168.1.7', '192.168.1.4'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'iberikatrail.barrel.cloud',
      },
      {
        protocol: 'https',
        hostname: 'nextjs-chat-app.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  }
};

export default nextConfig;
