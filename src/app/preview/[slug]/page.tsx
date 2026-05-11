// ════════════════════════════════════════════════════════════════
// Preview Route — Phase 10.2: Optimized Server Component Wrapper
// ════════════════════════════════════════════════════════════════
// This server component provides:
//   1. generateStaticParams → pre-renders all preview routes at build
//   2. revalidate = 3600 → ISR cache for 1 hour
//   3. Clean metadata for SEO
// The actual rendering is delegated to PreviewClient (client component).
// ════════════════════════════════════════════════════════════════

import { PREVIEW_MAP } from "@/lib/preview-map";
import PreviewClient from "./PreviewClient";

// Cache for 1 hour — component metadata doesn't change often
export const revalidate = 3600;

// Pre-render all preview routes at build time
export async function generateStaticParams() {
  return Object.keys(PREVIEW_MAP).map((slug) => ({ slug }));
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PreviewClient slug={slug} />;
}
