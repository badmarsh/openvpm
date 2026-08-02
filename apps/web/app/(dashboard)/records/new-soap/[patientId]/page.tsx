"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

const SoapNoteEditor = dynamic(
  () =>
    import("@/components/SoapNoteEditor").then((mod) => mod.SoapNoteEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-32 rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
        
        Načítavam editor...
      </div>
    ),
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
      toast.success("Poznámka SOAP vytvorená");
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
      toast.success("Koncept pripravený. Pred uložením skontrolujte a upravte.");
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
      toast.error("Pred uložením poznámky SOAP");
      return;
    }
    if (!canSave) {
      toast.error("Pred uložením pridajte aspoň jednu sekciu SOAP");
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
        <h2 className="font-heading text-xl font-semibold">Prístup odmietnutý</h2>
        <p className="text-sm text-muted-foreground mt-1">
          
          Otvoriť prúžok
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/records")}
        >
          
          Späť na záznamy
        </Button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        
        Kontroluje sa prístup k poznámke SOAP...
      </div>
    );
  }

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        
        Načítavam pacienta...
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Nepodarilo sa načítať pacienta"
        description={
          patientError?.message ??
          "Choose a patient from Records before creating a SOAP note."
        }
        action={{
          label: "Späť na záznamy",
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
        
        Späť na záznamy
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">Nová poznámka SOAP</h2>
          {patient && (
            <p className="text-sm text-muted-foreground">
              
              Pacient: {patient.name}
              {patient.species
                ? ` - ${patient.species.charAt(0).toUpperCase() + patient.species.slice(1)}`
                : ""}
              {patient.breed ? ` (${patient.breed})` : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CapturePhotos patientId={params.patientId} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDraftWithAi}
              disabled={!aiConfigured || draftWithAi.isPending}
            >
              {draftWithAi.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {draftWithAi.isPending ? "Drafting..." : "Draft with AI"}
            </Button>
          </div>
          {!aiConfigured && !agentStatus.isLoading && (
            <p className="text-xs text-muted-foreground">
              
              AI ešte nie je nastavená. Požiadajte svojho správcu, aby pridal kľúč AI.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="w-full lg:max-w-sm">
              <label className="mb-1 block text-sm font-medium">
                
                Šablóna SOAP
              </label>
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                {SOAP_NOTE_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            {canSave && (
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                <Checkbox
                  checked={replaceTemplateContent}
                  onChange={(event) =>
                    setReplaceTemplateContent(event.target.checked)
                  }
                />
                
                Nahradiť existujúci obsah
              </label>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              
              Použiť šablónu
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          {/* Subjective */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              
              Subjektívne
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              
              Hlásená sťažnosť majiteľa, história a symptómy
            </p>
            <SoapNoteEditor
              value={subjective}
              onChange={setSubjective}
              placeholder="Čo hlási majiteľ..."
            />
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              
              Agenta OpenVPM môžu spustiť iba správcovia a veterinári.
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              
              Nálezy fyzikálneho vyšetrenia, vitálne funkcie a výsledky testov
            </p>
            <SoapNoteEditor
              value={objective}
              onChange={setObjective}
              placeholder="Nálezy fyzikálnych vyšetrení, životné funkcie, laboratórne výsledky..."
            />
          </div>

          {/* Assessment */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              
              Hodnotenie
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              
              Diagnóza alebo diferenciálne diagnózy
            </p>
            <SoapNoteEditor
              value={assessment}
              onChange={setAssessment}
              placeholder="Diagnóza, diferenciálne diagnózy..."
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              
              Plán
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              
              Liečebný plán, lieky, následné pokyny
            </p>
            <SoapNoteEditor
              value={plan}
              onChange={setPlan}
              placeholder="Liečebný plán, lieky, sledovanie..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={createNote.isPending || !canSave}
          >
            <Save className="mr-2 h-4 w-4" />
            {createNote.isPending ? "Saving..." : "Save Note"}
          </Button>
          {!canSave && (
            <p className="text-sm text-muted-foreground">
              
              Ak chcete túto poznámku uložiť, pridajte aspoň jednu sekciu.
            </p>
          )}
          <Button variant="outline" onClick={() => router.push("/records")}>
            
            Zrušiť
          </Button>
          {createNote.isError && (
            <p className="text-sm text-destructive">
              
              Nepodarilo sa uložiť: {createNote.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
