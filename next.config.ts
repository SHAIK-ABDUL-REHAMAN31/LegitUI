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
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
