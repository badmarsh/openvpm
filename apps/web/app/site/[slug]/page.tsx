import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq, and, isNull, asc } from "drizzle-orm";
import { db } from "@openpims/db/client";
import { websites, websitePages, websiteBlocks, practices } from "@openpims/db";
import { BlockRenderer } from "@/components/website/public/block-renderer";
import { PublicHeader } from "@/components/website/public/header";
import { PublicFooter } from "@/components/website/public/footer";

interface PublicSitePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicSitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await db.query.websites.findFirst({
    where: and(eq(websites.slug, slug), eq(websites.status, "published"), isNull(websites.deletedAt)),
    columns: { title: true, description: true, seoTitle: true, seoDescription: true, ogImage: true },
  });
  if (!site) return {};
  const title = site.seoTitle ?? site.title;
  const description = site.seoDescription ?? site.description ?? "";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(site.ogImage ? { images: [{ url: site.ogImage }] } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(site.ogImage ? { images: [site.ogImage] } : {}),
    },
  };
}

export default async function PublicSitePage({ params }: PublicSitePageProps) {
  const { slug } = await params;
  const site = await db.query.websites.findFirst({
    where: and(eq(websites.slug, slug), eq(websites.status, "published"), isNull(websites.deletedAt)),
    with: {
      practice: {
        columns: { name: true, phone: true, address: true, logoUrl: true },
      },
      pages: {
        where: isNull(websitePages.deletedAt),
        orderBy: [asc(websitePages.sortOrder)],
        with: {
          blocks: {
            where: and(isNull(websiteBlocks.deletedAt), eq(websiteBlocks.isVisible, true)),
            orderBy: [asc(websiteBlocks.sortOrder)],
          },
        },
      },
    },
  });

  if (!site) notFound();

  const homePage = site.pages.find((p) => p.isHome) ?? site.pages[0];
  const navPages = site.pages.filter((p) => p.showInNav);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    name: site.practice?.name ?? site.title,
    ...(site.practice?.address ? { address: site.practice.address } : {}),
    ...(site.practice?.phone ? { telephone: site.practice.phone } : {}),
    url: `/site/${slug}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader site={site} practice={site.practice} navPages={navPages} />
      <main>
        {homePage ? (
          <BlockRenderer
            blocks={homePage.blocks}
            practice={site.practice}
            websiteSlug={slug}
          />
        ) : (
          <div className="px-6 py-20 text-center text-muted-foreground">
            This website has no pages yet.
          </div>
        )}
      </main>
      <PublicFooter site={site} practice={site.practice} />
    </div>
  );
}
