"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Sparkles,
  Loader2,
  FileText,
  BarChart2,
  CheckSquare,
  Users,
  X,
  Save,
  Tag,
  Brain,
  Search,
  PieChart,
  Database,
  Code,
  Copy,
  Check,
  Eye,
  Edit3,
} from "lucide-react";
import { TableSkeleton } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { aiService } from "@/lib/ai-service";

const DOC_TYPE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  STRATEGY: { icon: BarChart2, color: "text-violet-600 bg-violet-50" },
  SOP: { icon: CheckSquare, color: "text-emerald-600 bg-emerald-50" },
  MANUAL: { icon: FileText, color: "text-blue-600 bg-blue-50" },
  HR: { icon: Users, color: "text-amber-600 bg-amber-50" },
  PERSONA: { icon: Users, color: "text-rose-600 bg-rose-50" },
};

/** Convert basic markdown tags to styled HTML for quick rendering */
function markdownToHtml(md: string): string {
  if (!md) return "";
  if (md.trim().startsWith("<") && md.trim().endsWith(">")) {
    return md; // Already HTML
  }

  let html = md
    // Code blocks & Mermaid
    .replace(/```mermaid([\s\S]*?)```/gi, (_, code) => `<pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3"><code>${code.trim()}</code></pre>`)
    .replace(/```html([\s\S]*?)```/gi, (_, code) => `<div class="my-3 border border-border rounded-xl p-3 bg-muted/20">${code.trim()}</div>`)
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="bg-muted p-3 rounded-lg font-mono text-xs overflow-x-auto my-2"><code>${code.trim()}</code></pre>`)
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-foreground mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-foreground mt-5 mb-3 border-b border-border pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-foreground mt-6 mb-4">$1</h1>')
    // Bold & Italics
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Checklists & Bullet lists
    .replace(/^- \[ \] (.*$)/gim, '<li class="flex items-center gap-2 text-xs text-muted-foreground my-1"><input type="checkbox" disabled class="rounded" /> $1</li>')
    .replace(/^- \[x\] (.*$)/gim, '<li class="flex items-center gap-2 text-xs text-foreground font-medium my-1"><input type="checkbox" checked disabled class="rounded text-primary" /> $1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-sm text-foreground my-0.5">$1</li>')
    // Horizontal Rule
    .replace(/^---$/gim, '<hr class="my-4 border-border" />')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="my-2 leading-relaxed text-sm">');

  return `<p class="my-2 leading-relaxed text-sm">${html}</p>`;
}

export default function DocumentsPage() {
  const t = useTranslations();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("SOP");
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");

  const { data: documents, isLoading, refetch } = trpc.canvas.getDocuments.useQuery();
  const { data: currentDoc } = trpc.canvas.getDocument.useQuery(
    { documentId: selectedDoc! },
    { enabled: !!selectedDoc }
  );

  const seedMutation = trpc.canvas.seedMasterDocuments.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message ?? t("common.error_default")),
  });
  const createMutation = trpc.canvas.createDocument.useMutation({
    onSuccess: (doc) => {
      refetch();
      setNewDocOpen(false);
      setNewTitle("");
      setSelectedDoc(doc.id);
      toast.success(t("canvas.successCreate"));
    },
    onError: (e) => toast.error(e.message ?? t("common.error_default")),
  });
  const updateMutation = trpc.canvas.updateDocument.useMutation({
    onSuccess: () => { refetch(); setEditMode(false); toast.success(t("canvas.successUpdate")); },
    onError: (e) => toast.error(e.message ?? t("common.error_default")),
  });

  const handleOpenDoc = (docId: string) => {
    setSelectedDoc(docId);
    setEditMode(false);
  };

  const handleStartEdit = () => {
    if (!currentDoc) return;
    setEditContent((currentDoc.content as string) ?? "");
    setEditTitle((currentDoc.title as string) ?? "");
    setEditMode(true);
    setPreviewTab("edit");
  };

  const handleSave = () => {
    if (!selectedDoc) return;
    updateMutation.mutate({
      documentId: selectedDoc,
      content: editContent,
      title: editTitle,
    });
  };

  // AI Prompt Execution with Web Research & System Data support
  const handleAiExecute = async (mode: "general" | "research" | "systemData" | "diagram") => {
    if (!aiPrompt.trim() && mode === "general") return;
    setIsAiLoading(true);

    try {
      let promptText = "";

      if (mode === "research") {
        promptText = `[PRIESKUM TRHU & WEB RESEARCH]\nTéma / Požiadavka: ${aiPrompt || "Porovnanie veterinárnych cenníkov a nových trendov"}\n\nUrob stručný prieskum trhu, vygeneruj tabuľku s porovnaním služieb a odporúčania pre veterinárnu prax v Markdown/HTML formáte.`;
      } else if (mode === "systemData") {
        promptText = `[SYSTÉMOVÝ REPORT & EVALUÁCIA]\nVygeneruj štvrťročné vyhodnotenie prevádzky veterinárnej kliniky v Markdown formáte s prehľadnou tabuľkou príjmov, počtu pacientov, najčastejších diagnóz a odporúčaní pre optimalizáciu zásobenia.`;
      } else if (mode === "diagram") {
        promptText = `[DIAGRAM & GRAFIKA]\nVytvor vývojový diagram (Mermaid diagram alebo SVG grafiku) pre nasledovný proces: ${aiPrompt || "Príjem a triáž pacienta na klinike"}.\nVráť priamo Mermaid kód (v \`\`\`mermaid\`\`\` bloku) alebo SVG kód.`;
      } else {
        promptText = `Vylepši a doplň nasledovný dokument na základe požiadavky: "${aiPrompt}".\n\nAktuálny obsah:\n${editContent}`;
      }

      const res = await aiService.generateText({
        prompt: promptText,
        modelId: "local-proxy-gemini-3",
        maxTokens: 1500,
        temperature: 0.4,
      });

      if (res.success && res.content) {
        const generated = markdownToHtml(res.content);
        setEditContent((prev) => (prev ? prev + "\n\n" + generated : generated));
      }
    } catch (err) {
      console.error("AI Canvas generation failed:", err);
    } finally {
      setIsAiLoading(false);
      setAiPrompt("");
    }
  };

  const handleCopyContent = () => {
    if (!currentDoc) return;
    navigator.clipboard.writeText((currentDoc.content as string) ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cfg = (type: string) => {
    const meta = DOC_TYPE_ICONS[type] ?? { icon: FileText, color: "text-gray-600 bg-gray-50" };
    return { ...meta, label: t(`canvas.docTypes.${type}`) ?? type };
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      {/* Document Sidebar List */}
      <div className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold">{t("canvas.sidebarTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("canvas.sidebarSubtitle")}</p>
            </div>
          </div>
          <button
            onClick={() => setNewDocOpen(true)}
            className="rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            title={t("canvas.tooltipNewDoc")}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={2} />
        ) : !documents || documents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("canvas.emptyTitle")}
            description={t("canvas.emptyDescription")}
            action={{
              label: t("canvas.emptyAction"),
              icon: Sparkles,
              onClick: () => seedMutation.mutate(),
            }}
          />
        ) : (
          <div className="space-y-1.5">
            {documents.map((doc) => {
              const { icon: Icon, color } = cfg(doc.docType as string);
              const tags = (doc.tags as string[]) ?? [];
              const isSelected = selectedDoc === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleOpenDoc(doc.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all cursor-pointer ${isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/20"
                    : "border-border bg-card hover:bg-accent/40"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">{doc.title as string}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {(doc.isRagSource as boolean) && (
                          <span title={t("canvas.ragBadge")} className="inline-flex">
                            <Brain className="h-3 w-3 text-violet-500" />
                          </span>
                        )}
                        {tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded bg-muted px-1.5 py-0.2 text-[9px] text-muted-foreground font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Canvas Document Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {!selectedDoc || !currentDoc ? (
          <EmptyState
            icon={BookOpen}
            title={t("canvas.noSelectionTitle")}
            description={t("canvas.noSelectionDescription")}
            action={undefined}
          />
        ) : (
          <>
            {/* Document Header Controls */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-card">
              {editMode ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <div className="min-w-0">
                  <h2 className="truncate text-base font-extrabold text-foreground">{currentDoc.title as string}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const { label, icon: Icon, color } = cfg(currentDoc.docType as string);
                      return (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${color}`}>
                          <Icon className="h-3 w-3" />{label}
                        </span>
                      );
                    })()}
                    {(currentDoc.isRagSource as boolean) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                        <Brain className="h-3 w-3" />{t("canvas.ragBadge")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  onClick={handleCopyContent}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent cursor-pointer transition-colors"
                  title="Kopírovať obsah"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Kopírované" : "Kopírovať"}
                </button>

                {editMode ? (
                  <>
                    <div className="flex rounded-lg border border-border p-0.5 bg-muted/40">
                      <button
                        onClick={() => setPreviewTab("edit")}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${previewTab === "edit" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                      >
                        <Edit3 className="h-3 w-3" /> Editor
                      </button>
                      <button
                        onClick={() => setPreviewTab("preview")}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${previewTab === "preview" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                      >
                        <Eye className="h-3 w-3" /> Náhľad
                      </button>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60 cursor-pointer shadow-xs"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {t("canvas.saveButton")}
                    </button>
                    <button onClick={() => setEditMode(false)} className="rounded-lg p-1.5 hover:bg-accent cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {t("canvas.editButton")}
                  </button>
                )}
              </div>
            </div>

            {/* AI Assistant Quick Actions Bar */}
            <div className="border-b border-border bg-muted/30 px-5 py-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>AI Dokumentačný Asistent</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleAiExecute("research")}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Search className="h-3 w-3 text-blue-500" /> Prieskum trhu
                  </button>
                  <button
                    onClick={() => handleAiExecute("systemData")}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Database className="h-3 w-3 text-emerald-500" /> Systémové dáta
                  </button>
                  <button
                    onClick={() => handleAiExecute("diagram")}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Code className="h-3 w-3 text-violet-500" /> Mermaid / SVG
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Napíš zmenu, otázku alebo požiadaj o vygenerovanie (napr. 'Pridaj tabuľku dávkovania', 'Vytvor vývojový diagram')..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAiExecute("general");
                    }
                  }}
                />
                <button
                  onClick={() => handleAiExecute("general")}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Generovať
                </button>
              </div>
            </div>

            {/* Document Content View / Editor */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {editMode && previewTab === "edit" ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-full w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
                  placeholder={t("canvas.contentPlaceholder")}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none [&_h1]:text-xl [&_h1]:font-extrabold [&_h2]:text-lg [&_h2]:font-bold [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-1.5 [&_h3]:text-base [&_h3]:font-bold [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted/50 [&_th]:font-bold [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(editMode ? editContent : ((currentDoc.content as string) ?? `<p>${t("canvas.emptyContent")}</p>`)),
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* New Document Modal */}
      {newDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-surface border border-border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">{t("canvas.newDoc.title")}</h3>
              <button onClick={() => setNewDocOpen(false)} className="rounded-lg p-1 hover:bg-accent cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">{t("canvas.newDoc.nameLabel")}</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("canvas.newDoc.namePlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">{t("canvas.newDoc.typeLabel")}</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                {Object.keys(DOC_TYPE_ICONS).map((k) => (
                  <option key={k} value={k}>{t(`canvas.docTypes.${k}`)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => createMutation.mutate({ title: newTitle, docType: newType })}
              disabled={!newTitle.trim() || createMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("canvas.newDoc.submitButton")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
