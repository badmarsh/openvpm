"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Plus, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading";
import { CLIENT_SEARCH_MAX_LENGTH } from "@/lib/clients/policy";
import { formatClinicalDate } from "@/lib/records/clinical-dates";
import { useTranslations } from "next-intl";

function canManageClientsRole(role?: string | null): boolean {
  return (
    role === "admin" ||
    role === "veterinarian" ||
    role === "technician" ||
    role === "front_desk"
  );
}

export default function ClientsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;
  const canManageClients = canManageClientsRole(session?.user?.role);

  const { data, isLoading, error } = trpc.clients.list.useQuery({
    search: hasSearch ? trimmedSearch : undefined,
    limit: 25,
    offset: 0,
  });
  const clientsMissing = !isLoading && !error && !data;
  const verifiedClientList = error || clientsMissing || !data ? null : data;
  const clientListTimeZone = verifiedClientList
    ? verifiedClientList.timezone
    : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">{t("clients.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("clients.subtitle")}
          </p>
        </div>
        {canManageClients && (
          <Button onClick={() => router.push("/clients/new")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("clients.new_client")}
          </Button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("clients.search_placeholder")}
            value={search}
            maxLength={CLIENT_SEARCH_MAX_LENGTH}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {verifiedClientList && (
          <p className="text-sm text-muted-foreground">
            {t(verifiedClientList.total === 1 ? "clients.plural_one" : "clients.plural_other", { count: verifiedClientList.total })}
          </p>
        )}
      </div>

      {error || clientsMissing ? (
        <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error?.message ?? t("common.error_retry")}
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : verifiedClientList && verifiedClientList.items.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("clients.column_name")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("clients.column_email")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("clients.column_phone")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("clients.column_city")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("clients.column_created")}
                </th>
              </tr>
            </thead>
            <tbody>
              {verifiedClientList.items.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {client.email || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {client.phone || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {client.city || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatClinicalDate(
                      client.createdAt,
                      clientListTimeZone,
                      "\u2014"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={Users}
          title={hasSearch ? t("clients.empty_search_title") : t("clients.empty_title")}
          description={
            hasSearch
              ? t("clients.empty_search_desc")
              : t("clients.empty_desc")
          }
          action={
            !hasSearch && canManageClients
              ? {
                  label: t("clients.empty_action"),
                  onClick: () => router.push("/clients/new"),
                  icon: Plus,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
