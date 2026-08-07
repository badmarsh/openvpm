"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Star,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Heart,
  Copy,
  Check,
  MessageSquare,
  Send,
  User,
  CheckCircle2,
} from "lucide-react";

const REVIEW_TEMPLATE_META = [
  { id: "price", rating: 2, icon: ThumbsDown, color: "text-rose-600" },
  { id: "waiting", rating: 3, icon: AlertTriangle, color: "text-amber-600" },
  { id: "death", rating: 5, icon: Heart, color: "text-violet-600" },
  { id: "praise", rating: 5, icon: ThumbsUp, color: "text-emerald-600" },
] as const;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const t = useTranslations();
  const [activeMode, setActiveMode] = useState<"list" | "generator">("list");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [generatedReply, setGeneratedReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: gmbReviews, isLoading: reviewsLoading } = trpc.marketing.fetchGmbReviews.useQuery();

  // Track sent replies locally per session
  const [sentReplies, setSentReplies] = useState<Record<string, string>>({});

  const replyToGmbReview = trpc.marketing.replyToGmbReview.useMutation({
    onSuccess: (data) => {
      setSentReplies((prev) => ({ ...prev, [data.reviewId]: data.replyText }));
      toast.success("Odpoveď bola odoslaná");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateReviewReplyMutation = trpc.marketing.generateReviewReply.useMutation({
    onSuccess: (data) => {
      setGeneratedReply(data.reply);
      setActiveMode("generator");
      if (!data.generated) toast.info("AI nedostupná — použitá šablóna");
    },
    onError: (e) => { setError(e.message); setIsGenerating(false); },
  });

  const handleGenerate = async (overrideText?: string, overrideRating?: number) => {
    const textToUse = overrideText ?? reviewText;
    const ratingToUse = overrideRating ?? rating;

    if (!textToUse.trim()) {
      setError(t("marketing.reviews.errorEmptyReview") ?? "Zadajte text recenzie");
      return;
    }
    setIsGenerating(true);
    setError("");
    generateReviewReplyMutation.mutate({
      reviewText: textToUse,
      rating: ratingToUse,
    }, {
      onSettled: () => setIsGenerating(false),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    toast.success("Odpoveď bola skopírovaná");
    setTimeout(() => setCopied(false), 2000);
  };

  const loadTemplate = (tpl: (typeof REVIEW_TEMPLATE_META)[number]) => {
    setReviewText(t(`marketing.reviews.templateTexts.${tpl.id}`));
    setRating(tpl.rating);
    setGeneratedReply("");
  };

  const guidelines = t.raw("marketing.reviews.guidelines") as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
            <Star className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">{t("marketing.reviews.pageTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("marketing.reviews.pageSubtitle")}</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1 rounded-lg border bg-muted p-1">
          <button
            onClick={() => setActiveMode("list")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Google Recenzie
          </button>
          <button
            onClick={() => setActiveMode("generator")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeMode === "generator"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Generátor odpovedí
          </button>
        </div>
      </div>

      {/* Mode: List of GMB Reviews */}
      {activeMode === "list" && (
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {gmbReviews?.map((rev) => (
                <div key={rev.id} className="rounded-xl border bg-card p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {rev.authorName.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">{rev.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StarRow rating={rev.rating} />
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          rev.replyStatus === "replied"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {rev.replyStatus === "replied" ? "Vybavené" : "Čaká na odpoveď"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed">{rev.text}</p>

                  {/* Suggested AI Reply preview */}
                  {rev.suggestedReply && (
                    <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Navrhovaná Fear-Free AI Odpoveď:
                      </div>
                      <p className="text-muted-foreground italic">{rev.suggestedReply}</p>

                      <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              setReviewText(rev.text);
                              setRating(rev.rating);
                              setGeneratedReply(rev.suggestedReply);
                              setActiveMode("generator");
                            }}
                            className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
                          >
                            Upraviť odpoveď
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(rev.suggestedReply);
                              toast.success("Odpoveď bola skopírovaná do schránky");
                            }}
                            className="inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-medium hover:bg-accent"
                          >
                            <Copy className="h-3 w-3" />
                            Kopírovať
                          </button>
                          {sentReplies[rev.id] ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              Odoslané
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                replyToGmbReview.mutate({
                                  reviewId: rev.id,
                                  replyText: rev.suggestedReply,
                                })
                              }
                              disabled={replyToGmbReview.isPending}
                              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {replyToGmbReview.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              Odoslať odpoveď
                            </button>
                          )}
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode: Generator */}
      {activeMode === "generator" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Input panel */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">{t("marketing.reviews.inputPanel")}</h3>

            {/* Quick templates */}
            <div>
              <p className="mb-2 text-xs text-muted-foreground">{t("marketing.reviews.quickScenarios")}</p>
              <div className="grid grid-cols-2 gap-2">
                {REVIEW_TEMPLATE_META.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl)}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
                  >
                    <tpl.icon className={`h-3.5 w-3.5 shrink-0 ${tpl.color}`} />
                    <span className="truncate font-medium">{t(`marketing.reviews.templates.${tpl.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Star rating input */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("marketing.reviews.ratingLabel")}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${s <= (hoveredStar ?? rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-2 self-center text-sm text-muted-foreground">
                  {rating}★
                </span>
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("marketing.reviews.reviewTextLabel")}</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                placeholder={t("marketing.reviews.reviewTextPlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !reviewText.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? t("marketing.reviews.generatingButton") : t("marketing.reviews.generateButton")}
            </button>
          </div>

          {/* Right: Output panel */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t("marketing.reviews.outputTitle")}</h3>
              {generatedReply && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t("marketing.reviews.copiedButton") : t("marketing.reviews.copyButton")}
                </button>
              )}
            </div>

            {!generatedReply ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("marketing.reviews.emptyTitle")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {t("marketing.reviews.emptyDescription")}
                </p>
              </div>
            ) : (
              <textarea
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                rows={14}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono"
              />
            )}

            {generatedReply && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
                {t("marketing.reviews.warning")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="rounded-xl border bg-muted/30 p-5">
        <h3 className="mb-3 text-sm font-semibold">{t("marketing.reviews.guidelinesTitle")}</h3>
        <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          {guidelines.map((g) => (
            <div key={g}>{g}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
