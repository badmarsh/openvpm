"use client";

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

interface SitePreviewProps {
  /** Full URL to the published/draft public site */
  previewUrl: string;
  /** Whether to show as an embedded iframe or just a link */
  mode?: "iframe" | "link";
}

/**
 * SitePreview — renders a live iframe of the public site,
 * or a compact link when iframe mode is not appropriate.
 *
 * The iframe is sandboxed and only shown when a previewUrl is available.
 */
export function SitePreview({ previewUrl, mode = "link" }: SitePreviewProps) {
  const t = useTranslations("website");

  if (!previewUrl) return null;

  if (mode === "iframe") {
    return (
      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          {/* Browser chrome decoration */}
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="flex-1 truncate rounded bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {previewUrl}
          </span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("editor.preview")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <iframe
          src={previewUrl}
          title={t("editor.preview")}
          className="h-[600px] w-full"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    );
  }

  // Link mode — compact inline link used in publish controls
  return (
    <a
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {previewUrl}
    </a>
  );
}
