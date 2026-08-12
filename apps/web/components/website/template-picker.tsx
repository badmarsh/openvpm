"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/templates/metadata";

interface TemplatePickerProps {
  onSelect: (templateId: string, slug: string) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function TemplatePicker({ onSelect, trigger, disabled }: TemplatePickerProps) {
  const t = useTranslations("website");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("clean-modern");
  const [slug, setSlug] = useState("");

  const handleConfirm = () => {
    if (!slug) return;
    // Map the selected slug to its templateId
    const tmpl = TEMPLATES.find((t) => t.slug === selected);
    if (!tmpl) return;
    
    onSelect(tmpl.id, slug);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("editor.template")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelected(tmpl.slug)}
                disabled={disabled}
                className={cn(
                  "group relative flex flex-col items-stretch rounded-xl border-2 overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-md",
                  selected === tmpl.slug
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/40"
                )}
              >
                {/* Mini browser chrome */}
                <div className="relative h-[90px] overflow-hidden" style={{ background: tmpl.palette.bg }}>
                  {/* Browser top bar */}
                  <div className="flex items-center gap-1 px-2 py-1.5" style={{ background: tmpl.palette.primary }}>
                    <span className="w-2 h-2 rounded-full bg-white/30" />
                    <span className="w-2 h-2 rounded-full bg-white/30" />
                    <span className="w-2 h-2 rounded-full bg-white/30" />
                    <span className="ml-2 flex-1 h-1.5 rounded bg-white/20" />
                  </div>
                  {/* Hero section */}
                  <div className="h-10 px-3 flex flex-col justify-center gap-1" style={{ background: tmpl.palette.primary }}>
                    <div className="h-1.5 w-3/4 rounded" style={{ background: tmpl.palette.accent }} />
                    <div className="h-1 w-1/2 rounded bg-white/30" />
                  </div>
                  {/* Content section */}
                  <div className="px-3 py-2 flex flex-col gap-1.5" style={{ background: tmpl.palette.bg }}>
                    <div className="flex gap-1.5">
                      <div className="h-4 flex-1 rounded" style={{ background: tmpl.palette.primary + '15' }} />
                      <div className="h-4 flex-1 rounded" style={{ background: tmpl.palette.primary + '15' }} />
                      <div className="h-4 flex-1 rounded" style={{ background: tmpl.palette.accent + '30' }} />
                    </div>
                  </div>
                  {/* Selected overlay */}
                  {selected === tmpl.slug && (
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                  )}
                </div>
                {/* Label */}
                <div className="px-3 py-2 border-t border-border bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate">{tmpl.name.sk}</span>
                    {selected === tmpl.slug && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{tmpl.tagline.sk}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-2 mt-2">
            <span className="text-sm font-medium">Slug</span>
            <Input
              id="site-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-clinic"
              disabled={disabled}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={disabled}>
            {t("editor.close")}
          </Button>
          <Button onClick={handleConfirm} disabled={disabled || slug.length < 3}>
            {t("editor.saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}