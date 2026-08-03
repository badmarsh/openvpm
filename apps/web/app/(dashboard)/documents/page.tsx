"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";

const DOC_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  STRATEGY: { label: "Stratégia", icon: BarChart2, color: "text-violet-600 bg-violet-50" },
  SOP: { label: "SOP", icon: CheckSquare, color: "text-emerald-600 bg-emerald-50" },
  MANUAL: { label: "Manuál", icon: FileText, color: "text-blue-600 bg-blue-50" },
  HR: { label: "HR", icon: Users, color: "text-amber-600 bg-amber-50" },
  PERSONA: { label: "Persony", icon: Users, color: "text-rose-600 bg-rose-50" },
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("SOP");

  const { data: documents, isLoading, refetch } = trpc.canvas.getDocuments.useQuery();
  const { data: currentDoc } = trpc.canvas.getDocument.useQuery(
    { documentId: selectedDoc! },
    { enabled: !!selectedDoc }
  );

  const seedMutation = trpc.canvas.seedMasterDocuments.useMutation({ onSuccess: () => refetch() });
  const createMutation = trpc.canvas.createDocument.useMutation({
    onSuccess: (doc) => {
      refetch();
      setNewDocOpen(false);
      setNewTitle("");
      setSelectedDoc(doc.id);
    },
  });
  const updateMutation = trpc.canvas.updateDocument.useMutation({
    onSuccess: () => { refetch(); setEditMode(false); }
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
  };

  const handleSave = () => {
    if (!selectedDoc) return;
    updateMutation.mutate({
      documentId: selectedDoc,
      content: editContent,
      title: editTitle,
    });
  };

  const handleAiImprove = async () => {
    if (!aiPrompt.trim() && !editContent.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/marketing-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "improve",
          contextText: aiPrompt || editContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditContent((prev) => prev + "\n\n---\n\n" + (data.content as string));
      }
    } finally {
      setIsAiLoading(false);
      setAiPrompt("");
    }
  };

  const cfg = (type: string) => DOC_TYPE_CONFIG[type] ?? { label: type, icon: FileText, color: "text-gray-600 bg-gray-50" };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      {/* Sidebar: document list */}
      <div className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">AI Canvas & SOP</span>
          </div>
          <button
            onClick={() => setNewDocOpen(true)}
            className="rounded-md p-1 hover:bg-accent"
            title="Nový dokument"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Žiadne dokumenty</p>
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
            >
              {seedMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Načítať Master Dokumenty
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {documents.map((doc) => {
              const { icon: Icon, color } = cfg(doc.docType as string);
              const tags = (doc.tags as string[]) ?? [];
              return (
                <button
                  key={doc.id}
                  onClick={() => handleOpenDoc(doc.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${selectedDoc === doc.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:bg-accent/30"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{doc.title as string}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {(doc.isRagSource as boolean) && (
                          <span title="RAG kontext" className="inline-flex">
                            <Brain className="h-3 w-3 text-violet-500" />
                          </span>
                        )}
                        {tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded bg-muted px-1 text-[9px] text-muted-foreground">
                            {t}
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

      {/* Main canvas area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        {!selectedDoc || !currentDoc ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-medium text-muted-foreground">Vyberte dokument</p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Kliknite na dokument v zozname vľavo pre zobrazenie obsahu
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Doc header */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              {editMode ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 rounded border bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold">{currentDoc.title as string}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(() => {
                      const { label, icon: Icon, color } = cfg(currentDoc.docType as string);
                      return (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
                          <Icon className="h-3 w-3" />{label}
                        </span>
                      );
                    })()}
                    {(currentDoc.isRagSource as boolean) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                        <Brain className="h-3 w-3" />RAG zdroj
                      </span>
                    )}
                    {((currentDoc.tags as string[]) ?? []).map((t) => (
                      <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        <Tag className="h-2.5 w-2.5" />{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Uložiť
                    </button>
                    <button onClick={() => setEditMode(false)} className="rounded-md p-1.5 hover:bg-accent">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                  >
                    Upraviť
                  </button>
                )}
              </div>
            </div>

            {/* Doc content */}
            <div className="flex-1 overflow-y-auto">
              {editMode ? (
                <div className="flex h-full flex-col gap-3 p-5">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 w-full rounded-lg border bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Obsah dokumentu (HTML alebo Markdown)…"
                  />
                  {/* AI assist bar */}
                  <div className="flex gap-2">
                    <input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Pokyn pre AI (napr. 'Doplň tabuľku', 'Vylepši úvod')…"
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleAiImprove}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      AI
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none p-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted/50"
                  dangerouslySetInnerHTML={{
                    __html: (currentDoc.content as string) ?? "<p>Prázdny dokument</p>",
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* New document modal */}
      {newDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-surface border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Nový dokument</h3>
              <button onClick={() => setNewDocOpen(false)} className="rounded-md p-1 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Názov</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Napr. Onboarding SOP pre nových zamestnancov"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Typ</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => createMutation.mutate({ title: newTitle, docType: newType })}
              disabled={!newTitle.trim() || createMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Vytvoriť dokument
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
