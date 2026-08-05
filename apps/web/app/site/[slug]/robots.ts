import type { MetadataRoute } from "next";

interface RobotsParams {
  params: Promise<{ slug: string }>;
}

export default async function robots({ params }: RobotsParams): Promise<MetadataRoute.Robots> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/site/${slug}/sitemap.xml`,
  };
}