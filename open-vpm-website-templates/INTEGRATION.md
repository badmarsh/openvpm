# OpenVPM Integration Guide

Step-by-step guide for integrating the 5 OpenVPM templates into the main
Next.js 16 (App Router) application.

**Stack:** Next.js 16 · Tailwind v4 · shadcn/ui · TypeScript

---

## 1. File Structure — What to Copy Where

```
v0-project/                         MAIN APP (copy into)
├── app/
│   ├── [locale]/                   i18n wrapper (see §4)
│   │   └── [slug]/
│   │       └── page.tsx            ← rendered template
│   └── og/
│       └── route.tsx               ← already here, keep as-is
├── components/
│   └── openvpm/                    ← shared component library
│       ├── BookingCTA.tsx
│       ├── ContactBlock.tsx
│       ├── FearFreeBadge.tsx
│       ├── OpeningHoursTable.tsx
│       ├── ServiceCard.tsx
│       ├── TestimonialCard.tsx
│       └── index.ts
└── lib/
    └── templates/
        └── metadata.ts             ← TEMPLATES array, source of truth
```

**Checklist:**
- [ ] Copy `components/openvpm/` → same path in main app
- [ ] Copy `lib/templates/metadata.ts` → same path
- [ ] Copy `app/og/route.tsx` → same path
- [ ] Copy the 5 `app/template-*/page.tsx` files into your routing structure

---

## 2. Replacing Hardcoded Text with Content Props

Each template `page.tsx` currently uses hardcoded strings. In production,
pass a `content` prop from the database (JSONB column) down to the template.

### 2a. Define the content interface

```ts
// lib/templates/content.ts
export interface ClinicContent {
  clinicName: string
  tagline: string
  address: string
  phone: string
  email: string
  googleMapsUrl: string
  foundedYear: number
  heroHeadline: string
  heroSubtext: string
  services: Array<{
    title: string
    shortDesc: string
    fullDesc?: string
    price?: string
    iconName: string
  }>
  testimonials: Array<{
    text: string
    author: string
    petName?: string
    stars: 1 | 2 | 3 | 4 | 5
    source?: 'google' | 'facebook'
  }>
  team: Array<{
    name: string
    role: string
    bio: string
    initials: string
  }>
  hours: import('./metadata').HoursRow[]
}
```

### 2b. Thread the content prop into a template

```tsx
// app/[locale]/[slug]/page.tsx
import { getClinicContent } from '@/lib/db/clinic'
import { getTemplateBySlug } from '@/lib/templates/metadata'
import Template1 from '@/components/templates/Template1'

export default async function ClinicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const tmpl = getTemplateBySlug(slug)
  if (!tmpl) notFound()

  const content = await getClinicContent(slug, locale)

  // Each template accepts a `content` prop — see §2c
  return <Template1 content={content} locale={locale} />
}
```

### 2c. Refactor a template to accept content prop

Before (hardcoded):
```tsx
<h1>Starostlivosť, ktorej môžete dôverovať</h1>
```

After (prop-driven):
```tsx
// Template1.tsx
interface Template1Props {
  content: ClinicContent
  locale: 'sk' | 'en' | 'hu'
}

export default function Template1({ content, locale }: Template1Props) {
  return (
    // ...
    <h1>{content.heroHeadline}</h1>
    // ...
  )
}
```

---

## 3. Wiring OpenVPM Components to Real DB Data

### OpeningHoursTable

```tsx
import { OpeningHoursTable } from '@/components/openvpm'
import { getTemplateById } from '@/lib/templates/metadata'

// In your page or component:
const tmpl = getTemplateById('template-1')!

<OpeningHoursTable
  hours={content.hours}       // from DB — shape: HoursRow[]
  accentColor={tmpl.accentColor}
/>
```

The `hours` array in the DB should match the `HoursRow` shape defined in
`lib/templates/metadata.ts`. Store it as a JSONB column.

### ContactBlock

```tsx
import { ContactBlock } from '@/components/openvpm'

<ContactBlock
  address={content.address}
  phone={content.phone}
  email={content.email}
  googleMapsUrl={content.googleMapsUrl}
  accentColor={tmpl.accentColor}
/>
```

### BookingCTA

```tsx
import { BookingCTA } from '@/components/openvpm'

<BookingCTA
  phone={content.phone}
  onlineBookingUrl={content.onlineBookingUrl}  // nullable
  variant={tmpl.bookingCTAVariant}             // from metadata
/>
```

`bookingCTAVariant` is stored in `TEMPLATES` in `metadata.ts` — read it
from there at render time; it never needs to be in the DB.

---

## 4. i18n — Replacing Slovak Strings with `t()` Calls

**Namespace:** `"website"`

### 4a. Setup (next-intl recommended)

```
pnpm add next-intl
```

```
messages/
├── sk.json
├── en.json
└── hu.json
```

### 4b. Key naming convention

```json
// messages/sk.json
{
  "website": {
    "nav": {
      "services": "Služby",
      "about": "O nás",
      "reviews": "Recenzie",
      "contact": "Kontakt"
    },
    "hero": {
      "badge": "Veterinárna klinika",
      "headline": "Starostlivosť, ktorej môžete dôverovať",
      "subtext": "Profesionálna a láskavá starostlivosť..."
    },
    "cta": {
      "book": "Rezervovať termín",
      "call": "Zavolajte nám",
      "viewPrices": "Zobraziť ceny"
    },
    "fearFree": {
      "badge": "Fear-Free",
      "certified": "Fear-Free certifikovaní",
      "description": "Maximálny dôraz na pohodu zvieraťa"
    },
    "hours": {
      "title": "Ordinačné hodiny",
      "closed": "Zatvorené",
      "emergency": "Pohotovosť"
    }
  }
}
```

### 4c. Replace a hardcoded string

Before:
```tsx
<a href="#kontakt">Rezervovať termín</a>
```

After:
```tsx
import { useTranslations } from 'next-intl'

const t = useTranslations('website')
// ...
<a href="#kontakt">{t('cta.book')}</a>
```

### 4d. Locale routing

```
app/
└── [locale]/          ← 'sk' | 'en' | 'hu'
    └── layout.tsx     ← <NextIntlClientProvider locale={locale}>
```

The `TemplateMetadata.name` and `tagline` fields already carry translations
for all 3 locales — use them for the OG image and page `<title>`.

---

## 5. Registering a New Template in the Selector

1. Add a new entry to `TEMPLATES` in `lib/templates/metadata.ts`:

```ts
{
  id: 'template-6',
  slug: 'nature-wellness',
  name: { sk: 'Príroda & Wellness', en: 'Nature & Wellness', hu: 'Természet és Wellness' },
  // ... fill all required fields
}
```

2. Create `app/template-6/page.tsx` following the same structure as the
   existing templates.

3. The index page at `app/page.tsx` reads `TEMPLATES` to render selector cards
   — it will automatically pick up the new entry. No manual update needed.

4. Generate an OG image by visiting `/og?template=template-6` and saving the
   PNG to `public/og/template-6.png` (used as the fallback `previewImage`).

---

## 6. Pre-Launch Checklist

### Schema.org LocalBusiness

Each template already has a commented-out `<script type="application/ld+json">`
block at the bottom. Uncomment it and fill in real values:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VeterinaryCare',
      name: content.clinicName,
      url: `https://${domain}`,
      telephone: content.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: content.address,
      },
      openingHours: [
        'Mo-Tu 08:00-18:00',
        'We 08:00-16:00',
        'Th 08:00-18:00',
        'Fr 08:00-16:00',
        'Sa 09:00-13:00',
      ],
    }),
  }}
/>
```

### Favicon

Replace the default Next.js favicon:
```
public/
├── favicon.ico          ← 32×32 ICO
├── icon.png             ← 512×512 PNG (PWA)
└── apple-touch-icon.png ← 180×180 PNG
```

In `app/layout.tsx`:
```ts
export const metadata: Metadata = {
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
}
```

### OG Image

Wire the dynamic OG route into `layout.tsx` metadata:

```ts
export async function generateMetadata({ params }) {
  const { slug } = await params
  const tmpl = getTemplateBySlug(slug)
  return {
    openGraph: {
      images: [`/og?template=${tmpl?.id}&lang=sk`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og?template=${tmpl?.id}&lang=sk`],
    },
  }
}
```

### robots.txt

Create `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://yourdomain.sk/sitemap.xml
```

Block the `/og` route from indexing if you prefer:
```
Disallow: /og
```

### Sitemap

Use `app/sitemap.ts` (Next.js built-in):
```ts
import { MetadataRoute } from 'next'
import { TEMPLATES } from '@/lib/templates/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  return TEMPLATES.map(t => ({
    url: `https://yourdomain.sk/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
}
```

### Security Headers

Add to `next.config.mjs`:
```js
headers: async () => [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
    ],
  },
],
```

### Final checks
- [ ] All `content.*` fields populated from DB (no hardcoded clinic name)
- [ ] `t()` calls cover all user-visible strings
- [ ] Schema.org block uncommented and filled
- [ ] OG image renders correctly at `/og?template=template-X`
- [ ] `robots.txt` and `sitemap.ts` in place
- [ ] Favicon replaced
- [ ] `NEXT_PUBLIC_DOMAIN` env var set in Vercel project settings
- [ ] Run `pnpm exec tsc --noEmit` — zero errors
- [ ] Run Lighthouse on each template URL — aim LCP < 2.5s, CLS < 0.1
