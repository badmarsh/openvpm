"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
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
          className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const t = useTranslations();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [generatedReply, setGeneratedReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!reviewText.trim()) {
      setError(t("marketing.reviews.errorEmptyReview"));
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/marketing-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "suggest_review_reply",
          reviewText,
          reviewRating: rating,
        }),
      });
      const data = await res.json();
      if (data.success) setGeneratedReply(data.content ?? "");
      else setError(data.error ?? t("marketing.reviews.errorGeneration"));
    } catch {
      setError(t("marketing.reviews.errorConnection"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadTemplate = (tpl: (typeof REVIEW_TEMPLATE_META)[number]) => {
    setReviewText(t(`marketing.reviews.templateTexts.${tpl.id}` as any));
    setRating(tpl.rating);
    setGeneratedReply("");
  };

  const guidelines = t.raw("marketing.reviews.guidelines") as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Star className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("marketing.reviews.pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("marketing.reviews.pageSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Input panel */}
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">{t("marketing.reviews.inputPanel")}</h2>

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
                  <span className="truncate font-medium">{t(`marketing.reviews.templates.${tpl.id}` as any)}</span>
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
            onClick={handleGenerate}
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
            <h2 className="text-sm font-semibold">{t("marketing.reviews.outputTitle")}</h2>
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
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          )}

          {generatedReply && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
              {t("marketing.reviews.warning")}
            </div>
          )}
        </div>
      </div>

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
