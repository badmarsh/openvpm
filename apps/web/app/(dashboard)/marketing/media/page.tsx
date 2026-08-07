"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Image as ImageIcon, 
  Upload, 
  Copy, 
  Download, 
  Filter, 
  Plus, 
  Info, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_MEDIA = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80",
    label: "Uploadnuté",
    date: "pred 2 dňami",
    category: "Obrázky"
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
    label: "AI generované",
    date: "pred 3 dňami",
    category: "Vygenerované AI"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80",
    label: "Uploadnuté",
    date: "pred 5 dňami",
    category: "Obrázky"
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80",
    label: "AI generované",
    date: "pred týždňom",
    category: "Vygenerované AI"
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80",
    label: "Uploadnuté",
    date: "pred 2 týždňami",
    category: "Obrázky"
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80",
    label: "Uploadnuté",
    date: "pred mesiacom",
    category: "Obrázky"
  },
];

type FilterType = "Všetko" | "Obrázky" | "Vygenerované AI";

export default function MediaLibraryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Všetko");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMedia = activeFilter === "Všetko" 
    ? MOCK_MEDIA 
    : MOCK_MEDIA.filter(m => m.category === activeFilter);

  const handleUploadClick = () => {
    toast.info("Nahrávanie súborov bude čoskoro dostupné.");
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Odkaz bol skopírovaný do schránky.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadClick = () => {
    toast.info("Sťahovanie bude čoskoro dostupné.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Knižnica médií</h1>
            <p className="text-sm text-muted-foreground">
              Spravujte vaše obrázky a AI vygenerované médiá
            </p>
          </div>
        </div>
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Nahrať súbory
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="text-sm">
          Knižnica médií sa synchronizuje s príspevkami. Obrázky generované v AI Generátore sa ukladajú sem.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="h-4 w-4 text-muted-foreground mr-1" />
        {(["Všetko", "Obrázky", "Vygenerované AI"] as FilterType[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div 
        onClick={handleUploadClick}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-10 transition-colors hover:bg-accent/50 hover:border-primary/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Kliknite pre nahranie alebo presuňte súbory sem</p>
          <p className="text-xs text-muted-foreground mt-1">Podporované formáty: JPG, PNG, GIF (max. 10MB)</p>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filteredMedia.map((media) => (
          <div 
            key={media.id} 
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
              <img 
                src={media.url} 
                alt="Media" 
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 backdrop-blur-md">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white">
                  {media.label}
                </span>
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={() => handleCopyUrl(media.id, media.url)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-transform"
                  title="Kopírovať odkaz"
                >
                  {copiedId === media.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleDownloadClick}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-transform"
                  title="Stiahnuť"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3">
              <span className="text-xs text-muted-foreground font-medium">
                {media.date}
              </span>
              <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                <button
                  onClick={() => handleCopyUrl(media.id, media.url)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Kopírovať odkaz"
                >
                  {copiedId === media.id ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={handleDownloadClick}
                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Stiahnuť"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
