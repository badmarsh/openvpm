"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/common/empty-state";
import { CapturePhotos } from "@/components/records/capture-photos";
import { toast } from "sonner";
import {
  hasSoapContent,
  normalizeSoapSection,
} from "@/lib/records/soap-content";
import {
  SOAP_NOTE_TEMPLATES,
  applySoapTemplateToSections,
  getSoapTemplateById,
} from "@/lib/records/soap-templates";

const SoapNoteEditorLoader = () => {
  const t = useTranslations();
  return (
    <div className="min-h-32 rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
      {t("newSoap.loadingEditor", "Loading editor...")}
    </div>
  );
};

const SoapNoteEditor = dynamic(
  () =>
    import("@/components/SoapNoteEditor").then((mod) => mod.SoapNoteEditor),
  {
    ssr: false,
    loading: SoapNoteEditorLoader,
  }
);

function canCreateSoapNoteRole(role?: string | null): boolean {
  return role === "admin" || role === "veterinarian";
}

/** Plain-text AI draft sections -> simple HTML the tiptap editor can load. */
function draftTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`);
  return paragraphs.join("");
}

export default function NewSoapNotePage() {
  const t = useTranslations();
  const params = useParams<{ patientId: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;
  const canCreateSoapNote = canCreateSoapNoteRole(userRole);
  const accessDenied = status !== "loading" && !canCreateSoapNote;

  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    SOAP_NOTE_TEMPLATES[0]?.id ?? ""
  );
  const [replaceTemplateContent, setReplaceTemplateContent] = useState(false);
  const canSave = hasSoapContent({ subjective, objective, assessment, plan });
  const selectedTemplate = getSoapTemplateById(selectedTemplateId);

  const {
    data: patient,
    isLoading: patientLoading,
    error: patientError,
  } =
    trpc.patients.getById.useQuery(
      { id: params.patientId },
      { enabled: !!params.patientId && canCreateSoapNote }
    );

  const createNote = trpc.records.createSoapNote.useMutation({
    onSuccess: () => {
      toast.success(t("newSoap.noteCreated", "SOAP note created"));
      router.push("/records");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // AI draft availability mirrors the OpenVPM Agent (same key + model config).
  const agentStatus = trpc.agent.status.useQuery(undefined, {
    enabled: canCreateSoapNote,
  });
  const aiConfigured = agentStatus.data?.configured ?? false;
  const draftWithAi = trpc.ai.draftSoapNote.useMutation({
    onSuccess: (draft) => {
      setSubjective(draftTextToHtml(draft.subjective));
      setObjective(draftTextToHtml(draft.objective));
      setAssessment(draftTextToHtml(draft.assessment));
      setPlan(draftTextToHtml(draft.plan));
      toast.success(t("newSoap.draftReady", "Draft ready. Review and edit before saving."));
    },
    onError: (err) => toast.error(err.message),
  });

  function handleDraftWithAi() {
    if (!params.patientId || draftWithAi.isPending) return;
    if (
      canSave &&
      !window.confirm("Replace what you typed with the AI draft?")
    ) {
      return;
    }
    draftWithAi.mutate({ patientId: params.patientId });
  }

  function handleSave() {
    if (!params.patientId || !patient) {
      toast.error(t("newSoap.loadPatientFirst", "Load the patient before saving a SOAP note"));
      return;
    }
    if (!canSave) {
      toast.error(t("newSoap.addSectionFirst", "Add at least one SOAP section before saving"));
      return;
    }
    createNote.mutate({
      patientId: params.patientId,
      subjective: normalizeSoapSection(subjective),
      objective: normalizeSoapSection(objective),
      assessment: normalizeSoapSection(assessment),
      plan: normalizeSoapSection(plan),
    });
  }

  function handleApplyTemplate() {
    if (!selectedTemplate) return;
    const next = applySoapTemplateToSections(
      { subjective, objective, assessment, plan },
      selectedTemplate,
      { replaceExisting: replaceTemplateContent }
    );
    setSubjective(next.subjective);
    setObjective(next.objective);
    setAssessment(next.assessment);
    setPlan(next.plan);
    toast.success(
      replaceTemplateContent || !canSave
        ? `${selectedTemplate.name} template applied`
        : `${selectedTemplate.name} template filled blank sections`
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl font-semibold">{t("newSoap.accessDenied", "Access denied")}</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
          {t("newSoap.backToRecords", "Back to Records")}
        </Button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("newSoap.loadingPatient", "Loading patient...")}
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("newSoap.unableToLoadPatient", "Unable to load patient")}
        description={
          patientError?.message ??
          "Choose a patient from Records before creating a SOAP note."
        }
        action={{
          label: t("newSoap.backToRecords", "Back to Records"),
          onClick: () => router.push("/records"),
          icon: ArrowLeft,
        }}
      />
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/records")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("newSoap.backToRecords", "Back to Records")}
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">{t("newSoap.heading", "New SOAP Note")}</h2>
          {patient && (
            <p className="text-sm text-muted-foreground">
              {t("newSoap.addSectionHint", "Add at least one section to save this note.")}
            </p>
          )}
          <Button variant="outline" onClick={() => router.push("/records")}>
            {t("newSoap.cancel", "Cancel")}
          </Button>
          {createNote.isError && (
            <p className="text-sm text-destructive">
              {t("newSoap.failedToSave", "Failed to save:")} {createNote.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
