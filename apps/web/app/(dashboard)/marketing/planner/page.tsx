"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  X,
  Loader2,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
} from "lucide-react";
import { TableSkeleton } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";

type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: "bg-gray-200 text-gray-700",
  in_review: "bg-amber-200 text-amber-800",
  approved: "bg-emerald-200 text-emerald-800",
  scheduled: "bg-blue-200 text-blue-800",
  published: "bg-green-200 text-green-800",
  archived: "bg-gray-100 text-gray-400",
};

const STATUS_ICONS: Record<PostStatus, React.ElementType> = {
  draft: FileText,
  in_review: AlertCircle,
  approved: CheckCircle2,
  scheduled: Clock,
  published: Send,
  archived: FileText,
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function MarketingPlannerPage() {
  const t = useTranslations();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [wizardOpen, setWizardOpen] = useState(false);

  // Wizard state
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<"IG" | "FB" | "GBP">("IG");
  const [scheduledDate, setScheduledDate] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const fromDate = new Date(year, month, 1).toISOString();
  const toDate = new Date(year, month + 1, 0).toISOString();

  const { data: posts, refetch } = trpc.marketing.getPostsByDateRange.useQuery({
    from: fromDate,
    to: toDate,
  });

  const createPost = trpc.marketing.createPost.useMutation({
    onSuccess: () => {
      refetch();
      setWizardOpen(false);
      setTopic("");
      setGeneratedContent("");
      setScheduledDate("");
      toast.success(t("marketing.planner.successCreate"));
    },
    onError: (e) => toast.error(e.message ?? t("common.error_default")),
  });

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const handleGenerate = async () => {
    if (!topic.trim()) { setGenError(t("marketing.planner.errorEmptyTopic")); return; }
    setIsGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/marketing-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "generate_social_post",
          prompt: topic,
          platform,
        }),
      });
      const data = await res.json();
      if (data.success) setGeneratedContent(data.content ?? "");
      else setGenError(data.error ?? t("marketing.planner.errorGeneration"));
    } catch {
      setGenError(t("marketing.planner.errorConnection"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePost = () => {
    if (!generatedContent.trim()) return;
    createPost.mutate({
      status: scheduledDate ? "scheduled" : "draft",
      variants: {
        [platform]: {
          platform,
          caption: generatedContent,
          hashtags: [],
          mediaUrl: "",
          aspectRatio: "1:1",
        },
      },
      scheduledDate: scheduledDate || undefined,
      topicInputs: { topic },
      note: t("marketing.postCreatedNote"),
    });
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7; // Mon-first
  const postsByDay = new Map<number, typeof posts>();
  posts?.forEach((post) => {
    if (!post.scheduledDate) return;
    const d = new Date(post.scheduledDate).getDate();
    if (!postsByDay.has(d)) postsByDay.set(d, []);
    postsByDay.get(d)!.push(post);
  });

  const rawMonths = t.raw("marketing.planner.months");
  const months: string[] = Array.isArray(rawMonths)
    ? (rawMonths as string[])
    : ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"];
  const rawDayHeaders = t.raw("marketing.planner.dayHeaders");
  const dayHeaders: string[] = Array.isArray(rawDayHeaders)
    ? (rawDayHeaders as string[])
    : ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">{t("marketing.planner.pageTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("marketing.planner.pageSubtitle")}</p>
          </div>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("marketing.planner.newPost")}
        </button>
      </div>

      {/* Calendar navigation */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <button onClick={prevMonth} className="rounded-md p-1.5 hover:bg-accent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">
            {months[month]} {year}
          </span>
          <button onClick={nextMonth} className="rounded-md p-1.5 hover:bg-accent">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {dayHeaders.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r bg-muted/10" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const dayPosts = postsByDay.get(day) ?? [];

            return (
              <div
                key={day}
                className={`min-h-[80px] border-b border-r p-1.5 ${isToday ? "bg-primary/5" : ""}`}
              >
                <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.map((post) => {
                    const status = post.status as PostStatus;
                    const colorClass = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
                    const variants = post.variants as Record<string, { platform?: string }>;
                    const plat = Object.keys(variants)[0] ?? "";
                    return (
                      <div
                        key={post.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${colorClass}`}
                        title={`${t(`marketing.planner.platformLabels.${plat}`) ?? plat} — ${t(`marketing.statusLabels.${status}`)}`}
                      >
                        {t(`marketing.planner.platformLabels.${plat}`) ?? plat}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(STATUS_COLORS) as [PostStatus, string][]).map(([s, c]) => {
          const Icon = STATUS_ICONS[s];
          return (
            <span key={s} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>
              {Icon && <Icon className="h-3 w-3" />}
              {t(`marketing.statusLabels.${s}`)}
            </span>
          );
        })}
      </div>

      {/* AI Generation Wizard Slide-over */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex">
          <button
            className="flex-1 bg-black/40"
            onClick={() => setWizardOpen(false)}
            aria-label={t("marketing.planner.ariaClose")}
          />
          <div className="flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">{t("marketing.planner.wizardTitle")}</span>
              </div>
              <button onClick={() => setWizardOpen(false)} className="rounded-md p-1.5 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 px-6 py-5">
              {/* Platform */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("marketing.planner.platformLabel")}</label>
                <div className="flex gap-2">
                  {(["IG", "FB", "GBP"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${platform === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
                    >
                      {t(`marketing.planner.platformLabels.${p}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("marketing.planner.topicLabel")}</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder={t("marketing.planner.topicPlaceholder")}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {genError && <p className="mt-1 text-xs text-destructive">{genError}</p>}
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90 transition-colors"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? t("marketing.planner.generatingButton") : t("marketing.planner.generateButton")}
              </button>

              {/* Generated output */}
              {generatedContent && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("marketing.planner.generatedLabel")}</label>
                  <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={10}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono"
                  />
                </div>
              )}

              {/* Schedule date */}
              {generatedContent && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("marketing.planner.dateLabel")}</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            {generatedContent && (
              <div className="border-t px-6 py-4">
                <button
                  onClick={handleSavePost}
                  disabled={createPost.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {scheduledDate ? t("marketing.planner.saveSchedule") : t("marketing.planner.saveDraft")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
