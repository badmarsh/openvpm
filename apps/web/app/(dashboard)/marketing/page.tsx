"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
  Lightbulb,
  ArrowRight,
  Bell,
  Eye,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { TableSkeleton } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { GenerationWizard } from "@/components/marketing/GenerationWizard";

type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";

const STATUS_CONFIG: Record<PostStatus, { color: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: FileText },
  in_review: { color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", icon: AlertCircle },
  approved: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", icon: CheckCircle2 },
  scheduled: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: Clock },
  published: { color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", icon: CheckCircle2 },
  archived: { color: "bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-600", icon: FileText },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Preventive Care & Wellness": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Educational": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  "Practice & Team": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300",
  "Client & Patient Engagement": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  "Promotions & Announcements": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  "Community & Events": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300",
};

export default function MarketingPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"overview" | "templates">("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Wizard state for post ideas
  const [selectedTopic, setSelectedTopic] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);

  // Template preview state
  const [previewTemplate, setPreviewTemplate] = useState<{
    name: string;
    description: string;
    category: string;
    platforms: string[];
    exampleCaption?: string;
  } | null>(null);

  // Approvals alert dismiss
  const [approvalsDismissed, setApprovalsDismissed] = useState(false);

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = trpc.marketing.getPosts.useQuery({ limit: 50 });
  const { data: templates, isLoading: templatesLoading } = trpc.marketing.getTemplates.useQuery();
  const { data: suggestedIdeas, isLoading: ideasLoading } = trpc.marketing.getSuggestedIdeas.useQuery();

  const inReviewCount = posts?.filter((p) => (p.status as PostStatus) === "in_review").length ?? 0;

  const seedTemplates = trpc.marketing.seedDefaultTemplates.useMutation({
    onSuccess: () => { toast.success(t("marketing.templatesSeeded") ?? "Šablóny pridané"); },
    onError: (e) => toast.error(e.message ?? t("common.error_default")),
  });

  const handleUseIdea = (topicTitle: string) => {
    setSelectedTopic(topicTitle);
    setWizardOpen(true);
  };

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
            <h2 className="font-heading text-xl font-semibold">{t("marketing.pageTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("marketing.pageSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedTopic(""); setWizardOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t("marketing.newPost")}
          </button>
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

      {/* Pending Approvals Alert */}
      {!approvalsDismissed && !postsLoading && inReviewCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {inReviewCount} {inReviewCount === 1 ? "príspevok čaká na schválenie" : "príspevky čakajú na schválenie"}
            </span>
            <Link href="/marketing/planner" className="text-xs font-medium text-amber-700 dark:text-amber-400 underline hover:no-underline">
              Zobraziť v plánovači
            </Link>
          </div>
          <button
            onClick={() => setApprovalsDismissed(true)}
            className="rounded p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* AI Post Ideas Section */}
      <div className="rounded-xl border bg-gradient-to-r from-amber-500/10 via-primary/5 to-background p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-sm">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            💡 AI Nápady na príspevky na tento týždeň
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">Automatické odporúčania</span>
        </div>

        {ideasLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {suggestedIdeas?.slice(0, 3).map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between rounded-lg border bg-card p-3 shadow-xs hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span className="font-semibold text-primary">{idea.goal}</span>
                    <span>{idea.platforms.join(", ")}</span>
                  </div>
                  <h4 className="text-xs font-bold leading-tight line-clamp-2">{idea.title}</h4>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{idea.concept}</p>
                </div>
                <button
                  onClick={() => handleUseIdea(idea.title)}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Použiť tento nápad <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary font-bold"
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
            <TableSkeleton rows={8} cols={3} />
          ) : !posts || posts.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title={t("marketing.emptyTitle")}
              description={t("marketing.emptyDescription")}
              action={{
                label: t("marketing.emptyAction"),
                icon: Sparkles,
                onClick: () => { setWizardOpen(true); }
              }}
            />
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
                        {t(`marketing.statusLabels.${status}`)}
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
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 cursor-pointer"
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
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleUseIdea(tpl.name as string)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        {t("marketing.templateUse")}
                      </button>
                      <button
                        onClick={() => setPreviewTemplate({
                          name: tpl.name as string,
                          description: tpl.description as string,
                          category: tpl.category as string,
                          platforms: platforms,
                          exampleCaption: (tpl.exampleCaption as string) ?? undefined,
                        })}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        Náhľad
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Generation Wizard Modal */}
      <GenerationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        initialTopic={selectedTopic}
        onCreated={() => refetchPosts()}
      />

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(o) => !o && setPreviewTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-primary" />
              Náhľad šablóny
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_COLORS[previewTemplate.category] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                  {previewTemplate.category}
                </span>
              </div>
              <h3 className="text-sm font-bold">{previewTemplate.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{previewTemplate.description}</p>
              <div className="flex flex-wrap gap-1">
                {previewTemplate.platforms.map((p) => (
                  <span key={p} className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{p}</span>
                ))}
              </div>
              {previewTemplate.exampleCaption && (
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Ukážkový text</p>
                  <p className="text-xs italic text-foreground leading-relaxed">{previewTemplate.exampleCaption}</p>
                </div>
              )}
              <button
                onClick={() => {
                  handleUseIdea(previewTemplate.name);
                  setPreviewTemplate(null);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Použiť túto šablónu
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
