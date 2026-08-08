"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Globe, LayoutTemplate, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { EmptyState } from "@/components/common/empty-state";
import { PublishControls } from "./publish-controls";
import { PageSidebar } from "./page-sidebar";
import { BlockPalette } from "./block-palette";

/**
 * SiteEditor — orchestrator component for the website builder dashboard.
 *
 * Owns all tRPC mutations and passes callbacks down to:
 *   - PublishControls  → header with publish/unpublish/preview
 *   - PageSidebar      → page list DnD + template switcher
 *   - BlockPalette     → block list DnD for the selected page
 *   - SitePreview      → live iframe (future: toggle-able panel)
 */
export function SiteEditor() {
  const t = useTranslations("website");
  const utils = trpc.useUtils();

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: site, isLoading } = trpc.website.getSite.useQuery(undefined);

  const selectedPage =
    site?.pages.find((page) => page.id === selectedPageId) ??
    site?.pages[0];

  useEffect(() => {
    if (site && !previewUrl) {
      setPreviewUrl(`${window.location.origin}/site/${site.slug}`);
    }
  }, [site, previewUrl]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const invalidateSite = () => void utils.website.getSite.invalidate();

  const seed = trpc.website.seedDefaultWebsite.useMutation({
    onSuccess: () => { toast.success(t("editor.saved")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  const publish = trpc.website.publishSite.useMutation({
    onSuccess: () => { toast.success(t("editor.published")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  const unpublish = trpc.website.unpublishSite.useMutation({
    onSuccess: () => { toast.success(t("editor.unpublished")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  const updateSite = trpc.website.updateSite.useMutation({
    onSuccess: () => { toast.success(t("editor.saved")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  const reorderPages = trpc.website.reorderPages.useMutation({
    onSuccess: () => { toast.success(t("editor.saved")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  const reorderBlocks = trpc.website.reorderBlocks.useMutation({
    onSuccess: () => { toast.success(t("editor.saved")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  const removeBlock = trpc.website.removeBlock.useMutation({
    onSuccess: () => { toast.success(t("editor.saved")); invalidateSite(); },
    onError: (err) => toast.error(err.message),
  });

  // ── Guards ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <EmptyState
        icon={Globe}
        title={t("title")}
        description={t("subtitle")}
        action={{
          label: t("editor.create"),
          onClick: () => {
            seed.mutate({ slug: "moja-klinika", templateId: "clean-modern" });
          },
          icon: LayoutTemplate,
        }}
      />
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Publish controls — header row */}
      <PublishControls
        siteId={site.id}
        siteTitle={site.title}
        siteSlug={site.slug}
        status={site.status as "draft" | "published" | "unpublished"}
        previewUrl={previewUrl}
        isPublishing={publish.isPending}
        isUnpublishing={unpublish.isPending}
        onPublish={() => publish.mutate({ id: site.id })}
        onUnpublish={() => unpublish.mutate({ id: site.id })}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left sidebar — pages + template */}
        <div className="lg:col-span-1">
          <PageSidebar
            pages={site.pages}
            selectedPageId={selectedPageId}
            siteId={site.id}
            siteTemplateId={site.templateId}
            isUpdatingTemplate={updateSite.isPending}
            onSelectPage={setSelectedPageId}
            onReorderPages={(orders) => reorderPages.mutate({ pageOrders: orders })}
            onChangeTemplate={(templateId) =>
              updateSite.mutate({ id: site.id, settings: { templateId } })
            }
          />
        </div>

        {/* Right panel — block palette for selected page */}
        <div className="lg:col-span-2">
          <BlockPalette
            page={selectedPage}
            onReorderBlocks={(orders) => reorderBlocks.mutate({ blockOrders: orders })}
            onRemoveBlock={(blockId) => removeBlock.mutate({ id: blockId })}
          />
        </div>
      </div>
    </div>
  );
}
