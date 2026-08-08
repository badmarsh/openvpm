"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { 
  Image as ImageIcon, 
  Upload, 
  Copy, 
  Download, 
  Filter, 
  Info, 
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

type FilterType = "Všetko" | "Obrázky" | "Vygenerované AI";

export default function MediaLibraryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Všetko");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: mediaAssets, isLoading } = trpc.marketing.getMediaAssets.useQuery(
    { 
      category: activeFilter === "Všetko" ? "all" : activeFilter === "Obrázky" ? "marketing" : "ai_generated" 
    }
  );

  const registerMediaMutation = trpc.marketing.registerMediaAsset.useMutation({
    onSuccess: () => {
      utils.marketing.getMediaAssets.invalidate();
    },
    onError: () => {
      toast.error("Nastala chyba pri ukladaní súboru.");
    }
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Súbor je príliš veľký (max 10MB)");
      return;
    }

    try {
      setIsUploading(true);
      toast.loading("Nahrávam súbor...", { id: "upload" });

      // 1. Get presigned URL
      const res = await fetch("/api/media-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type }),
      });

      if (!res.ok) throw new Error("Nepodarilo sa získať upload URL");
      const { uploadUrl, fileKey, fileUrl } = await res.json();

      // 2. Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Chyba pri nahrávaní na server");

      // 3. Register in DB
      await registerMediaMutation.mutateAsync({
        fileName: file.name,
        fileKey,
        fileUrl,
        mimeType: file.type || undefined,
        fileSizeBytes: file.size,
        category: "marketing",
      });

      toast.success("Súbor bol úspešne nahraný", { id: "upload" });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Nastala chyba pri nahrávaní", { id: "upload" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Odkaz bol skopírovaný do schránky.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadClick = (url: string) => {
    window.open(url, "_blank");
  };

  const formatDate = (dateValue: string | Date | null) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("sk-SK", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/gif"
      />

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
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-10 transition-colors hover:bg-accent/50 hover:border-primary/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Kliknite pre nahranie alebo presuňte súbory sem</p>
          <p className="text-xs text-muted-foreground mt-1">Podporované formáty: JPG, PNG, GIF (max. 10MB)</p>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !mediaAssets?.length ? (
        <div className="flex h-40 items-center justify-center rounded-xl border bg-card text-muted-foreground text-sm">
          Zatiaľ žiadne médiá.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {mediaAssets.map((media: { id: string; fileName: string; fileUrl: string; mimeType: string | null; fileSizeBytes: number | null; category: string | null; createdAt: Date }) => (
            <div 
              key={media.id} 
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                <img 
                  src={media.fileUrl} 
                  alt={media.fileName} 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 backdrop-blur-md">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white">
                    {media.category === 'ai_generated' ? 'Vygenerované AI' : 'Obrázky'}
                  </span>
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(media.id, media.fileUrl);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadClick(media.fileUrl);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-transform"
                    title="Stiahnuť"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3">
                <span className="truncate text-xs text-muted-foreground font-medium pr-2">
                  {formatDate(media.createdAt as any)}
                </span>
                <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(media.id, media.fileUrl);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadClick(media.fileUrl);
                    }}
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
      )}
    </div>
  );
}
