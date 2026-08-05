# OpenVPM — Website Template Prompts for v0.dev

**Companion file:** `WEBSITE_MODULE_MEGAPROMPT.md` — the implementation
megaprompt for the Website Builder module.

**Usage:** Copy each template prompt into [v0.dev](https://v0.dev) to
generate the visual design. The generated code should then be adapted
to work as a template component within the OpenVPM website builder
(Phase 6 of the megaprompt).

**Tech stack context for all templates:**
- Next.js 14+ App Router
- Tailwind CSS
- shadcn/ui components (Button, Card, Badge, Input, Textarea)
- lucide-react icons
- Responsive (mobile-first)
- Slovak/English bilingual content support

---

## Template 1: Clean & Modern

**Prompt for v0.dev:**

```
Create a clean, modern veterinary clinic website with a minimalist
design aesthetic. The site should feel premium, trustworthy, and
conversion-focused.

DESIGN LANGUAGE:
- Color palette: White (#FFFFFF) background, deep navy (#1B2A4A) for
  headings, soft sage green (#7BA68C) as accent, warm gray (#F5F5F0)
  for section backgrounds
- Typography: Large, confident headings with generous letter-spacing.
  Body text in a clean sans-serif (Inter or similar). Lots of whitespace.
- Layout: Single-column hero, alternating left/right content sections,
  generous padding (py-24 between sections)
- Border radius: Subtle (rounded-xl for cards, rounded-full for buttons)
- Shadows: Very subtle, only on hover states

SECTIONS (in order):
1. HERO: Full-width, split layout — left side has large heading
   "Starostlivosť, ktorej môžete dôverovať" (Care you can trust),
   subheading about the clinic, two buttons: "Rezervovať termín"
   (primary, filled) and "Naše služby" (secondary, outlined).
   Right side has a high-quality photo of a vet with a calm dog.

2. SERVICES: Grid of 4 service cards (3 columns on desktop, 1 on mobile).
   Each card: lucide icon (Stethoscope, Heart, Pill, Microscope),
   title, 1-line description, subtle border. Cards have hover lift effect.

3. ABOUT (split): Left side photo of the clinic interior. Right side:
   heading "O nás" (About us), 2 paragraphs of text, and 3 small stat
   cards: "1000+ spokojných klientov", "15+ rokov skúseností",
   "Fear-Free certifikácia".

4. TESTIMONIALS: 3-column grid of review cards. Each card: 5 stars
   (amber), quote text, client name. Light card background with
   subtle shadow.

5. OPENING HOURS: Two-column layout. Left: "Ordinačné hodiny" heading
   with a clean table (Mon-Fri with times). Right: "Kontakt" with
   address, phone, email, and a "Zavolajte nám" (Call us) button.

6. CTA BANNER: Full-width navy background. White text heading
   "Potrebujete termín?" (Need an appointment?). Two buttons:
   "Rezervovať online" and "Zavolať". Centered.

7. FOOTER: Three columns — clinic info, quick links, social icons.
   Dark background (#1B2A4A), white text. Bottom bar with copyright
   and "Vytvorené s OpenVPM" link.

COMPONENTS TO USE:
- shadcn Button (with variants: default, outline, ghost)
- shadcn Card (for services and testimonials)
- lucide-react icons: Stethoscope, Heart, Pill, Microscope, Phone,
  Mail, MapPin, Clock, Star, ArrowRight, Calendar
- Responsive: mobile menu (hamburger), stacked sections on mobile

ADDITIONAL REQUIREMENTS:
- Sticky header with logo + nav + "Rezervovať" CTA button
- Smooth scroll behavior
- All text in Slovak (primary) with English translations in comments
- "Fear-Free" badge visible near the logo
- Schema.org LocalBusiness markup in a comment block
```

---

## Template 2: Warm & Trusting

**Prompt for v0.dev:**

```
Create a warm, family-oriented veterinary clinic website that builds
trust through emotional connection. The design should feel welcoming,
safe, and community-focused.

DESIGN LANGUAGE:
- Color palette: Warm cream (#FFF8F0) background, terracotta (#C4704B)
  as primary accent, forest green (#3D6B4F) for headings, soft peach
  (#FFE4D6) for section backgrounds, warm brown (#8B6F47) for body text
- Typography: Rounded, friendly headings (DM Sans or Nunito). Body text
  in a readable serif or soft sans-serif.
- Layout: Organic shapes (rounded-3xl cards, curved section dividers),
  overlapping elements, photo-heavy
- Shadows: Warm, soft shadows (shadow-lg with warm tint)
- Imagery style: Warm, candid photos of pets and families

SECTIONS (in order):
1. HERO: Full-width image overlay with centered text. Large rounded
   heading "Vaši miláčikovia sú u nás ako doma" (Your pets feel at
   home here). Subheading emphasizing personal care. Single large
   "Rezervovať termín" button. Decorative paw-print SVG elements.

2. "WHY US" FEATURE STRIP: 4 icons in a row (not cards) —
   Heart (Láskavý prístup / Gentle approach),
   Shield (Bezpečná starostlivosť / Safe care),
   Award (Certifikovaný tím / Certified team),
   Clock (Flexibilné hodiny / Flexible hours).
   Each with icon + short label + 1-line description below.

3. TESTIMONIALS (carousel-style): Horizontal scroll of 4 testimonial
   cards on warm peach background. Each card has a large quote mark
   SVG, the review text, 5 gold stars, client name, and a small
   circular avatar placeholder. "Čo hovoria naši klienti" heading
   above.

4. TEAM SECTION: 3 team member cards with circular photos, names,
   roles (MVDr., Sestra, Recepcia), and 1-line bio. Centered grid.
   Heading: "Spoznajte náš tím" (Meet our team).

5. GALLERY: Masonry-style grid of 6 photos (clinic interior, waiting
   room, exam room, happy pets). Light overlay with "Nahliadnite k nám"
   (Take a look inside) heading.

6. SERVICES (accordion-style): Expandable service list with icons.
   Each row shows service name + short description, clicking expands
   to show full description + price range. 6 services: Preventívna
   prehliadka, Vakcinácia, Chirurgia, Dentálna hygiena, Laboratórna
   diagnostika, Pohotovosť.

7. FAQ SECTION: "Často kladené otázky" — 5 expandable FAQ items.
   Clean accordion with + / - toggle icons.

8. CTA: Warm cream background, large heading "Ste pripravení
   navštíviť nás?" with "Rezervovať termín" button and phone number.

9. FOOTER: Warm brown background. Three columns. Social media icons
   with warm hover effects. "Sledujte nás" heading for social section.

COMPONENTS TO USE:
- shadcn Button (warm variants — terracotta primary, cream outline)
- shadcn Card with rounded-3xl
- shadcn Accordion (for FAQ and services)
- lucide-react icons: Heart, Shield, Award, Clock, Star, Phone,
  Mail, MapPin, PawPrint, ChevronDown, User
- Decorative SVG paw prints as background elements

ADDITIONAL REQUIREMENTS:
- Sticky header with rounded logo + nav + warm CTA button
- Paw-print decorative elements scattered subtly throughout
- All text in Slovak with English translations in comments
- "Fear-Free Certified" badge in footer
- Warm, inviting hover states on all interactive elements
```

---

## Template 3: Clinical & Professional

**Prompt for v0.dev:**

```
Create a clinical, data-driven veterinary clinic website that
projects authority, expertise, and professionalism. The design should
feel like a modern medical practice — precise, clean, and evidence-based.

DESIGN LANGUAGE:
- Color palette: Pure white (#FFFFFF) background, clinical blue
  (#2563EB) as primary, dark slate (#0F172A) for headings, light
  blue-gray (#F1F5F9) for alternating sections, green (#10B981) for
  success/trust indicators
- Typography: Sharp, structured headings (Inter or Manrope). Body text
  in clean sans-serif with precise line heights.
- Layout: Structured grid, consistent spacing, data visualization
  elements (stats, badges, progress indicators)
- Border radius: Minimal (rounded-lg), straight lines, geometric
- Shadows: Clean, technical shadows
- Design reference: Modern hospital/medical practice websites

SECTIONS (in order):
1. HERO: Two-column layout. Left: "Profesionálna veterinárna
   medicína na najvyššej úrovni" heading with structured bullet points
   (✓ Fear-Free certifikácia, ✓ Digitálna diagnostika, ✓ AI-assistovaný
   zápis). Right: professional photo of vet in exam room. Trust badges
   below: "KVL SR", "Fear-Free Certified", "ISO 9001".

2. STATS BAR: Horizontal strip with 4 key metrics on blue background:
   "2500+" (vyšetrení ročne), "98%" (spokojnosť klientov), "15" (rokov
   praxe), "3" (veterinári v tíme). Large numbers, small labels.

3. SERVICES (detailed): 2-column grid of 6 service cards. Each card:
   icon, title, 3-line description, "Cena od: XX €" price indicator,
   "Viac info" link. Services: Preventívna medicína, Chirurgické zákroky,
   Dentálna starostlivosť, Laboratórna diagnostika, Zobrazovacia
   diagnostika (RTG/USG), Dermatológia.

4. TECHNOLOGY & EQUIPMENT: Split section. Left: heading
   "Moderné vybavenie" with 4 equipment badges (Digital X-Ray,
   Ultrasound, Dental Unit, In-house Lab). Right: equipment photo.

5. DOCTORS: Horizontal team cards with professional headshots,
   specializations, and credentials. Each card: photo, name, title
   (MVDr.), specialization badges, years of experience.

6. INSURANCE PARTNERS: Row of partner logos (Allianz, Generali,
   Union) on light gray background. "Spolupracujeme s poisťovňami"
   heading.

7. PRICING TABLE: Clean pricing comparison for 3 tiers:
   Základné vyšetrenie (35€), Komplexná prehliadka (65€),
   Wellness balík (15€/mesiac). Feature comparison with checkmarks.

8. REVIEWS: Trust indicator section. Overall rating (4.9★ with 180+
   reviews), Google review badge, 3 featured review cards with source
   badges.

9. CONTACT & MAP: Two columns. Left: structured contact info with
   icons (address, phone, email, hours table). Right: Google Maps
   embed placeholder.

10. CTA: Blue gradient background. "Objednajte sa ešte dnes" with
    two buttons and phone number.

11. FOOTER: Dark slate background. Four columns (About, Services,
    Resources, Contact). Accreditation badges in footer.

COMPONENTS TO USE:
- shadcn Button (blue primary, outline secondary)
- shadcn Card (clean, minimal shadow)
- shadcn Badge (for certifications, specializations)
- shadcn Table (for pricing comparison)
- lucide-react icons: Stethoscope, Heart, Pill, Microscope, Monitor,
  Activity, ShieldCheck, Star, Phone, Mail, MapPin, Clock, Calendar,
  ChevronRight, CheckCircle
- Progress/percentage indicators for stats

ADDITIONAL REQUIREMENTS:
- Sticky header with logo + structured nav + blue "Rezervovať" CTA
- Breadcrumb-style section navigation
- All text in Slovak with English translations in comments
- Accessibility: ARIA labels, keyboard navigation, high contrast
- Schema.org MedicalOrganization markup in comments
- Print-friendly stylesheet for pricing pages
```

---

## Template 4: Playful & Friendly (Playful Paws)

**Prompt for v0.dev:**

```
Create a playful, colorful veterinary clinic website with a fun,
pet-friendly aesthetic. The design should feel energetic, approachable,
and community-focused — appealing to young pet owners and families.

DESIGN LANGUAGE:
- Color palette: Bright and cheerful — primary coral (#FF6B6B),
  teal (#4ECDC4), sunshine yellow (#FFE66D), soft lavender (#E8D5F5),
  cream white (#FFFDF7) background, dark charcoal (#2D3436) for text
- Typography: Bouncy, rounded headings (Fredoka or Baloo 2). Body
  text in friendly sans-serif (Nunito). Playful font sizes.
- Layout: Asymmetric, overlapping elements, wavy section dividers
  (SVG waves between sections), playful card tilts
- Border radius: Very rounded (rounded-3xl, rounded-full)
- Shadows: Colorful, playful shadows (shadow-lg with colored tints)
- Decorative elements: Paw prints, bone shapes, fish, hearts scattered
  as subtle background patterns

SECTIONS (in order):
1. HERO: Full-width with illustrated background (SVG paws, bones,
  hearts pattern). Large playful heading "Ahoj! Sme tu pre tvojho
  miláčika 🐾" (Hi! We're here for your pet). Bouncy subheading.
  Two round buttons: "Rezervovať termín 🗓️" (coral) and
  "Pozrite si naše služby ✨" (teal outline). Animated paw-print
  cursor trail (CSS only, no JS needed for v0).

2. "ČO ROBÍME" SERVICES: Colorful card grid (3 columns). Each card
  has a unique pastel background:
  - 🩺 Preventívka (coral bg) — "Ročná prehliadka + vakcíny"
  - 🦷 Zúbky (teal bg) — "Čistenie a extrakcia"
  - 💉 Očkovanie (yellow bg) — "Kompletný vakcinačný plán"
  - 🔬 Laboratórium (lavender bg) — "Krvný obraz za 15 minút"
  - 📸 RTG & USG (mint bg) — "Digitálna diagnostika"
  - 🚑 Pohotovosť (pink bg) — "Sme tu aj v núdzi"
  Each card has an emoji icon, title, 1-line description.

3. "SPLNENÝ SEN" ABOUT: Illustrated section with a hand-drawn style
  clinic illustration on the left. Right side: "Naša klinika je
  splnený sen" heading, 2 paragraphs of warm text, and 4 fun fact
  badges: "🐕 500+ psov ročne", "🐱 300+ mačiek ročne",
  "🐰 Aj exotické zvieratá!", "☕ Káva zadarmo!".

4. HAPPY PETS GALLERY: Masonry grid of 8 cute pet photos with
  playful hover effects (slight rotation + scale). "Naši pacienti
  sa usmievajú 😊" heading.

5. REVIEWS: Carousel of 4 colorful review cards on lavender background.
  Each card: large emoji rating (🌟🌟🌟🌟🌟), review text in speech
  bubble, client name with pet emoji. "Čo hovoria naši kamoši" heading.

6. TEAM: Fun team cards with illustrated avatars (or photos with
  colorful circular borders). Each card: photo, name, fun title
  ("Hlavný veterinár a milovník psov"), and a "fun fact" line
  ("Má 3 mačky a 1 psa"). 3 team members.

7. PRICING (friendly): 3 playful pricing cards with emoji headers:
  "🐾 Šteniatko" (15€/mes), "🐾 Dospelý" (20€/mes),
  "🐾 Senior" (25€/mes). Each with feature list using paw-print
  bullets. Middle card slightly larger (highlighted).

8. FAQ: Fun accordion with emoji questions. "Máte otázky? 🤔"
  heading. 5 FAQ items with playful toggle icons.

9. CTA: Full-width coral gradient with wavy top edge. "Poďte k nám!
  🎉" heading. Large round "Rezervovať termín" button. Phone number
  with phone emoji.

10. FOOTER: Dark charcoal with colorful accents. Three columns.
    Social media with colorful hover states. "Vytvorené s ❤️ a OpenVPM"
    credit. Decorative paw-print border at top.

COMPONENTS TO USE:
- shadcn Button (round, colorful — coral primary, teal secondary)
- shadcn Card (rounded-3xl, colorful borders)
- shadcn Accordion (for FAQ)
- shadcn Badge (for fun facts)
- lucide-react icons: PawPrint, Heart, Stethoscope, Star, Phone,
  Mail, MapPin, Calendar, Sparkles
- SVG wave dividers between sections
- Emoji as decorative elements (not just in text)

ADDITIONAL REQUIREMENTS:
- Sticky header with playful logo (paw in circle) + nav + colorful CTA
- Smooth scroll with bouncy easing
- Wavy SVG section dividers (create inline SVGs)
- All text in Slovak with English translations in comments
- Fun hover animations (slight rotation, bounce, scale)
- Mobile: Stacked cards, larger touch targets, simplified nav
- "Fear-Free" badge styled playfully (not corporate)
```

---

## Template 5: Emergency First

**Prompt for v0.dev:**

```
Create an emergency-focused veterinary clinic website where urgent
care information is immediately accessible. The design should feel
urgent but calm, professional but reassuring — built for pet owners
who need help NOW.

DESIGN LANGUAGE:
- Color palette: Emergency red (#DC2626) for urgent CTAs, dark navy
  (#1E293B) background for hero and emergency sections, white (#FFFFFF)
  for content areas, calm blue (#3B82F6) for trust elements, warm
  amber (#F59E0B) for warnings, soft gray (#F8FAFC) for sections
- Typography: Bold, high-contrast headings (Inter Black or Montserrat
  Black). Body in clean sans-serif. Large phone numbers, prominent
  times.
- Layout: Emergency info ABOVE the fold, content sections below,
  sticky emergency banner
- Border radius: Medium (rounded-xl)
- Shadows: Strong, attention-grabbing shadows on emergency elements

SECTIONS (in order):
1. EMERGENCY BANNER (sticky top): Red background, white text.
   "🚨 POHOTOVOSŤ: +421 XXX XXX XXX" — phone number is large,
   tappable, always visible. "Otvorené 24/7" badge. This banner
   stays at the top of every scroll position.

2. HERO: Dark navy background. Split layout. Left: "Veterinárna
   pohotovosť — sme tu, keď to najviac potrebujete" heading (white,
   large). Subtext about 24/7 availability. Two prominent buttons:
   "🚨 Volať pohotovosť" (red, large, pulsing animation) and
   "Rezervovať bežný termín" (blue outline, smaller). Right: photo
   of emergency vet team. Trust indicators below: response time
   ("< 15 min"), 24/7 availability badge, GPS directions link.

3. "KEDY OKAMŽITE VOLAŤ" EMERGENCY GUIDE: White background, red
   accent border on left. Grid of 6 emergency scenarios with clear
   "VOLAJTE IHNEĎ" (Call immediately) labels:
   - Ťažké dýchanie (Difficulty breathing) — Airway icon
   - Požitie toxínu (Toxin ingestion) — Warning icon
   - Krvácanie (Bleeding) — Droplet icon
   - Nehoda / Zrazenie (Accident / Hit by car) — Alert icon
   - Záchvaty (Seizures) — Brain icon
   - Pôrodne komplikácie (Birth complications) — Heart icon
   Each card has a red "VOLAJTE: +421 XXX" button.

4. "AKO SA PRIPRAVIŤ" PRE-ARRIVAL GUIDE: Numbered steps with icons:
   1. 📞 Zavolajte nám (Call us) — "Popíšte stav, poradíme čo robiť"
   2. 🚗 Bezpečný transport — "Ako previezť zranené zviera"
   3. 🏥 Príchod ku nám — "Navigácia a parkovanie"
   4. 🩺 Okamžitá starostlivosť — "Začíname do 5 minút"

5. SERVICES: Two-column layout.
   LEFT — "Pohotovostné služby" (Emergency services) on red-tinted
   background: Akutná chirurgia, Intenzívna starostlivosť, Toxikológia,
   Transfúzia, Stabilizácia.
   RIGHT — "Bežné služby" (Regular services) on blue-tinted
   background: Preventívna prehliadka, Vakcinácia, Dentálna hygiena,
   Kastrácia, Laboratórna diagnostika.
   Each service is a clean list item with icon and price range.

6. DOCTORS ON DUTY: "Práve slúžia" (Currently on duty) section with
   2-3 doctor cards showing availability status (green dot = available,
   yellow = busy). Professional photos, names, specializations.

7. LOCATION & DIRECTIONS: Full-width section. Left: Google Maps embed.
   Right: "Ako sa k nám dostanete" with address, GPS coordinates,
   parking instructions, and "Navigovať" (Navigate) button linking to
   Google Maps directions. Opening hours table with emergency hours
   highlighted in red.

8. TESTIMONIALS (emergency-focused): 3 review cards specifically
   about emergency care. "Zachránili nám Fíkuša o 2 v noci" style
   testimonials. Red accent on each card.

9. PRICING (emergency): Clear pricing table for emergency services:
   Pohotovostný príplatok (30€), Akutné vyšetrenie (50€),
   Pohotovostná chirurgia (od 200€), Hospitalizácia/noc (40€).
   "Ceny sú orientačné, presnú kalkuláciu dostanete pred zákrokom" note.

10. CTA: Dual CTA — left side red "🚨 Pohotovosť: +421 XXX" (large),
    right side blue "Bežný termín" with booking button. Dark background.

11. FOOTER: Dark navy. Emergency number prominent in footer. Standard
    3-column layout. "V prípade život ohrozujúceho stavu volajte
    pohotovosť" disclaimer.

COMPONENTS TO USE:
- shadcn Button (red for emergency, blue for regular, with size variants)
- shadcn Card (clean, with colored left borders)
- shadcn Badge (for status indicators, 24/7 badge)
- lucide-react icons: Phone, AlertTriangle, Heart, Shield, MapPin,
  Navigation, Clock, Calendar, ChevronRight, Activity, Siren,
  Cross, Droplets, Brain, Car, Hospital
- Pulsing animation on emergency CTA (CSS @keyframes)
- Sticky emergency banner (position: sticky, top: 0, z-index: 50)

ADDITIONAL REQUIREMENTS:
- Emergency phone number is ALWAYS visible (sticky banner + footer)
- Phone numbers are `tel:` links (tappable on mobile)
- Map/directions link is prominent
- All emergency information is ABOVE the fold
- "24/7" badge visible in header
- All text in Slovak with English translations in comments
- High contrast for readability (WCAG AA minimum)
- Mobile: Emergency banner stays visible, larger touch targets,
  simplified navigation with emergency CTA always showing
- Schema.org EmergencyService markup in comments
- Print-friendly emergency info section
```

---

## Integration Notes

### How to use v0.dev output in OpenVPM

1. **Generate** each template in v0.dev using the prompts above.
2. **Extract** the generated React/Tailwind code.
3. **Adapt** into OpenVPM template components:
   - Replace hardcoded text with `t("website.blocks.xxx")` i18n calls
   - Replace static content with dynamic `content` JSONB props
   - Use OpenVPM's existing UI primitives (`Button`, `Card`, `Badge`)
   - Ensure all icons come from `lucide-react`
4. **Register** in the template system (Phase 6 of the megaprompt).
5. **Test** both SK and EN rendering for each template.

### Common patterns across all templates

Every template MUST include:
- [ ] Sticky header with logo + nav + booking CTA
- [ ] "Rezervovať termín" / "Book an Appointment" CTA in hero
- [ ] Contact section with address, phone, email
- [ ] Opening hours display
- [ ] Footer with practice info and OpenVPM credit
- [ ] Schema.org LocalBusiness JSON-LD
- [ ] Mobile-responsive design (375px / 768px / 1440px)
- [ ] Slovak text with English in comments
- [ ] Fear-Free certification badge (where applicable)
- [ ] Emergency contact information

### Template-specific differentiators

| Template | Target audience | Key emotion | Primary CTA |
|---|---|---|---|
| Clean & Modern | Urban professionals | Trust, premium | Book online |
| Warm & Trusting | Families, long-term clients | Comfort, belonging | Call us |
| Clinical & Professional | Informed, data-driven owners | Confidence, authority | See pricing |
| Playful & Friendly | Young owners, social media | Fun, approachable | Visit us |
| Emergency First | Urgent care seekers | Reassurance, urgency | Call NOW |

### Bilingual considerations

- All templates must support `locale` prop ("sk" | "en" | "hu")
- Hungarian (HU) support is a future extension — structure the i18n
  keys to allow easy addition
- Content blocks store text in the website's configured locale
- Template UI labels (button text, section headings) come from
  the `website` i18n namespace
- Practice-specific content (clinic name, descriptions) comes from
  the seed data locale
