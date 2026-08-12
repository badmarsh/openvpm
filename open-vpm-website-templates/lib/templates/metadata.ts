/**
 * OpenVPM Template Metadata
 * Single source of truth for all 5 veterinary clinic templates.
 * Used by: template selector, OG image generator, backend DB seeding, i18n.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HoursRow {
  day: { sk: string; en: string; hu: string }
  time: string
  isEmergency?: boolean
}

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
  sections: string[]               // section IDs in DOM order
  defaultHours: HoursRow[]         // opening hours used in this template
  address: string
  phone: string
  email: string
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
    sections: ['sluzby', 'o-nas', 'recenzie', 'kontakt'],
    defaultHours: [
      { day: { sk: 'Pondelok', en: 'Monday',    hu: 'Hétfő'      }, time: '8:00 – 18:00' },
      { day: { sk: 'Utorok',   en: 'Tuesday',   hu: 'Kedd'       }, time: '8:00 – 18:00' },
      { day: { sk: 'Streda',   en: 'Wednesday', hu: 'Szerda'     }, time: '8:00 – 16:00' },
      { day: { sk: 'Štvrtok',  en: 'Thursday',  hu: 'Csütörtök'  }, time: '8:00 – 18:00' },
      { day: { sk: 'Piatok',   en: 'Friday',    hu: 'Péntek'     }, time: '8:00 – 16:00' },
      { day: { sk: 'Sobota',   en: 'Saturday',  hu: 'Szombat'    }, time: '9:00 – 13:00' },
      { day: { sk: 'Nedeľa',   en: 'Sunday',    hu: 'Vasárnap'   }, time: 'Zatvorené' },
    ],
    address: 'Hlavná 42, 811 01 Bratislava',
    phone: '+421 900 000 000',
    email: 'info@vetklinika.sk',
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
    sections: ['recenzie', 'tim', 'sluzby', 'faq', 'kontakt'],
    defaultHours: [
      { day: { sk: 'Pondelok', en: 'Monday',    hu: 'Hétfő'      }, time: '8:00 – 18:00' },
      { day: { sk: 'Utorok',   en: 'Tuesday',   hu: 'Kedd'       }, time: '8:00 – 18:00' },
      { day: { sk: 'Streda',   en: 'Wednesday', hu: 'Szerda'     }, time: '8:00 – 18:00' },
      { day: { sk: 'Štvrtok',  en: 'Thursday',  hu: 'Csütörtök'  }, time: '8:00 – 18:00' },
      { day: { sk: 'Piatok',   en: 'Friday',    hu: 'Péntek'     }, time: '8:00 – 18:00' },
      { day: { sk: 'Sobota',   en: 'Saturday',  hu: 'Szombat'    }, time: '9:00 – 14:00' },
      { day: { sk: 'Nedeľa',   en: 'Sunday',    hu: 'Vasárnap'   }, time: 'Zatvorené' },
    ],
    address: 'Hlavná 42, 811 01 Bratislava',
    phone: '+421 900 000 000',
    email: 'info@srdieckoklinika.sk',
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
    sections: ['sluzby', 'vybavenie', 'lekar', 'ceny', 'kontakt'],
    defaultHours: [
      { day: { sk: 'Pondelok', en: 'Monday',    hu: 'Hétfő'      }, time: '8:00 – 19:00' },
      { day: { sk: 'Utorok',   en: 'Tuesday',   hu: 'Kedd'       }, time: '8:00 – 19:00' },
      { day: { sk: 'Streda',   en: 'Wednesday', hu: 'Szerda'     }, time: '8:00 – 17:00' },
      { day: { sk: 'Štvrtok',  en: 'Thursday',  hu: 'Csütörtök'  }, time: '8:00 – 19:00' },
      { day: { sk: 'Piatok',   en: 'Friday',    hu: 'Péntek'     }, time: '8:00 – 17:00' },
      { day: { sk: 'Sobota',   en: 'Saturday',  hu: 'Szombat'    }, time: '9:00 – 14:00' },
      { day: { sk: 'Nedeľa',   en: 'Sunday',    hu: 'Vasárnap'   }, time: 'Zatvorené' },
    ],
    address: 'Vedecká 18, 811 02 Bratislava',
    phone: '+421 900 000 000',
    email: 'info@medvet.sk',
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
    sections: ['sluzby', 'o-nas', 'recenzie', 'tim', 'ceny', 'faq', 'kontakt'],
    defaultHours: [
      { day: { sk: 'Pondelok', en: 'Monday',    hu: 'Hétfő'      }, time: '8:00 – 18:00' },
      { day: { sk: 'Utorok',   en: 'Tuesday',   hu: 'Kedd'       }, time: '8:00 – 18:00' },
      { day: { sk: 'Streda',   en: 'Wednesday', hu: 'Szerda'     }, time: '8:00 – 18:00' },
      { day: { sk: 'Štvrtok',  en: 'Thursday',  hu: 'Csütörtök'  }, time: '8:00 – 18:00' },
      { day: { sk: 'Piatok',   en: 'Friday',    hu: 'Péntek'     }, time: '8:00 – 18:00' },
      { day: { sk: 'Sobota',   en: 'Saturday',  hu: 'Szombat'    }, time: '9:00 – 14:00' },
      { day: { sk: 'Nedeľa',   en: 'Sunday',    hu: 'Vasárnap'   }, time: 'Zatvorené' },
    ],
    address: 'Radostná 7, 811 05 Bratislava',
    phone: '+421 900 000 000',
    email: 'ahoj@steniatko.sk',
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
    sections: ['pohotovost', 'navod', 'sluzby', 'kontakt'],
    defaultHours: [
      { day: { sk: 'Pondelok – Piatok', en: 'Monday – Friday', hu: 'Hétfő – Péntek'  }, time: '8:00 – 20:00' },
      { day: { sk: 'Sobota',            en: 'Saturday',        hu: 'Szombat'          }, time: '9:00 – 14:00' },
      { day: { sk: 'Nedeľa',            en: 'Sunday',          hu: 'Vasárnap'         }, time: 'Pohotovosť', isEmergency: true },
      { day: { sk: 'Sviatky',           en: 'Holidays',        hu: 'Ünnepnapok'       }, time: 'Pohotovosť', isEmergency: true },
      { day: { sk: 'POHOTOVOSŤ 24/7',   en: 'EMERGENCY 24/7',  hu: 'SÜRGŐSSÉG 24/7'  }, time: '+421 900 000 000', isEmergency: true },
    ],
    address: 'Lekárska 8, 811 04 Bratislava',
    phone: '+421 900 000 000',
    email: 'info@vetpohotovost.sk',
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
