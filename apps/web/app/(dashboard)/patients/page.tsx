"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Plus, PawPrint } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading";
import { PATIENT_SEARCH_MAX_LENGTH } from "@/lib/patients/policy";
import { useTranslations } from "next-intl";

const speciesEmoji: Record<string, string> = {
  canine: "\uD83D\uDC36",
  feline: "\uD83D\uDC31",
  avian: "\uD83D\uDC26",
  rabbit: "\uD83D\uDC30",
  reptile: "\uD83E\uDD8E",
  equine: "\uD83D\uDC34",
  other: "\uD83D\uDC3E",
};

type SpeciesFilter =
  | ""
  | "canine"
  | "feline"
  | "avian"
  | "rabbit"
  | "reptile"
  | "equine"
  | "other";

const speciesOptionKeys: Array<{ value: SpeciesFilter; key: string }> = [
  { value: "", key: "patients.species_all" },
  { value: "canine", key: "patients.species_canine" },
  { value: "feline", key: "patients.species_feline" },
  { value: "avian", key: "patients.species_avian" },
  { value: "rabbit", key: "patients.species_rabbit" },
  { value: "reptile", key: "patients.species_reptile" },
  { value: "equine", key: "patients.species_equine" },
  { value: "other", key: "patients.species_other" },
];

function canManagePatientsRole(role?: string | null): boolean {
  return (
    role === "admin" ||
    role === "veterinarian" ||
    role === "technician" ||
    role === "front_desk"
  );
}

export default function PatientsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<SpeciesFilter>("");
  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;
  const hasFilters = hasSearch || Boolean(species);
  const canManagePatients = canManagePatientsRole(session?.user?.role);

  const { data, isLoading, error } = trpc.patients.list.useQuery({
    search: hasSearch ? trimmedSearch : undefined,
    species: species || undefined,
    limit: 25,
    offset: 0,
  });
  const patientsMissing = !isLoading && !error && !data;

  const formatSex = (sex: string | null): string => {
    if (!sex) return "\u2014";
    const keys: Record<string, string> = {
      male: "patients.sex_male",
      female: "patients.sex_female",
      male_neutered: "patients.sex_male_neutered",
      female_spayed: "patients.sex_female_spayed",
    };
    return keys[sex] ? t(keys[sex]) : sex;
  };

  const formatStatus = (status: string | null | undefined): string => {
    if (!status) return t("patients.status_active");
    const keys: Record<string, string> = {
      active: "patients.status_active",
      inactive: "patients.status_inactive",
      deceased: "patients.status_deceased",
    };
    return keys[status] ? t(keys[status]) : status;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">{t("patients.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("patients.subtitle")}
          </p>
        </div>
        {canManagePatients && (
          <Button onClick={() => router.push("/patients/new")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("patients.new_patient")}
          </Button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("patients.search_placeholder")}
            value={search}
            maxLength={PATIENT_SEARCH_MAX_LENGTH}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value as SpeciesFilter)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {speciesOptionKeys.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.key)}
            </option>
          ))}
        </select>
        {data && (
          <p className="text-sm text-muted-foreground">
            {t(data.total === 1 ? "patients.plural_one" : "patients.plural_other", { count: data.total })}
          </p>
        )}
      </div>

      {error || patientsMissing ? (
        <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error?.message ?? t("common.error_retry")}
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : data && data.items.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("patients.column_name")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("patients.column_breed")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("patients.column_owner")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("patients.column_sex")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("patients.column_status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <span className="mr-1.5">
                      {speciesEmoji[patient.species ?? "other"] ?? "\uD83D\uDC3E"}
                    </span>
                    {patient.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.breed || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.clientFirstName && patient.clientLastName
                      ? `${patient.clientFirstName} ${patient.clientLastName}`
                      : "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSex(patient.sex)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        patient.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : patient.status === "deceased"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {formatStatus(patient.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={PawPrint}
          title={hasFilters ? t("patients.empty_filter_title") : t("patients.empty_title")}
          description={
            hasFilters
              ? t("patients.empty_filter_desc")
              : t("patients.empty_desc")
          }
          action={
            !hasFilters && canManagePatients
              ? {
                  label: t("patients.empty_action"),
                  onClick: () => router.push("/patients/new"),
                  icon: Plus,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
