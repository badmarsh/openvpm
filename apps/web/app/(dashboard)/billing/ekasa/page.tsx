"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  WifiOff,
  Send,
  Printer,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

type ReceiptStatus = "PENDING" | "SENT" | "CONFIRMED" | "FAILED" | "OFFLINE_STORED";

const STATUS_CONFIG: Record<
  ReceiptStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Čaká",
    color: "bg-gray-100 text-gray-700",
    icon: Clock,
  },
  SENT: {
    label: "Odoslané",
    color: "bg-blue-100 text-blue-700",
    icon: Send,
  },
  CONFIRMED: {
    label: "Potvrdené",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Chyba",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  OFFLINE_STORED: {
    label: "Offline",
    color: "bg-amber-100 text-amber-800",
    icon: WifiOff,
  },
};

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Hotovosť",
  CARD: "Karta",
  TRANSFER: "Prevod",
};

const VAT_LABEL: Record<string, string> = {
  ZERO: "0 %",
  REDUCED: "10 %",
  STANDARD: "23 %",
};

const PAGE_SIZE = 20;

export default function EkasaReceiptsPage() {
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | undefined>();
  const [printingId, setPrintingId] = useState<string | null>(null);

  const {
    data: receipts,
    isLoading,
    refetch,
  } = trpc.ekasa.getReceipts.useQuery({
    limit: PAGE_SIZE,
    offset,
    status: statusFilter,
  });

  const retryMutation = trpc.ekasa.retryReceipt.useMutation({
    onSuccess: () => refetch(),
  });

  const handlePrint = async (receiptId: string) => {
    setPrintingId(receiptId);
    const result = await trpc.useContext().ekasa.printReceipt.fetch({
      receiptId,
    });
    if (result?.html) {
      const win = window.open("", "_blank", "width=400,height=700");
      win?.document.write(result.html);
      win?.document.close();
      setTimeout(() => win?.print(), 500);
    }
    setPrintingId(null);
  };

  // Stats summary
  const statuses: ReceiptStatus[] = [
    "CONFIRMED",
    "FAILED",
    "OFFLINE_STORED",
    "PENDING",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">e-Kasa Doklady</h1>
            <p className="text-sm text-muted-foreground">
              Prehľad vydaných elektronických dokladov (FR SR)
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Obnoviť
        </button>
      </div>

      {/* Status filter badges */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilter(undefined); setOffset(0); }}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!statusFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
        >
          Všetky
        </button>
        {statuses.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setOffset(0); }}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === s ? cfg.color + " ring-2 ring-offset-1 ring-current" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              <Icon className="h-3 w-3" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !receipts || receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">Žiadne doklady</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {statusFilter
                ? `Žiadne doklady so statusom „${STATUS_CONFIG[statusFilter].label}"`
                : "Doklady sa vytvoria automaticky pri fakturácii s e-Kasa"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {[
                    "Číslo dokladu",
                    "Dátum",
                    "Suma",
                    "DPH",
                    "Platba",
                    "Status",
                    "UID",
                    "Akcie",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {receipts.map((r) => {
                  const status = r.status as ReceiptStatus;
                  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  const canRetry =
                    status === "FAILED" || status === "OFFLINE_STORED";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium">
                        {r.receiptNumber as string}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.issuedAt).toLocaleString("sk-SK", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {Number(r.amountTotal).toFixed(2).replace(".", ",")} €
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {VAT_LABEL[r.vatRate as string] ?? r.vatRate as string}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {PAYMENT_LABEL[r.paymentMethod as string] ?? r.paymentMethod as string}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground max-w-[120px] truncate">
                        {(r.uid as string | null) ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Print */}
                          <button
                            onClick={() => handlePrint(r.id)}
                            disabled={printingId === r.id}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Tlačiť doklad"
                          >
                            {printingId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Printer className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {/* Retry */}
                          {canRetry && (
                            <button
                              onClick={() =>
                                retryMutation.mutate({ receiptId: r.id })
                              }
                              disabled={retryMutation.isPending}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              title="Znovu odoslať do FR SR"
                            >
                              {retryMutation.isPending &&
                              retryMutation.variables?.receiptId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {receipts && receipts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Zobrazených {offset + 1}–{offset + receipts.length} dokladov
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-accent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Predchádzajúce
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={receipts.length < PAGE_SIZE}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-accent"
            >
              Ďalšie
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Legal footer */}
      <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium mb-1">ℹ️ Informácia</p>
        <p>
          Doklady so statusom <strong>OFFLINE</strong> alebo <strong>Chyba</strong> sú automaticky
          opätovne odosielané každú hodinu prostredníctvom cron jobu{" "}
          <code className="bg-muted px-1 rounded">/api/cron/ekasa-retry</code>. Môžete ich tiež
          znovu odoslať ručne kliknutím na ikonu obnovy.
        </p>
      </div>
    </div>
  );
}
