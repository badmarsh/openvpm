"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Palette,
  Sparkles,
  Save,
  Loader2,
  Building2,
  MessageSquare,
  Hash,
  ShieldCheck,
  Plus,
  X,
} from "lucide-react";

export default function BrandKitPage() {
  const t = useTranslations();

  const { data: brandKit, isLoading, refetch } = trpc.marketing.getBrandKit.useQuery();

  const updateBrandKit = trpc.marketing.updateBrandKit.useMutation({
    onSuccess: () => {
      toast.success(t("marketing.brandKit.successUpdate") ?? "Brand Kit bol úspešne uložený");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const suggestHashtags = trpc.marketing.suggestHashtags.useMutation({
    onSuccess: (tags) => {
      setDefaultHashtags(Array.from(new Set([...defaultHashtags, ...tags])));
      toast.success("Hashtagy boli vygenerované");
    },
  });

  // Local Form State
  const [clinicName, setClinicName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [secondaryColor, setSecondaryColor] = useState("#06b6d4");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [tone, setTone] = useState("Fear-Free & Professional");
  const [customTone, setCustomTone] = useState("");
  const [language, setLanguage] = useState("sk");
  const [defaultHashtags, setDefaultHashtags] = useState<string[]>([]);
  const [newHashtagInput, setNewHashtagInput] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);

  useEffect(() => {
    if (brandKit) {
      setClinicName((brandKit.clinicName as string) ?? "");
      setLogoUrl((brandKit.logoUrl as string) ?? "");
      setPrimaryColor((brandKit.primaryColor as string) ?? "#0f766e");
      setSecondaryColor((brandKit.secondaryColor as string) ?? "#06b6d4");
      setAccentColor((brandKit.accentColor as string) ?? "#f59e0b");
      setTone((brandKit.tone as string) ?? "Fear-Free & Professional");
      setCustomTone((brandKit.customTone as string) ?? "");
      setLanguage((brandKit.language as string) ?? "sk");
      setDefaultHashtags((brandKit.defaultHashtags as string[]) ?? []);
      setDisclaimer((brandKit.disclaimer as string) ?? "");
      setIncludeDisclaimer((brandKit.includeDisclaimer as boolean) ?? true);
    }
  }, [brandKit]);

  const handleSave = () => {
    updateBrandKit.mutate({
      clinicName,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      tone,
      customTone,
      language,
      defaultHashtags,
      disclaimer,
      includeDisclaimer,
    });
  };

  const addHashtag = () => {
    if (!newHashtagInput.trim()) return;
    const tag = newHashtagInput.startsWith("#") ? newHashtagInput.trim() : `#${newHashtagInput.trim()}`;
    if (!defaultHashtags.includes(tag)) {
      setDefaultHashtags([...defaultHashtags, tag]);
    }
    setNewHashtagInput("");
  };

  const removeHashtag = (tagToRemove: string) => {
    setDefaultHashtags(defaultHashtags.filter((t) => t !== tagToRemove));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              {t("marketing.brandKit.title") ?? "Brand Kit Kliniky"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Správa identity kliniky, štýlu komunikácie a šablón pre AI marketing.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={updateBrandKit.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {updateBrandKit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Uložiť Brand Kit
        </button>
      </div>

      {/* Section 1: Identity */}
      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-3 font-semibold text-sm">
          <Building2 className="h-4 w-4 text-primary" />
          Identita kliniky
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Názov kliniky</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL Loga (voliteľné)</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Farebná paleta kliniky</label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <span className="text-xs font-mono">Primárna: {primaryColor}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <span className="text-xs font-mono">Sekundárna: {secondaryColor}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <span className="text-xs font-mono">Akcent: {accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Brand Voice */}
      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-3 font-semibold text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          Hlas a tón komunikácie (Brand Voice)
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Predvolený tón komunikácie</label>
          <div className="flex flex-wrap gap-2">
            {[
              "Fear-Free & Professional",
              "Friendly & Empathetic",
              "Educational & Expert",
              "Playful & Warm",
            ].map((tPreset) => (
              <button
                key={tPreset}
                type="button"
                onClick={() => setTone(tPreset)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tone === tPreset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent text-muted-foreground"
                }`}
              >
                {tPreset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Vlastné inštrukcie pre hlas značky
          </label>
          <textarea
            value={customTone}
            onChange={(e) => setCustomTone(e.target.value)}
            rows={3}
            placeholder="Napr: Komunikujeme priateľsky, používame empatiu k majiteľom, zdôrazňujeme bezstresový prístup ku zvieratám..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      </div>

      {/* Section 3: Hashtags */}
      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Hash className="h-4 w-4 text-primary" />
            Predvolené Hashtagy
          </div>
          <button
            type="button"
            onClick={() => suggestHashtags.mutate({ topic: clinicName })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Navrhnúť AI hashtagy
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newHashtagInput}
            onChange={(e) => setNewHashtagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHashtag()}
            placeholder="#pridathashtag..."
            className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none"
          />
          <button
            type="button"
            onClick={addHashtag}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {defaultHashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button onClick={() => removeHashtag(tag)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Disclaimer */}
      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-3 font-semibold text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Zákonné upozornenie & Disclaimer
        </div>

        <textarea
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          rows={2}
          className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDisclaimer}
            onChange={(e) => setIncludeDisclaimer(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-xs">Automaticky pripájať toto upozornenie ku každému príspevku</span>
        </label>
      </div>
    </div>
  );
}
