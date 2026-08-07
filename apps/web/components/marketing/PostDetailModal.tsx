"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  ShieldAlert,
  Droplet,
  History,
  Sparkles,
  Calendar,
} from "lucide-react";

type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";

interface PostDetailModalProps {
  postId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const STATUS_BADGES: Record<PostStatus, { color: string; labelKey: string }> = {
  draft: { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", labelKey: "draft" },
  in_review: { color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", labelKey: "in_review" },
  approved: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", labelKey: "approved" },
  scheduled: { color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300", labelKey: "scheduled" },
  published: { color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", labelKey: "published" },
  archived: { color: "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600", labelKey: "archived" },
};

export function PostDetailModal({
  postId,
  open,
  onOpenChange,
  onUpdated,
}: PostDetailModalProps) {
  const t = useTranslations();
  const [activePlatform, setActivePlatform] = useState<string>("IG");
  const [reviewNote, setReviewNote] = useState("");

  const { data: posts, refetch } = trpc.marketing.getPosts.useQuery(
    {},
    { enabled: open }
  );

  const post = posts?.find((p) => p.id === postId);

  const updateStatus = trpc.marketing.updatePostStatus.useMutation({
    onSuccess: () => {
      toast.success(t("marketing.planner.successUpdate") ?? "Príspevok aktualizovaný");
      refetch();
      onUpdated?.();
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePost = trpc.marketing.updatePost.useMutation({
    onSuccess: () => {
      toast.success(t("marketing.planner.successUpdate") ?? "Príspevok aktualizovaný");
      refetch();
      onUpdated?.();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!post) return null;

  const status = post.status as PostStatus;
  const variants = (post.variants as Record<string, any>) ?? {};
  const platforms = Object.keys(variants);
  const currentVariant = variants[activePlatform] || variants[platforms[0]] || {};
  const history = (post.history as Array<{ status: string; timestamp: string; user: string; note?: string }>) ?? [];

  const handleStatusChange = (newStatus: PostStatus) => {
    updateStatus.mutate({
      postId: post.id,
      newStatus,
      note: reviewNote || undefined,
    });
    setReviewNote("");
  };

  const toggleConsent = () => {
    updatePost.mutate({
      postId: post.id,
      hasConsent: !post.hasConsent,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="slideover" className="flex flex-col overflow-y-auto max-w-2xl">
        <DialogHeader className="border-b px-6 py-4 -mx-6 -mt-6 mb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("marketing.postDetail.title") ?? "Detail príspevku"}
            </DialogTitle>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                STATUS_BADGES[status]?.color
              }`}
            >
              {t(`marketing.statusLabels.${status}`) ?? status}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 py-4">
          {/* Patient Consent Warning Banner */}
          {!post.hasConsent && (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-800 dark:text-amber-200 text-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{t("marketing.postDetail.consentBanner") ?? "Súhlas pacienta nebol potvrdený"}</span>
              </div>
              <button
                onClick={toggleConsent}
                className="text-xs font-semibold underline hover:no-underline"
              >
                {t("marketing.postDetail.confirmConsent") ?? "Potvrdiť súhlas"}
              </button>
            </div>
          )}

          {/* Platform Tabs */}
          {platforms.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("marketing.postDetail.platforms") ?? "Platformy"}
              </label>
              <div className="flex gap-1.5 border-b pb-2">
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setActivePlatform(plat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activePlatform === plat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Content */}
          <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {activePlatform} {t("marketing.postDetail.variant") ?? "verzia"}
              </span>
              {post.hasWatermark && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Droplet className="h-3 w-3 text-blue-500" /> Vodoznak aktívny
                </span>
              )}
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {currentVariant.caption || "Bez textu"}
            </p>

            {currentVariant.hashtags && currentVariant.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {currentVariant.hashtags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Date info */}
          {post.scheduledDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                Naplánované na: {new Date(post.scheduledDate).toLocaleString("sk-SK")}
              </span>
            </div>
          )}

          {/* Workflow Action Buttons */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("marketing.postDetail.workflow") ?? "Schvaľovací proces"}
            </span>

            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={2}
              placeholder={t("marketing.postDetail.notePlaceholder") ?? "Poznámka k schváleniu / zmenám..."}
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              {status === "draft" && (
                <button
                  onClick={() => handleStatusChange("in_review")}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t("marketing.postDetail.submitReview") ?? "Odoslať na schválenie"}
                </button>
              )}

              {(status === "in_review" || status === "draft") && (
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("marketing.postDetail.approve") ?? "Schváliť príspevok"}
                </button>
              )}

              {status === "approved" && (
                <button
                  onClick={() => handleStatusChange("scheduled")}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {t("marketing.postDetail.schedulePost") ?? "Naplánovať publikovanie"}
                </button>
              )}

              {status === "scheduled" && (
                <button
                  onClick={() => handleStatusChange("published")}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t("marketing.postDetail.publishNow") ?? "Publikovať teraz"}
                </button>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          {history.length > 0 && (
            <div className="space-y-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <History className="h-3.5 w-3.5" />
                {t("marketing.postDetail.auditHistory") ?? "História schvaľovania"}
              </span>
              <div className="space-y-2 border-l-2 border-muted pl-4">
                {history.map((entry, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{entry.user}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {entry.status}
                      </span>
                        <span className="text-[10px] text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString("sk-SK")}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-0.5 text-muted-foreground italic">"{entry.note}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
