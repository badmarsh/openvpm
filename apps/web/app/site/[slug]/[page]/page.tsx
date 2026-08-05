import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq, and, isNull, asc } from "drizzle-orm";
import { db } from "@openpims/db/client";
import { websites, websitePages, websiteBlocks } from "@openpims/db";
import { BlockRenderer } from "@/components/website/public/block-renderer";
import { PublicHeader } from "@/components/website/public/header";
import { PublicFooter } from "@/components/website/public/footer";

interface PublicSiteSubPageProps {
  params: Promise<{ slug: string; page: string }>;
}

export async function generateMetadata({ params }: PublicSiteSubPageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const site = await db.query.websites.findFirst({
    where: and(eq(websites.slug, slug), eq(websites.status, "published"), isNull(websites.deletedAt)),
    with: {
      pages: {
        where: and(eq(websitePages.slug, page), isNull(websitePages.deletedAt)),
        columns: { title: true, seoTitle: true, seoDescription: true },
      },
    },
  });
  const pageData = site?.pages[0];
  if (!pageData) return {};
  return {
    title: pageData.seoTitle ?? pageData.title,
    description: pageData.seoDescription ?? "",
  };
}

export default async function PublicSiteSubPage({ params }: PublicSiteSubPageProps) {
  const { slug, page: pageSlug } = await params;
  const site = await db.query.websites.findFirst({
    where: and(eq(websites.slug, slug), eq(websites.status, "published"), isNull(websites.deletedAt)),
    with: {
      practice: {
        columns: { name: true, phone: true, address: true, logoUrl: true, settings: true },
      },
      pages: {
        where: and(eq(websitePages.slug, pageSlug), isNull(websitePages.deletedAt)),
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

  const page = site.pages[0];
  if (!page) notFound();

  const navPages = site.pages.filter((p) => p.showInNav);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader site={site} practice={site.practice} navPages={navPages} />
      <main>
        <BlockRenderer blocks={page.blocks} practice={site.practice} />
      </main>
      <PublicFooter site={site} practice={site.practice} />
    </div>
  );
}