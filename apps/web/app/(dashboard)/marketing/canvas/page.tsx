"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileText, Plus, Sparkles, Loader2, Save, Search, Tag,
  Archive, Edit3, Trash2, Download, Maximize2, AlignLeft,
  ChevronRight, X, CheckCircle2, Clock, BookOpen,
} from "lucide-react";

type DocStatus = "draft" | "published" | "archived";
type DocCategory = "SOP" | "Strategy" | "HR" | "Client_Handout" | "General";

interface CanvasDoc {
  id: string; title: string; content: string; status: DocStatus;
  category: DocCategory; tags: string[]; createdAt: string; updatedAt: string;
}

const INITIAL_DOCS: CanvasDoc[] = [
  { id: "doc-1", title: "SOP: Prijatie pacienta", content: "# SOP: Prijem noveho pacienta\n\n## Ucel\nTento postup zabezpecuje standardizovany a Fear-Free prijem.\n\n## Kroky\n\n1. Uvitanie majitela a pacienta\n2. Overenie zdravotnej dokumentacie\n3. Meranie vitalnych funkcii\n4. Informovanie veterinara\n\n## Poznamky\n- Vzdy pouzivajte tichy hlas\n- Ponuknite pacientovi pochutku", status: "published", category: "SOP", tags: ["prijem", "fear-free"], createdAt: "2026-08-01T09:00:00Z", updatedAt: "2026-08-05T14:30:00Z" },
  { id: "doc-2", title: "Strategia: Letna kampan", content: "# Letna marketingova strategia 2026\n\n## Ciel\nZvysit povedomie o letnej prevencii parazitov.\n\n## Platformy\n- Instagram: 3x/tyzden\n- Facebook: 2x/tyzden\n- GBP: 1x/tyzden\n\n## Klucove temy\n1. Prevencia klestov\n2. Ochrana pred prehriatim\n3. Letna hydratacia", status: "draft", category: "Strategy", tags: ["marketing", "leto"], createdAt: "2026-08-03T11:00:00Z", updatedAt: "2026-08-07T08:00:00Z" },
  { id: "doc-3", title: "Info: Postvakcinacna starostlivost", content: "# Postvakcinacna starostlivost\n\nVazeny majitel,\n\n## Co mozete ocakavat\n- Mierna unava 24-48 hodin\n- Mierne opuchnutie v mieste vpichu\n\n## Kedy nas kontaktovat\nOkamzite ak spozorujete silne opuchnutie tvarobratia zvracanie.\n\nTelefon: [cislo kliniky]", status: "published", category: "Client_Handout", tags: ["vakcinacia", "klient"], createdAt: "2026-07-15T09:00:00Z", updatedAt: "2026-07-20T10:00:00Z" },
];

const TEMPLATES = [
  { category: "SOP" as DocCategory, title: "Novy SOP postup", content: "# Nazov SOP\n\n## Ucel\n\n## Postup\n\n1. Krok 1\n2. Krok 2\n\n## Zodpovednost" },
  { category: "Strategy" as DocCategory, title: "Marketingova strategia", content: "# Strategia\n\n## Ciel\n\n## Platformy\n\n## KPIs" },
  { category: "HR" as DocCategory, title: "HR dokument", content: "# HR Dokument\n\n## Politika\n\n## Implementacia" },
  { category: "Client_Handout" as DocCategory, title: "Informacny list", content: "# Informacny list\n\nVazeny majitel,\n\n## Dolezite informacie\n\n## Kedy nas kontaktovat" },
];

const CAT_COLORS: Record<DocCategory, string> = {
  SOP: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  Strategy: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300",
  HR: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  Client_Handout: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  General: "bg-gray-50 text-gray-700 border-gray-200",
};

const STATUS_CFG = {
  draft: { color: "bg-gray-100 text-gray-700", Icon: Edit3, label: "Koncept" },
  published: { color: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2, label: "Publikovany" },
  archived: { color: "bg-gray-100 text-gray-400", Icon: Archive, label: "Archivovany" },
} as const;

function renderMd(text: string) {
  return text
    .replace(/^# (.+)$/gm, "<h1 class=\"text-xl font-bold mb-3 mt-4\">$1</h1>")
    .replace(/^## (.+)$/gm, "<h2 class=\"text-base font-semibold mb-2 mt-4 text-primary\">$2</h2>")
    .replace(/^\d+\. (.+)$/gm, "<li class=\"ml-4 list-decimal text-sm mb-1\">$1</li>")
    .replace(/^- (.+)$/gm, "<li class=\"ml-4 list-disc text-sm mb-1\">$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>");
}

export default function CanvasPage() {
  const [docs, setDocs] = useState<CanvasDoc[]>(INITIAL_DOCS);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_DOCS[0].id);
  const [editMode, setEditMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<DocCategory | "All">("All");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showTpls, setShowTpls] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const doc = docs.find((d) => d.id === selectedId) ?? null;
  const filtered = docs.filter((d) =>
    (catFilter === "All" || d.category === catFilter) &&
    d.status !== "archived" &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase()))
  );

  const newDoc = (tpl?: typeof TEMPLATES[0]) => {
    const d: CanvasDoc = { id: `doc-${Date.now()}`, title: tpl?.title ?? "Novy dokument", content: tpl?.content ?? "# Novy dokument\n\nZacnite pisat...", status: "draft", category: tpl?.category ?? "General", tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setDocs([d, ...docs]); setSelectedId(d.id); setEditMode(true); setShowTpls(false);
    toast.success("Novy dokument vytvoreny");
  };

  const save = () => {
    const ta = document.getElementById("cv-editor") as HTMLTextAreaElement;
    if (!ta || !selectedId) return;
    setDocs(docs.map((d) => d.id === selectedId ? { ...d, content: ta.value, updatedAt: new Date().toISOString() } : d));
    setEditMode(false); toast.success("Dokument ulozeny");
  };

  const setStatus = (id: string, s: DocStatus) => {
    setDocs(docs.map((d) => d.id === id ? { ...d, status: s } : d));
    toast.success(STATUS_CFG[s].label);
  };

  const del = (id: string) => {
    const rem = docs.filter((d) => d.id !== id);
    setDocs(rem); setSelectedId(rem[0]?.id ?? null); toast.success("Dokument vymazany");
  };

  const aiGen = async () => {
    if (!aiPrompt.trim() || !doc) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    const section = `\n\n## ${aiPrompt}\n\n*Obsah vygenerovany AI copilotom. Upravte podla potreby.*\n\n- Bod 1: Popis\n- Bod 2: Postup\n- Bod 3: Poznamky`;
    setDocs(docs.map((d) => d.id === selectedId ? { ...d, content: d.content + section, updatedAt: new Date().toISOString() } : d));
    setAiPrompt(""); setGenerating(false); toast.success("Sekcia pridana");
  };

  const addTag = (tag: string) => {
    if (!tag.trim() || !doc) return;
    setDocs(docs.map((d) => d.id === selectedId && !d.tags.includes(tag.trim()) ? { ...d, tags: [...d.tags, tag.trim()] } : d));
    setTagInput("");
  };

  const rmTag = (tag: string) => setDocs(docs.map((d) => d.id === selectedId ? { ...d, tags: d.tags.filter((t) => t !== tag) } : d));

  return (
    <div className={`flex ${zenMode ? "fixed inset-0 z-50 bg-background" : "h-[calc(100vh-130px)]"} border rounded-xl overflow-hidden shadow-sm`}>
      {!zenMode && (
        <aside className="w-68 shrink-0 flex flex-col border-r bg-card">
          <div className="border-b p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold"><BookOpen className="h-4 w-4 text-primary" />AI Canvas</div>
              <div className="flex gap-1">
                <button onClick={() => setShowTpls(!showTpls)} className="rounded p-1.5 hover:bg-accent text-muted-foreground" title="Sablony"><FileText className="h-3.5 w-3.5" /></button>
                <button onClick={() => newDoc()} className="rounded p-1.5 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="relative"><Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hladat..." className="w-full rounded-lg border bg-background pl-7 pr-2 py-1.5 text-xs focus:outline-none" /></div>
            <div className="flex flex-wrap gap-1">
              {(["All","SOP","Strategy","HR","Client_Handout"] as const).map((c) => (
                <button key={c} onClick={() => setCatFilter(c)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${catFilter===c?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-accent"}`}>{c==="All"?"Vsetky":c==="Client_Handout"?"Klienti":c}</button>
              ))}
            </div>
          </div>
          {showTpls && (
            <div className="border-b p-2 space-y-1 bg-muted/30">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-1">Sablony</p>
              {TEMPLATES.map((t) => (
                <button key={t.category} onClick={() => newDoc(t)} className="w-full rounded-lg border bg-background px-3 py-2 text-left text-xs hover:bg-accent transition-colors">
                  <span className={`mr-1.5 inline-block rounded-full border px-1.5 text-[9px] font-semibold ${CAT_COLORS[t.category]}`}>{t.category}</span>{t.title}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center px-4">
                <FileText className="h-7 w-7 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Ziadne dokumenty</p>
                <button onClick={() => newDoc()} className="mt-2 text-xs font-medium text-primary hover:underline">Vytvorit prvy</button>
              </div>
            ) : filtered.map((d) => {
              const { Icon } = STATUS_CFG[d.status];
              return (
                <button key={d.id} onClick={() => { setSelectedId(d.id); setEditMode(false); }} className={`w-full border-b p-3 text-left hover:bg-accent/50 transition-colors ${selectedId===d.id?"bg-primary/5 border-l-2 border-l-primary":""}`}>
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold leading-snug line-clamp-1">{d.title}</p>
                    <Icon className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`inline-block rounded-full border px-1.5 text-[9px] font-semibold ${CAT_COLORS[d.category]}`}>{d.category==="Client_Handout"?"Klient":d.category}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(d.updatedAt).toLocaleDateString("sk-SK")}</span>
                  </div>
                  {d.tags.length>0 && <div className="mt-1 flex gap-1">{d.tags.slice(0,2).map((t)=><span key={t} className="text-[9px] bg-muted rounded px-1 text-muted-foreground">{t}</span>)}{d.tags.length>2&&<span className="text-[9px] text-muted-foreground">+{d.tags.length-2}</span>}</div>}
                </button>
              );
            })}
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {doc ? (
          <>
            <div className="flex items-center justify-between border-b bg-card px-4 py-2 gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {zenMode && <button onClick={() => setZenMode(false)} className="rounded p-1 hover:bg-accent mr-1"><ChevronRight className="h-4 w-4 rotate-180" /></button>}
                <span className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CAT_COLORS[doc.category]}`}>{doc.category==="Client_Handout"?"Pre klientov":doc.category}</span>
                <span className="text-sm font-semibold truncate">{doc.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CFG[doc.status].color}`}>{STATUS_CFG[doc.status].label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!editMode ? (
                  <>
                    <button onClick={() => setEditMode(true)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"><Edit3 className="h-3.5 w-3.5" />Upravit</button>
                    <button onClick={() => { toast.info("Pouzite tlac stranky (Ctrl+P)"); window.print(); }} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"><Download className="h-3.5 w-3.5" />PDF</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditMode(false)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"><X className="h-3.5 w-3.5" />Zrusit</button>
                    <button onClick={save} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"><Save className="h-3.5 w-3.5" />Ulozit</button>
                  </>
                )}
                <button onClick={() => setZenMode(!zenMode)} className="rounded-lg border p-1.5 hover:bg-accent" title="Zen mod"><Maximize2 className="h-3.5 w-3.5" /></button>
                <select value={doc.status} onChange={(e) => setStatus(doc.id, e.target.value as DocStatus)} className="rounded-lg border bg-background px-2 py-1.5 text-xs focus:outline-none">
                  <option value="draft">Koncept</option><option value="published">Publikovat</option><option value="archived">Archivovat</option>
                </select>
                <button onClick={() => del(doc.id)} className="rounded-lg border p-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto">
                {!editMode
                  ? <div className="prose prose-sm max-w-none p-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMd(doc.content) }} />
                  : <textarea id="cv-editor" defaultValue={doc.content} className="h-full w-full resize-none p-8 font-mono text-sm bg-background focus:outline-none leading-relaxed" placeholder="Markdown je podporovany..." />
                }
              </div>

              {!zenMode && (
                <aside className="w-60 shrink-0 border-l bg-muted/20 flex flex-col overflow-y-auto">
                  <div className="border-b p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5 text-primary" />AI Co-pilot</div>
                    <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={3} placeholder="Napr: Pridaj sekciu o bezpecnostnych opatreniach..." className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none resize-none" />
                    <button onClick={aiGen} disabled={generating || !aiPrompt.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90 transition-colors">
                      {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}Generovat sekciu
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold"><Tag className="h-3.5 w-3.5 text-primary" />Tagy</div>
                    <div className="flex gap-1.5">
                      <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key==="Enter" && addTag(tagInput)} placeholder="Pridat tag..." className="flex-1 rounded-lg border bg-background px-2 py-1 text-xs focus:outline-none" />
                      <button onClick={() => addTag(tagInput)} className="rounded-lg bg-primary px-2 text-xs font-medium text-primary-foreground"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {t}<button onClick={() => rmTag(t)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                        </span>
                      ))}
                      {doc.tags.length===0 && <p className="text-[10px] text-muted-foreground">Ziadne tagy</p>}
                    </div>
                    <div className="pt-2 space-y-1 border-t">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />Vytvorene: {new Date(doc.createdAt).toLocaleDateString("sk-SK")}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Edit3 className="h-3 w-3" />Upravene: {new Date(doc.updatedAt).toLocaleDateString("sk-SK")}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><AlignLeft className="h-3 w-3" />{doc.content.length} znakov</div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">Vyberte dokument zo zoznamu</p>
            <button onClick={() => newDoc()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><Plus className="h-4 w-4" />Novy dokument</button>
          </div>
        )}
      </div>
    </div>
  );
}
