"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublishControlsProps {
  siteId: string;
  siteTitle: string;
  siteSlug: string;
  status: "draft" | "published" | "unpublished";
  previewUrl: string;
  isPublishing: boolean;
  isUnpublishing: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function PublishControls({
  siteTitle,
  siteSlug,
  status,
  previewUrl,
  isPublishing,
  isUnpublishing,
  onPublish,
  onUnpublish,
}: PublishControlsProps) {
  const t = useTranslations("website");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-heading text-xl font-semibold">{siteTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {t(`status.${status}` as "status.draft")} · {siteSlug}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Eye className="mr-2 h-4 w-4" />
            {t("editor.preview")}
          </Link>
        </Button>
        {status === "published" ? (
          <Button
            variant="secondary"
            onClick={onUnpublish}
            disabled={isUnpublishing}
          >
            {isUnpublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("editor.unpublish")}
          </Button>
        ) : (
          <Button onClick={onPublish} disabled={isPublishing}>
            {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("editor.publish")}
          </Button>
        )}
      </div>
    </div>
  );
}
