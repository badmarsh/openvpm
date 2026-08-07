"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Wand2,
  ShieldCheck,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface GenerationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  initialTopic?: string;
}

type Platform = "IG" | "FB" | "GBP" | "TikTok" | "Reels";
type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";

export function GenerationWizard({
  open,
  onOpenChange,
  onCreated,
  initialTopic = "",
}: GenerationWizardProps) {
  const t = useTranslations();
  const [step, setStep] = useState<number>(1);

  // Step 1 State
  const [topic, setTopic] = useState(initialTopic);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["IG", "FB"]);
  const [goal, setGoal] = useState("Awareness");
  const [language, setLanguage] = useState<"sk" | "en" | "cs">("sk");

  // Step 2 State
  const [generatedVariants, setGeneratedVariants] = useState<Record<string, { caption: string; hashtags: string[]; altText: string }>>({});
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [polishInstructions, setPolishInstructions] = useState<Record<string, string>>({});

  // Step 3 State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Step 4 State
  const [hasConsent, setHasConsent] = useState(true);
  const [hasWatermark, setHasWatermark] = useState(true);

  // Step 5 State
  const [scheduledDate, setScheduledDate] = useState("");

  const generateVariants = trpc.marketing.generatePostVariants.useMutation({
    onSuccess: (data) => {
      setGeneratedVariants(data.variants);
      setStep(2);
      setIsGeneratingCopy(false);
      if (!imagePrompt) {
        setImagePrompt(`Veterinárna starostlivosť: ${topic}`);
      }
    },
    onError: (e) => {
      toast.error(e.message);
      setIsGeneratingCopy(false);
    },
  });

  const generateImageMutation = trpc.marketing.generateImage.useMutation({
    onSuccess: (data) => {
      setGeneratedImageUrl(data.imageUrl);
      setIsGeneratingImage(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setIsGeneratingImage(false);
    },
  });

  const createPostMutation = trpc.marketing.createPost.useMutation({
    onSuccess: () => {
      toast.success(t("marketing.planner.successCreate") ?? "Príspevok vytvorený");
      onOpenChange(false);
      resetForm();
      onCreated?.();
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setStep(1);
    setTopic("");
    setGeneratedVariants({});
    setGeneratedImageUrl("");
    setScheduledDate("");
  };

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleStartCopyGeneration = () => {
    if (!topic.trim()) {
      toast.error(t("marketing.planner.errorEmptyTopic") ?? "Zadajte tému príspevku");
      return;
    }
    setIsGeneratingCopy(true);
    generateVariants.mutate({
      topic,
      platforms: selectedPlatforms,
      goal,
      language,
    });
  };

  const handlePolishPlatform = (plat: string) => {
    const instr = polishInstructions[plat];
    if (!instr?.trim()) return;
    toast.info(`Polishing ${plat}...`);
    // Re-generate single variant
    generateVariants.mutate({
      topic: `${topic}\nPolishing Note for ${plat}: ${instr}`,
      platforms: [plat as Platform],
      goal,
      language,
      instruction: instr,
    });
  };

  const handleGenerateImage = () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    generateImageMutation.mutate({
      prompt: imagePrompt,
      aspectRatio,
    });
  };

  const handleSaveFinalPost = () => {
    createPostMutation.mutate({
      status: scheduledDate ? "scheduled" : "draft",
      variants: generatedVariants,
      scheduledDate: scheduledDate || undefined,
      topicInputs: { topic, goal, language },
      hasConsent,
      hasWatermark,
      note: "Vytvorené pomocou AI Generátora",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="slideover" className="flex flex-col overflow-y-auto max-w-3xl">
        <DialogHeader className="border-b px-6 py-4 -mx-6 -mt-6 mb-0">
          <DialogTitle className="flex items-center justify-between text-lg font-semibold">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("marketing.wizard.title") ?? "AI Generátor príspevkov"}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Krok {step} z 5
            </span>
          </DialogTitle>

          {/* Stepper Progress */}
          <div className="flex gap-1 pt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 py-4 space-y-6">
          {/* STEP 1: SETUP */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("marketing.wizard.platforms") ?? "Vyberte cieľové platformy"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["IG", "FB", "GBP", "TikTok", "Reels"] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                        selectedPlatforms.includes(p)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {t("marketing.wizard.topicLabel") ?? "O čom má byť príspevok?"}
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  placeholder="Napr: Letná prevencia kliešťov u psov, dôležitosť vakcinácie proti bleskovým infekciám..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cieľ príspevku</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Awareness">Povedomie & Význam</option>
                    <option value="Education">Edukačný / Tipy</option>
                    <option value="Promotion">Akcia & Špeciálna ponuka</option>
                    <option value="Trust">Budovanie dôvery</option>
                    <option value="Engagement">Zapojenie komunity</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Jazyk</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "sk" | "en" | "cs")}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="sk">Slovenčina</option>
                    <option value="en">English</option>
                    <option value="cs">Čeština</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartCopyGeneration}
                disabled={isGeneratingCopy || !topic.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90 transition-colors"
              >
                {isGeneratingCopy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generovať texty príspevkov
              </button>
            </div>
          )}

          {/* STEP 2: COPY EDITING */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Vygenerované verzie príspevku</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground underline"
                >
                  Upraviť tému
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(generatedVariants).map(([plat, data]) => (
                  <div key={plat} className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-primary">{plat} Verzia</span>
                      <span className="text-[10px] text-muted-foreground">{data.caption.length} znakov</span>
                    </div>

                    <textarea
                      value={data.caption}
                      onChange={(e) =>
                        setGeneratedVariants({
                          ...generatedVariants,
                          [plat]: { ...data, caption: e.target.value },
                        })
                      }
                      rows={5}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono"
                    />

                    {/* Polish input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="✨ Pokyn na úpravu (napr. pridať viac smajlíkov)..."
                        value={polishInstructions[plat] || ""}
                        onChange={(e) =>
                          setPolishInstructions({
                            ...polishInstructions,
                            [plat]: e.target.value,
                          })
                        }
                        className="flex-1 rounded-lg border bg-background px-3 py-1 text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => handlePolishPlatform(plat)}
                        className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold hover:bg-secondary/80"
                      >
                        Vylepšiť
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 border-t pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border px-4 py-2 text-xs font-medium"
                >
                  Späť
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground"
                >
                  Pokračovať na Vizuál →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: IMAGE GENERATION */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pomer strán obrázka
                </label>
                <div className="flex gap-2">
                  {(["1:1", "4:5", "16:9", "9:16"] as AspectRatio[]).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        aspectRatio === ar
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Zadanie pre vizuál (Prompt)
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generovať obrázok
              </button>

              {generatedImageUrl && (
                <div className="rounded-xl border bg-card p-3 space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Náhľad vygenerovaného obrázka</span>
                  <img
                    src={generatedImageUrl}
                    alt="AI Visual"
                    className="max-h-60 rounded-lg object-cover w-full"
                  />
                </div>
              )}

              <div className="flex gap-3 border-t pt-4">
                <button onClick={() => setStep(2)} className="rounded-lg border px-4 py-2 text-xs font-medium">
                  Späť
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground"
                >
                  Pokračovať na Kontrolu →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONSENT */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-xl border bg-card p-4 space-y-4">
                <span className="font-semibold text-xs">Bezpečnostné nastavenia a Súhlas</span>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs">
                    Potvrdzujem, že príspevok neobsahuje citlivé osobné údaje zvierat/majiteľov bez ich súhlasu.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWatermark}
                    onChange={(e) => setHasWatermark(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs">Aplikovať vodoznak kliniky na vizuál</span>
                </label>
              </div>

              <div className="flex gap-3 border-t pt-4">
                <button onClick={() => setStep(3)} className="rounded-lg border px-4 py-2 text-xs font-medium">
                  Späť
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground"
                >
                  Pokračovať na Publikovanie →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SCHEDULE & SAVE */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Dátum a čas publikovania (Voliteľné)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="rounded-xl border bg-muted/40 p-4 text-xs space-y-1">
                <p className="font-semibold text-foreground">Zhrnutie príspevku:</p>
                <p>Platformy: {selectedPlatforms.join(", ")}</p>
                <p>Status: {scheduledDate ? "Naplánovaný" : "Koncept"}</p>
              </div>

              <div className="flex gap-3 border-t pt-4">
                <button onClick={() => setStep(4)} className="rounded-lg border px-4 py-2 text-xs font-medium">
                  Späť
                </button>
                <button
                  onClick={handleSaveFinalPost}
                  disabled={createPostMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  {createPostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Uložiť príspevok
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
