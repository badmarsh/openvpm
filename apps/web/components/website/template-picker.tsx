"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
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

const TEMPLATES = [
  { id: "clean-modern", labelKey: "cleanModern" },
  { id: "warm-trusting", labelKey: "warmTrusting" },
  { id: "clinical-professional", labelKey: "clinicalProfessional" },
  { id: "playful-friendly", labelKey: "playfulFriendly" },
  { id: "emergency-first", labelKey: "emergencyFirst" },
];

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
    onSelect(selected, slug);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("editor.template")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelected(template.id)}
                disabled={disabled}
                className={cn(
                  "relative flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                  selected === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">
                    {t(`templates.${template.labelKey}` as "templates.cleanModern")}
                  </span>
                  {selected === template.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <Globe className="mt-3 h-6 w-6 text-muted-foreground" />
              </button>
            ))}
          </div>
          <div className="space-y-2">
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