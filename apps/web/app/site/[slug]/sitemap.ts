import { eq, and, isNull } from "drizzle-orm";
import { db } from "@openpims/db/client";
import { websites, websitePages } from "@openpims/db";
import type { MetadataRoute } from "next";

interface SitemapParams {
  params: Promise<{ slug: string }>;
}

export default async function sitemap({ params }: SitemapParams): Promise<MetadataRoute.Sitemap> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const site = await db.query.websites.findFirst({
    where: and(eq(websites.slug, slug), eq(websites.status, "published"), isNull(websites.deletedAt)),
    with: {
      pages: {
        where: isNull(websitePages.deletedAt),
        columns: { slug: true, updatedAt: true },
      },
    },
  });

  if (!site) return [];

  return site.pages.map((page) => ({
    url: `${baseUrl}/site/${slug}/${page.slug}`,
    lastModified: page.updatedAt,
  }));
}