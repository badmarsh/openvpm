import Link from 'next/link'
import { ArrowRight, Stethoscope, Heart, Activity, Sparkles, AlertTriangle } from 'lucide-react'

const templates = [
  {
    id: 1,
    slug: 'template-1',
    name: 'Čistá & Moderná',
    name_en: 'Clean & Modern',
    tagline: 'Prémiový, minimalistický dizajn pre mestských profesionálov.',
    palette: ['#1B2A4A', '#7BA68C', '#F5F5F0'],
    icon: Stethoscope,
    accent: '#7BA68C',
    bg: '#F5F5F0',
    text: '#1B2A4A',
    cta: 'Rezervovať online',
    badge: 'Prémium',
  },
  {
    id: 2,
    slug: 'template-2',
    name: 'Vrúcna & Dôveryhodná',
    name_en: 'Warm & Trusting',
    tagline: 'Rodinne orientovaná klinika s teplou farebnosťou a akordeónmi.',
    palette: ['#3D6B4F', '#C4704B', '#FFF8F0'],
    icon: Heart,
    accent: '#C4704B',
    bg: '#FFF8F0',
    text: '#3D6B4F',
    cta: 'Zavolajte nám',
    badge: 'Rodina',
  },
  {
    id: 3,
    slug: 'template-3',
    name: 'Klinická & Profesionálna',
    name_en: 'Clinical & Professional',
    tagline: 'Medicínska autorita s cenníkom, štatistikami a profilmi lekárov.',
    palette: ['#0F172A', '#2563EB', '#F1F5F9'],
    icon: Activity,
    accent: '#2563EB',
    bg: '#F1F5F9',
    text: '#0F172A',
    cta: 'Zobraziť ceny',
    badge: 'Dáta',
  },
  {
    id: 4,
    slug: 'template-4',
    name: 'Hravá & Priateľská',
    name_en: 'Playful & Friendly',
    tagline: 'Farebná, energická stránka s vlnami a animáciami pre mladé publikum.',
    palette: ['#2D3436', '#FF6B6B', '#4ECDC4'],
    icon: Sparkles,
    accent: '#FF6B6B',
    bg: '#FFFDF7',
    text: '#2D3436',
    cta: 'Navštívte nás',
    badge: 'Sociálne',
  },
  {
    id: 5,
    slug: 'template-5',
    name: 'Pohotovosť na prvom mieste',
    name_en: 'Emergency First',
    tagline: 'Urgentná starostlivosť s výrazným 24/7 bannerom a sprievodcom príchodu.',
    palette: ['#1E293B', '#DC2626', '#3B82F6'],
    icon: AlertTriangle,
    accent: '#DC2626',
    bg: '#F8FAFC',
    text: '#1E293B',
    cta: 'Volať TERAZ',
    badge: '24/7',
  },
]

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-sans">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7BA68C] flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">OpenVPM</span>
            <span className="text-xs font-semibold bg-white/10 text-white/60 px-2 py-0.5 rounded-full">Šablóny veterinárnych kliník</span>
          </div>
          <span className="text-xs text-white/40">5 šablón · Slovak · Fear-Free</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#7BA68C] mb-4">Kolekcia šablón</p>
        <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-balance mb-5">
          Veterinárne kliniky —<br />
          <span className="text-white/40">vyberte si dizajn</span>
        </h1>
        <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
          Päť pripravených šablón pre rôzne typy kliník. Každá šablóna je plne responzívna a obsahuje slovenské texty.
        </p>
      </section>

      {/* Template Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          {templates.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#111827' }}
              >
                {/* Preview panel */}
                <div
                  className="relative h-52 flex flex-col items-center justify-center gap-4 overflow-hidden"
                  style={{ backgroundColor: t.bg }}
                >
                  {/* Fake nav bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-9 flex items-center px-4 gap-2"
                    style={{ backgroundColor: t.text, opacity: 0.95 }}
                  >
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accent }}>
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="h-2 w-16 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    <div className="ml-auto flex gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-1.5 w-10 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                      ))}
                      <div className="h-5 w-14 rounded-full" style={{ backgroundColor: t.accent }} />
                    </div>
                  </div>

                  {/* Fake hero content */}
                  <div className="mt-6 text-center px-8">
                    <div className="h-3 w-40 rounded-full mx-auto mb-2" style={{ backgroundColor: t.text, opacity: 0.15 }} />
                    <div className="h-5 w-52 rounded-full mx-auto mb-1" style={{ backgroundColor: t.text, opacity: 0.35 }} />
                    <div className="h-5 w-44 rounded-full mx-auto mb-4" style={{ backgroundColor: t.text, opacity: 0.35 }} />
                    <div className="h-2 w-64 rounded-full mx-auto mb-1" style={{ backgroundColor: t.text, opacity: 0.12 }} />
                    <div className="h-2 w-56 rounded-full mx-auto mb-5" style={{ backgroundColor: t.text, opacity: 0.12 }} />
                    <div className="flex gap-2 justify-center">
                      <div className="h-7 w-28 rounded-full" style={{ backgroundColor: t.text }} />
                      <div className="h-7 w-24 rounded-full border-2" style={{ borderColor: t.accent }} />
                    </div>
                  </div>

                  {/* Color dots */}
                  <div className="absolute bottom-3 left-4 flex gap-1.5">
                    {t.palette.map(c => (
                      <div key={c} className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>

                  {/* Badge */}
                  <div
                    className="absolute top-11 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: t.accent }}
                  >
                    {t.badge}
                  </div>
                </div>

                {/* Info panel */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Šablóna {t.id}</p>
                      <h2 className="font-bold text-white text-lg leading-tight">{t.name}</h2>
                      <p className="text-xs text-white/35 mt-0.5">{t.name_en}</p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1"
                      style={{ backgroundColor: t.accent + '22' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: t.accent }} />
                    </div>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed mb-5">{t.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: t.accent + '22', color: t.accent }}
                    >
                      CTA: {t.cta}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors">
                      Zobraziť
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* OpenVPM component library CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <Link
          href="/openvpm"
          className="group flex items-center justify-between gap-6 rounded-2xl border border-[#7BA68C]/30 bg-[#7BA68C]/8 hover:bg-[#7BA68C]/14 transition-colors px-7 py-5"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7BA68C] mb-1">Knižnica komponentov</p>
            <h2 className="font-bold text-white text-lg">OpenVPM Component Library</h2>
            <p className="text-sm text-white/50 mt-1">
              6 zdieľaných komponentov: OpeningHoursTable, ContactBlock, FearFreeBadge, BookingCTA, TestimonialCard, ServiceCard
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#7BA68C] shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <span>OpenVPM — Veterinárne šablóny · 2025</span>
          <span>Všetky texty sú vzorové a určené na nahradenie.</span>
        </div>
      </footer>
    </div>
  )
}
