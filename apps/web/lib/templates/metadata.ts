export interface TemplatePalette {
  accent: string;
  accentForeground: string;
  bg: string;
  muted: string;
  mutedForeground: string;
  card: string;
  border: string;
}

export interface TemplateMeta {
  id: string;
  slug: string;
  name: { sk: string; en: string };
  description: { sk: string; en: string };
  palette: TemplatePalette;
  fontFamily: string;
  heroStyle: "full-width" | "contained" | "split";
  borderRadius: "none" | "sm" | "md" | "lg";
}

export const templateMetadata: Record<string, TemplateMeta> = {
  "clean-modern": {
    id: "template-1",
    slug: "clean-modern",
    name: { sk: "Čistý a moderný", en: "Clean & Modern" },
    description: { sk: "Minimalistický, veľa bieleho priestoru, ostrá typografia", en: "Minimalist, lots of white space, sharp typography" },
    palette: {
      accent: "#2563eb",
      accentForeground: "#ffffff",
      bg: "#ffffff",
      muted: "#f8fafc",
      mutedForeground: "#64748b",
      card: "#ffffff",
      border: "#e2e8f0",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    heroStyle: "full-width",
    borderRadius: "lg",
  },
  "warm-trusting": {
    id: "template-2",
    slug: "warm-trusting",
    name: { sk: "Teplý a dôveryhodný", en: "Warm & Trusting" },
    description: { sk: "Zemské tóny, dôraz na recenzie, rodinná atmosféra", en: "Earth tones, emphasis on reviews, family atmosphere" },
    palette: {
      accent: "#92400e",
      accentForeground: "#ffffff",
      bg: "#fefce8",
      muted: "#fef3c7",
      mutedForeground: "#78716c",
      card: "#fffbeb",
      border: "#fde68a",
    },
    fontFamily: "Georgia, serif",
    heroStyle: "contained",
    borderRadius: "md",
  },
  "clinical-professional": {
    id: "template-3",
    slug: "clinical-professional",
    name: { sk: "Klinická a profesionálna", en: "Clinical & Professional" },
    description: { sk: "Dáta a fakty, zoznam služieb, autorita", en: "Data and facts, service list, authority" },
    palette: {
      accent: "#0f766e",
      accentForeground: "#ffffff",
      bg: "#ffffff",
      muted: "#f0fdfa",
      mutedForeground: "#475569",
      card: "#ffffff",
      border: "#ccfbf1",
    },
    fontFamily: "system-ui, sans-serif",
    heroStyle: "split",
    borderRadius: "sm",
  },
  "playful-friendly": {
    id: "template-4",
    slug: "playful-friendly",
    name: { sk: "Hravá a priateľská", en: "Playful & Friendly" },
    description: { sk: "Ilustrovaný, farebný, priateľský k zvieratám", en: "Illustrated, colorful, animal-friendly" },
    palette: {
      accent: "#7c3aed",
      accentForeground: "#ffffff",
      bg: "#faf5ff",
      muted: "#f3e8ff",
      mutedForeground: "#6b7280",
      card: "#ffffff",
      border: "#e9d5ff",
    },
    fontFamily: "Nunito, system-ui, sans-serif",
    heroStyle: "contained",
    borderRadius: "lg",
  },
  "emergency-first": {
    id: "template-5",
    slug: "emergency-first",
    name: { sk: "Pohotovosť na prvom mieste", en: "Emergency First" },
    description: { sk: "Pohotovosť a urgentné kontakty v popredí", en: "Emergency and urgent contacts front and center" },
    palette: {
      accent: "#dc2626",
      accentForeground: "#ffffff",
      bg: "#ffffff",
      muted: "#fef2f2",
      mutedForeground: "#475569",
      card: "#ffffff",
      border: "#fecaca",
    },
    fontFamily: "system-ui, sans-serif",
    heroStyle: "full-width",
    borderRadius: "none",
  },
};

export function getTemplateMeta(slug: string): TemplateMeta | undefined {
  return templateMetadata[slug];
}

export function getAllTemplateSlugs(): string[] {
  return Object.keys(templateMetadata);
}
