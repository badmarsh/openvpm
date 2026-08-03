"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import {
  Workflow,
  Power,
  PowerOff,
  Trash2,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2,
  Activity,
  Sparkles,
} from "lucide-react";

const ACTION_ICONS: Record<string, React.ElementType> = {
  sms: MessageSquare,
  email: Mail,
  webhook: Workflow,
};

export default function AutomationsPage() {
  const t = useTranslations();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logsForId, setLogsForId] = useState<string | null>(null);

  const { data: automations, isLoading, refetch } = trpc.automations.getAutomations.useQuery();
  const { data: logs } = trpc.automations.getLogs.useQuery(
    { automationId: logsForId ?? undefined, limit: 20 },
    { enabled: !!logsForId }
  );

  const seedMutation = trpc.automations.seedDefaultAutomations.useMutation({ onSuccess: () => refetch() });
  const toggleMutation = trpc.automations.toggleAutomation.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.automations.deleteAutomation.useMutation({ onSuccess: () => refetch() });

  const activeCount = automations?.filter((a) => a.isActive).length ?? 0;
  const totalCount = automations?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Workflow className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("automations.pageTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("automations.pageSubtitle")}</p>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-emerald-600">{activeCount}</span> /{" "}
            {t("automations.activeCount", { active: activeCount, total: totalCount })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "automations.statsTotal", value: totalCount, icon: Workflow, color: "text-violet-600" },
          { label: "automations.statsActive", value: activeCount, icon: Activity, color: "text-emerald-600" },
          { label: "automations.statsPaused", value: totalCount - activeCount, icon: PowerOff, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-medium">{t(s.label)}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{isLoading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Automations list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !automations || automations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Workflow className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">{t("automations.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground/70">{t("automations.emptyDescription")}</p>
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {seedMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t("automations.emptyAction")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((auto) => {
            const ActionIcon = ACTION_ICONS[auto.actionType as string] ?? MessageSquare;
            const triggerLabel = t(`automations.triggerLabels.${auto.triggerType as string}` as any);
            const isExpanded = expandedId === auto.id;
            const conditions = auto.conditions as { delayDays?: number };
            const payload = auto.actionPayload as { templatePrompt?: string; webhookUrl?: string };

            return (
              <div
                key={auto.id}
                className={`rounded-xl border bg-card shadow-sm transition-shadow ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Active indicator */}
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${auto.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                  />

                  {/* Icon */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${auto.isActive ? "bg-violet-50" : "bg-muted"}`}>
                    <ActionIcon className={`h-4 w-4 ${auto.isActive ? "text-violet-600" : "text-muted-foreground"}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{auto.name as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {triggerLabel}
                      {conditions?.delayDays !== undefined && conditions.delayDays > 0
                        ? ` ${t("automations.daysDelay", { days: conditions.delayDays })}`
                        : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setLogsForId(logsForId === auto.id ? null : auto.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title={t("automations.tooltipLogs")}
                    >
                      <Activity className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleMutation.mutate({ automationId: auto.id })}
                      disabled={toggleMutation.isPending}
                      className={`rounded-md p-1.5 transition-colors ${auto.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-accent"}`}
                      title={auto.isActive ? t("automations.tooltipToggleOff") : t("automations.tooltipToggleOn")}
                    >
                      {auto.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : auto.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t("automations.confirmDelete"))) {
                          deleteMutation.mutate({ automationId: auto.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title={t("automations.tooltipDelete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded: prompt + logs */}
                {isExpanded && (
                  <div className="border-t px-4 py-3 text-sm space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("automations.promptTemplate")}</p>
                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed">
                      {payload?.templatePrompt ?? payload?.webhookUrl ?? "—"}
                    </p>
                  </div>
                )}

                {/* Logs panel */}
                {logsForId === auto.id && (
                  <div className="border-t px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("automations.logsTitle")}</p>
                    {!logs || logs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t("automations.noLogs")}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {logs.map((log) => (
                          <div key={log.id} className="flex items-center gap-2 text-xs">
                            <span
                              className={`inline-block rounded-full px-1.5 py-0.5 font-medium ${log.status === "sent"
                                ? "bg-emerald-100 text-emerald-700"
                                : log.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {log.status as string}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString("sk-SK")}
                            </span>
                            <span className="truncate text-muted-foreground">{log.channel as string}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium mb-1">{t("automations.infoTitle")}</p>
        <p>{t("automations.infoDescription")}</p>
      </div>
    </div>
  );
}
