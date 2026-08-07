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
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
  Droplet,
  ShieldAlert,
} from "lucide-react";
import { PageLoading } from "@/components/common/loading";
import { PostDetailModal } from "@/components/marketing/PostDetailModal";
import { GenerationWizard } from "@/components/marketing/GenerationWizard";

type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_review: "bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  scheduled: "bg-blue-200 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  published: "bg-green-200 text-green-800 dark:bg-green-950 dark:text-green-300",
  archived: "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600",
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

  // Modals state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fromDate = new Date(year, month, 1).toISOString();
  const toDate = new Date(year, month + 1, 0).toISOString();

  const { data: posts, isLoading: postsLoading, refetch } = trpc.marketing.getPostsByDateRange.useQuery({
    from: fromDate,
    to: toDate,
  });

  const updatePost = trpc.marketing.updatePost.useMutation({
    onSuccess: () => { refetch(); toast.success("Príspevok bol presunutý"); },
    onError: (e) => toast.error(e.message),
  });

  // Drag-and-drop reschedule state
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setDetailModalOpen(true);
  };

  const handleDrop = (day: number) => {
    if (!draggedPostId) return;
    const newDate = new Date(year, month, day, 12, 0, 0).toISOString();
    updatePost.mutate({ postId: draggedPostId, scheduledDate: newDate });
    setDraggedPostId(null);
    setDragOverDay(null);
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

  const months = t.raw("marketing.planner.months") as string[];
  const dayHeaders = t.raw("marketing.planner.dayHeaders") as string[];

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
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("marketing.planner.newPost")}
        </button>
      </div>

      {/* Calendar */}
      {postsLoading ? (
        <PageLoading />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <button onClick={prevMonth} className="rounded-md p-1.5 hover:bg-accent cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {months[month]} {year}
            </span>
            <button onClick={nextMonth} className="rounded-md p-1.5 hover:bg-accent cursor-pointer">
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
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r bg-muted/10" />
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
                  className={`min-h-[90px] border-b border-r p-1.5 transition-colors ${
                    isToday ? "bg-primary/5" : ""
                  } ${dragOverDay === day ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-inset ring-blue-400" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(day); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => handleDrop(day)}
                >
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.map((post) => {
                      const status = post.status as PostStatus;
                      const colorClass = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
                      const variants = (post.variants as Record<string, any>) ?? {};
                      const plats = Object.keys(variants);
                      const platLabel = plats.join(", ") || "Post";

                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={() => setDraggedPostId(post.id)}
                          onDragEnd={() => { setDraggedPostId(null); setDragOverDay(null); }}
                          onClick={() => handlePostClick(post.id)}
                          className={`flex items-center justify-between rounded px-1.5 py-1 text-[10px] font-medium cursor-grab active:cursor-grabbing transition-all hover:opacity-80 shadow-xs ${colorClass} ${draggedPostId === post.id ? "opacity-40" : ""}`}
                        >
                          <span className="truncate">{platLabel}</span>
                          <div className="flex items-center gap-0.5 shrink-0 ml-1">
                            {!post.hasConsent && (
                              <span title="Chýba súhlas pacienta">
                                <ShieldAlert className="h-3 w-3 text-amber-600" />
                              </span>
                            )}
                            {post.hasWatermark && (
                              <span title="Vodoznak">
                                <Droplet className="h-2.5 w-2.5 text-blue-600" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {(Object.entries(STATUS_COLORS) as [PostStatus, string][]).map(([s, c]) => {
          const Icon = STATUS_ICONS[s];
          return (
            <span key={s} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${c}`}>
              {Icon && <Icon className="h-3 w-3" />}
              {t(`marketing.statusLabels.${s}`) ?? s}
            </span>
          );
        })}

        <div className="ml-auto flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            Chýba súhlas
          </span>
          <span className="inline-flex items-center gap-1">
            <Droplet className="h-3.5 w-3.5 text-blue-600" />
            Vodoznak
          </span>
        </div>
      </div>

      {/* Full 5-Step AI Generation Wizard */}
      <GenerationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={() => refetch()}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        postId={selectedPostId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdated={() => refetch()}
      />
    </div>
  );
}
