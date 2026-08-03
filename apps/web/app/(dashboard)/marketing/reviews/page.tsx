"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Star,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Heart,
  Copy,
  Check,
} from "lucide-react";

const REVIEW_TEMPLATES = [
  {
    id: "price",
    rating: 2,
    label: "Sťažnosť na cenu",
    icon: ThumbsDown,
    color: "text-rose-600",
    text: "Cena ošetrenia bola príliš vysoká. Nie som spokojný.",
  },
  {
    id: "waiting",
    rating: 3,
    label: "Dlhé čakanie",
    icon: AlertTriangle,
    color: "text-amber-600",
    text: "Čakali sme veľmi dlho, ale ošetrenie bolo v poriadku.",
  },
  {
    id: "death",
    rating: 5,
    label: "Úmrtie pacienta",
    icon: Heart,
    color: "text-violet-600",
    text: "Aj napriek snahám veterinára sme stratili nášho miláčika. Personál bol veľmi empatický.",
  },
  {
    id: "praise",
    rating: 5,
    label: "5★ pochvala",
    icon: ThumbsUp,
    color: "text-emerald-600",
    text: "Skvelá starostlivosť! Veterinár bol trpezlivý a náš pes bol pokojný počas celého vyšetrenia.",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [generatedReply, setGeneratedReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!reviewText.trim()) {
      setError("Vložte text recenzie");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/marketing-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "suggest_review_reply",
          reviewText,
          reviewRating: rating,
        }),
      });
      const data = await res.json();
      if (data.success) setGeneratedReply(data.content ?? "");
      else setError(data.error ?? "Chyba pri generovaní");
    } catch {
      setError("Spojenie zlyhalo. Skúste znovu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadTemplate = (tpl: (typeof REVIEW_TEMPLATES)[0]) => {
    setReviewText(tpl.text);
    setRating(tpl.rating);
    setGeneratedReply("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Star className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Správa Recenzií</h1>
          <p className="text-sm text-muted-foreground">
            AI-asistované odpovede na Google recenzie — Fear-Free a profesionálne
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Input panel */}
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Vstup recenzie</h2>

          {/* Quick templates */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Rýchle scenáre:</p>
            <div className="grid grid-cols-2 gap-2">
              {REVIEW_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl)}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
                >
                  <tpl.icon className={`h-3.5 w-3.5 shrink-0 ${tpl.color}`} />
                  <span className="truncate font-medium">{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star rating input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Hodnotenie</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      s <= (hoveredStar ?? rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 self-center text-sm text-muted-foreground">
                {rating}★
              </span>
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Text recenzie</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              placeholder="Vložte text recenzie od klienta…"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !reviewText.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90 transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Generujem odpoveď…" : "Generovať odpoveď s AI"}
          </button>
        </div>

        {/* Right: Output panel */}
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Navrhovaná odpoveď</h2>
            {generatedReply && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Skopírované!" : "Kopírovať"}
              </button>
            )}
          </div>

          {!generatedReply ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Vložte recenziu a kliknite &ldquo;Generovať odpoveď&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                AI zohľadní hodnotenie, Fear-Free prístup a GDPR
              </p>
            </div>
          ) : (
            <textarea
              value={generatedReply}
              onChange={(e) => setGeneratedReply(e.target.value)}
              rows={14}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          )}

          {generatedReply && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
              ⚠️ Vždy skontrolujte odpoveď pred zverejnením. AI môže chybovať — osobne posúďte kontext.
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="rounded-xl border bg-muted/30 p-5">
        <h3 className="mb-3 text-sm font-semibold">Pravidlá odpovedania na recenzie</h3>
        <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "⏱️", text: "Odpovede do 48 hodín od zverejnenia" },
            { icon: "🔒", text: "Žiadne mená pacientov ani diagnózy (GDPR)" },
            { icon: "✍️", text: "Podpíšte sa — 'Tím ambulancie' alebo 'MVDr. X'" },
            { icon: "💚", text: "Fear-Free tón — vždy empatický a profesionálny" },
          ].map((g) => (
            <div key={g.text} className="flex items-start gap-2">
              <span>{g.icon}</span>
              <span>{g.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
