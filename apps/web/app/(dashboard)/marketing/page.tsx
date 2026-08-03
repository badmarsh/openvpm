"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import {
  Megaphone,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";

type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";

const STATUS_CONFIG: Record<PostStatus, { color: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-100 text-gray-700", icon: FileText },
  in_review: { color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  approved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  scheduled: { color: "bg-blue-100 text-blue-700", icon: Clock },
  published: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  archived: { color: "bg-gray-100 text-gray-500", icon: FileText },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Preventive Care & Wellness": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Educational": "bg-blue-50 text-blue-700 border-blue-200",
  "Practice & Team": "bg-violet-50 text-violet-700 border-violet-200",
  "Client & Patient Engagement": "bg-amber-50 text-amber-700 border-amber-200",
  "Promotions & Announcements": "bg-rose-50 text-rose-700 border-rose-200",
  "Community & Events": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function MarketingPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"overview" | "templates">("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: posts, isLoading: postsLoading } = trpc.marketing.getPosts.useQuery({ limit: 10 });
  const { data: templates, isLoading: templatesLoading } = trpc.marketing.getTemplates.useQuery();
  const seedTemplates = trpc.marketing.seedDefaultTemplates.useMutation();

  const stats = {
    total: posts?.length ?? 0,
    draft: posts?.filter((p) => (p.status as PostStatus) === "draft").length ?? 0,
    scheduled: posts?.filter((p) => (p.status as PostStatus) === "scheduled").length ?? 0,
    published: posts?.filter((p) => (p.status as PostStatus) === "published").length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("marketing.pageTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("marketing.pageSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/marketing/planner"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("marketing.newPost")}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { labelKey: "marketing.statsTotal", value: stats.total, icon: Megaphone, color: "text-primary" },
          { labelKey: "marketing.statsDraft", value: stats.draft, icon: FileText, color: "text-gray-500" },
          { labelKey: "marketing.statsScheduled", value: stats.scheduled, icon: Clock, color: "text-blue-600" },
          { labelKey: "marketing.statsPublished", value: stats.published, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.labelKey} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs font-medium">{t(stat.labelKey)}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{postsLoading ? "—" : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {[
          { id: "overview", labelKey: "marketing.tabOverview" },
          { id: "templates", labelKey: "marketing.tabTemplates" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "overview" | "templates")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {postsLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <span className="text-sm">{t("marketing.loading")}</span>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">{t("marketing.emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                {t("marketing.emptyDescription")}
              </p>
              <Link
                href="/marketing/planner"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" />
                {t("marketing.emptyAction")}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => {
                const status = post.status as PostStatus;
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
                const StatusIcon = cfg.icon;
                const scheduledDate = post.scheduledDate
                  ? new Date(post.scheduledDate).toLocaleDateString("sk-SK")
                  : null;
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {t(`marketing.statusLabels.${status}` as any)}
                      </span>
                      <span className="truncate text-sm text-muted-foreground">
                        {scheduledDate ? `📅 ${scheduledDate}` : t("marketing.noDate")}
                      </span>
                    </div>
                    <Link
                      href="/marketing/planner"
                      className="shrink-0 text-xs text-primary hover:underline"
                    >
                      {t("marketing.openLink")}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Templates */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {templatesLoading ? t("marketing.templatesLoading") : t("marketing.templatesCount", { count: templates?.length ?? 0 })}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 ${viewMode === "grid" ? "bg-accent" : "hover:bg-accent/50"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-1.5 ${viewMode === "list" ? "bg-accent" : "hover:bg-accent/50"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {templatesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : !templates || templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">{t("marketing.templatesEmptyTitle")}</p>
              <button
                onClick={() => seedTemplates.mutate()}
                disabled={seedTemplates.isPending}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {seedTemplates.isPending ? t("marketing.templatesEmptyActionPending") : t("marketing.templatesEmptyAction")}
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-2"
              }
            >
              {templates.map((tpl) => {
                const catColor = CATEGORY_COLORS[tpl.category as string] ?? "bg-gray-50 text-gray-700 border-gray-200";
                const platforms = (tpl.platforms as string[]) ?? [];
                return (
                  <div
                    key={tpl.id}
                    className="group rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${catColor}`}>
                        {tpl.category as string}
                      </span>
                      <div className="flex gap-1">
                        {platforms.slice(0, 3).map((p) => (
                          <span key={p} className="text-[10px] font-bold text-muted-foreground bg-muted rounded px-1">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug">{tpl.name as string}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{tpl.description as string}</p>
                    <Link
                      href="/marketing/planner"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Sparkles className="h-3 w-3" />
                      {t("marketing.templateUse")}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
