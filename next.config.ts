import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake large libraries — only import what's actually used
    optimizePackageImports: [
      "framer-motion",
      "gsap",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
      "lucide-react",
    ],
  },

  async headers() {
    return [
      {
        source: '/PreviewVideos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
