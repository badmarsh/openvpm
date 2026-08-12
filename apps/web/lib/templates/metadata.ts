/**
 * OpenVPM Template Metadata
 * Single source of truth for all 5 veterinary clinic templates.
 * Used by: template selector, OG image generator, backend DB seeding, i18n.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TemplateMetadata {
  id: 'template-1' | 'template-2' | 'template-3' | 'template-4' | 'template-5'
  slug: string
  name: { sk: string; en: string; hu: string }
  tagline: { sk: string; en: string; hu: string }
  targetAudience: string
  primaryEmotion: string
  primaryCTA: string
  palette: {
    bg: string       // page background
    primary: string  // dominant brand color
    accent: string   // call-to-action / highlight
    text: string     // body text
  }
  accentColor: string              // for OpenVPM components (OpeningHoursTable, etc.)
  bookingCTAVariant: 'navy' | 'terracotta' | 'blue' | 'coral' | 'red'
  fearFreeBadgeVariant: 'minimal' | 'full' | 'playful'
  previewImage: string             // relative public path, e.g. /og/template-1.png
  tags: string[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const TEMPLATES: TemplateMetadata[] = [
  {
    id: 'template-1',
    slug: 'clean-modern',
    name: {
      sk: 'Čistá & Moderná',
      en: 'Clean & Modern',
      hu: 'Tiszta és Modern',
    },
    tagline: {
      sk: 'Starostlivosť, ktorej môžete dôverovať',
      en: 'Care you can trust',
      hu: 'Gondoskodás, amelyben megbízhat',
    },
    targetAudience: 'Mestskí profesionáli, majitelia psov a mačiek vo veku 28–45',
    primaryEmotion: 'Dôvera, prémium',
    primaryCTA: 'Rezervovať termín',
    palette: {
      bg: '#FFFFFF',
      primary: '#1B2A4A',
      accent: '#7BA68C',
      text: '#1B2A4A',
    },
    accentColor: '#7BA68C',
    bookingCTAVariant: 'navy',
    fearFreeBadgeVariant: 'minimal',
    previewImage: '/og/template-1.png',
    tags: ['minimalist', 'trust', 'premium', 'urban', 'fear-free'],
  },

  {
    id: 'template-2',
    slug: 'warm-trusting',
    name: {
      sk: 'Vrúcna & Dôveryhodná',
      en: 'Warm & Trusting',
      hu: 'Meleg és Megbízható',
    },
    tagline: {
      sk: 'Vaši miláčikovia sú u nás ako doma',
      en: 'Your pets feel at home here',
      hu: 'Kedvencei otthon érzik magukat nálunk',
    },
    targetAudience: 'Rodiny, dlhodobí klienti, majitelia prvého zvieraťa',
    primaryEmotion: 'Pohodlie, spolupatričnosť',
    primaryCTA: 'Zavolajte nám',
    palette: {
      bg: '#FFF8F0',
      primary: '#3D6B4F',
      accent: '#C4704B',
      text: '#3D6B4F',
    },
    accentColor: '#C4704B',
    bookingCTAVariant: 'terracotta',
    fearFreeBadgeVariant: 'full',
    previewImage: '/og/template-2.png',
    tags: ['warm', 'family', 'accordion', 'faq', 'fear-free', 'team'],
  },

  {
    id: 'template-3',
    slug: 'clinical-professional',
    name: {
      sk: 'Klinická & Profesionálna',
      en: 'Clinical & Professional',
      hu: 'Klinikai és Professzionális',
    },
    tagline: {
      sk: 'Profesionálna veterinárna medicína na najvyššej úrovni',
      en: 'Professional veterinary medicine at the highest level',
      hu: 'Professzionális állatorvosi ellátás a legmagasabb szinten',
    },
    targetAudience: 'Informovaní majitelia, chovatelia, majitelia vzácnych plemien',
    primaryEmotion: 'Dôvera, autorita',
    primaryCTA: 'Zobraziť ceny',
    palette: {
      bg: '#FFFFFF',
      primary: '#0F172A',
      accent: '#2563EB',
      text: '#0F172A',
    },
    accentColor: '#2563EB',
    bookingCTAVariant: 'blue',
    fearFreeBadgeVariant: 'minimal',
    previewImage: '/og/template-3.png',
    tags: ['clinical', 'pricing-table', 'stats-bar', 'equipment', 'authority'],
  },

  {
    id: 'template-4',
    slug: 'playful-friendly',
    name: {
      sk: 'Hravá & Priateľská',
      en: 'Playful & Friendly',
      hu: 'Játékos és Barátságos',
    },
    tagline: {
      sk: 'Ahoj! Sme tu pre tvojho miláčika',
      en: "Hi! We're here for your pet",
      hu: 'Helló! Mi itt vagyunk a kedvencedért',
    },
    targetAudience: 'Mladí majitelia (18–32), sociálne siete, prvé zvieratko',
    primaryEmotion: 'Zábava, prístupnosť',
    primaryCTA: 'Rezervovať termín',
    palette: {
      bg: '#FFFDF7',
      primary: '#2D3436',
      accent: '#FF6B6B',
      text: '#2D3436',
    },
    accentColor: '#FF6B6B',
    bookingCTAVariant: 'coral',
    fearFreeBadgeVariant: 'playful',
    previewImage: '/og/template-4.png',
    tags: ['playful', 'colorful', 'wave-dividers', 'young-owners', 'subscription-pricing'],
  },

  {
    id: 'template-5',
    slug: 'emergency-first',
    name: {
      sk: 'Pohotovosť na prvom mieste',
      en: 'Emergency First',
      hu: 'Sürgősségi Ellátás Első',
    },
    tagline: {
      sk: 'Sme tu, keď to najviac potrebujete',
      en: "We're here when you need us most",
      hu: 'Ott vagyunk, amikor a legjobban szüksége van ránk',
    },
    targetAudience: 'Majitelia v núdzi, 24/7 pohotovostné prípady',
    primaryEmotion: 'Pokoj v núdzi, urgentnosť',
    primaryCTA: 'Volať TERAZ',
    palette: {
      bg: '#F8FAFC',
      primary: '#1E293B',
      accent: '#DC2626',
      text: '#1E293B',
    },
    accentColor: '#DC2626',
    bookingCTAVariant: 'red',
    fearFreeBadgeVariant: 'minimal',
    previewImage: '/og/template-5.png',
    tags: ['emergency', '24-7', 'sticky-banner', 'urgent-care', 'pulse-animation'],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTemplateById(id: string): TemplateMetadata | undefined {
  return TEMPLATES.find(t => t.id === id)
}

export function getTemplateBySlug(slug: string): TemplateMetadata | undefined {
  return TEMPLATES.find(t => t.slug === slug)
}
