import {
  OpeningHoursTable,
  ContactBlock,
  FearFreeBadge,
  BookingCTA,
  TestimonialCard,
  ServiceCard,
} from '@/components/openvpm'
import {
  Stethoscope,
  Heart,
  Pill,
  Microscope,
  Monitor,
  Activity,
} from 'lucide-react'
import Link from 'next/link'

const HOURS = [
  { day: 'Pondelok', open: '8:00', close: '18:00' },
  { day: 'Utorok', open: '8:00', close: '18:00' },
  { day: 'Streda', open: '8:00', close: '16:00' },
  { day: 'Štvrtok', open: '8:00', close: '18:00' },
  { day: 'Piatok', open: '8:00', close: '16:00' },
  { day: 'Sobota', open: '9:00', close: '13:00' },
  { day: 'Nedeľa', open: '', close: '', closed: true },
]

export default function OpenVPMDemoPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">

      {/* Header */}
      <header className="bg-[#1B2A4A] text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">OpenVPM Component Library</h1>
            <p className="text-white/50 text-sm">Zdieľané komponenty pre veterinárne weby</p>
          </div>
          <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
            ← Späť na výber šablón
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ── 1. OpeningHoursTable ─────────────────────────────── */}
        <section aria-labelledby="hours-heading">
          <ComponentHeader
            number="01"
            title="OpeningHoursTable"
            usage={`import { OpeningHoursTable } from '@/components/openvpm'\n\n<OpeningHoursTable hours={hours} accentColor="#7BA68C" />`}
          />
          <div className="grid md:grid-cols-3 gap-6">
            <DemoCard label="Navy accent (T1)">
              <OpeningHoursTable hours={HOURS} accentColor="#1B2A4A" />
            </DemoCard>
            <DemoCard label="Terracotta accent (T2)">
              <OpeningHoursTable hours={HOURS} accentColor="#C4704B" />
            </DemoCard>
            <DemoCard label="Blue accent (T3)">
              <OpeningHoursTable hours={HOURS} accentColor="#2563EB" />
            </DemoCard>
          </div>
        </section>

        {/* ── 2. ContactBlock ──────────────────────────────────── */}
        <section aria-labelledby="contact-heading">
          <ComponentHeader
            number="02"
            title="ContactBlock"
            usage={`import { ContactBlock } from '@/components/openvpm'\n\n<ContactBlock address="Hlavná 42, Bratislava" phone="+421 900 000 000"\n  email="info@vetklinika.sk" googleMapsUrl="https://maps.google.com"\n  accentColor="#7BA68C" />`}
          />
          <div className="grid md:grid-cols-3 gap-6">
            <DemoCard label="Sage (T1)">
              <ContactBlock address="Hlavná 42, 811 01 Bratislava" phone="+421 900 000 000" email="info@vetklinika.sk" googleMapsUrl="https://maps.google.com" accentColor="#7BA68C" />
            </DemoCard>
            <DemoCard label="Terracotta (T2)">
              <ContactBlock address="Hlavná 42, 811 01 Bratislava" phone="+421 900 000 000" email="info@srdieckoklinika.sk" accentColor="#C4704B" />
            </DemoCard>
            <DemoCard label="Red (T5)">
              <ContactBlock address="Lekárska 8, 811 04 Bratislava" phone="+421 900 000 000" email="pohotovost@vetpohotovost.sk" googleMapsUrl="https://maps.google.com" accentColor="#DC2626" />
            </DemoCard>
          </div>
        </section>

        {/* ── 3. FearFreeBadge ────────────────────────────────── */}
        <section aria-labelledby="badge-heading">
          <ComponentHeader
            number="03"
            title="FearFreeBadge"
            usage={`import { FearFreeBadge } from '@/components/openvpm'\n\n<FearFreeBadge variant="minimal" />\n<FearFreeBadge variant="full" />\n<FearFreeBadge variant="playful" />`}
          />
          <div className="grid md:grid-cols-3 gap-6">
            <DemoCard label="minimal — T1, T3">
              <div className="flex items-center justify-center py-6">
                <FearFreeBadge variant="minimal" />
              </div>
            </DemoCard>
            <DemoCard label="full — T2">
              <div className="flex items-center justify-center py-4">
                <FearFreeBadge variant="full" />
              </div>
            </DemoCard>
            <DemoCard label="playful — T4">
              <div className="flex items-center justify-center py-6">
                <FearFreeBadge variant="playful" />
              </div>
            </DemoCard>
          </div>
        </section>

        {/* ── 4. BookingCTA ────────────────────────────────────── */}
        <section aria-labelledby="cta-heading">
          <ComponentHeader
            number="04"
            title="BookingCTA"
            usage={`import { BookingCTA } from '@/components/openvpm'\n\n<BookingCTA phone="+421 900 000 000" onlineBookingUrl="/booking"\n  variant="navy" headline="Potrebujete termín?" />`}
          />
          <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200">
            {(['navy', 'terracotta', 'blue', 'coral', 'red'] as const).map(v => (
              <div key={v} className="overflow-hidden">
                <p className="text-xs font-mono text-[#1E293B]/40 px-4 pt-3 pb-1">variant=&quot;{v}&quot;</p>
                <BookingCTA
                  phone="+421 900 000 000"
                  onlineBookingUrl="#"
                  variant={v}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. TestimonialCard ───────────────────────────────── */}
        <section aria-labelledby="testimonial-heading">
          <ComponentHeader
            number="05"
            title="TestimonialCard"
            usage={`import { TestimonialCard } from '@/components/openvpm'\n\n<TestimonialCard text="Úžasná starostlivosť!"\n  author="Mária K." stars={5} source="google"\n  accentColor="#7BA68C" />`}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <TestimonialCard text="Úžasná starostlivosť! Doktor bol veľmi trpezlivý s mojím nervóznym psíkom." author="Mária K." stars={5} source="google" accentColor="#7BA68C" />
            <TestimonialCard text="Najlepšia klinika v meste. Rýchla diagnostika a profesionálny prístup." author="Ján P." stars={5} source="facebook" accentColor="#C4704B" background="#FFF8F0" />
            <TestimonialCard text="Veľmi profesionálny tím. Diagnóza bola rýchla a presná, liečba zabrala hneď." author="Martin K." stars={5} source="google" accentColor="#2563EB" />
            <TestimonialCard text="Rex sa konečne nebál ísť k vetovi! Tím je fantastický a celý zákrok prebehol bez slzičiek." author="Zuzka" stars={5} accentColor="#FF6B6B" background="#FFFDF7" />
          </div>
        </section>

        {/* ── 6. ServiceCard ───────────────────────────────────── */}
        <section aria-labelledby="servicecard-heading">
          <ComponentHeader
            number="06"
            title="ServiceCard"
            usage={`import { ServiceCard } from '@/components/openvpm'\nimport { Stethoscope } from 'lucide-react'\n\n<ServiceCard icon={Stethoscope} title="Preventívna prehliadka"\n  description="Komplexné vyšetrenie zdravotného stavu"\n  price="35 €" variant="minimal" accentColor="#7BA68C" />`}
          />

          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-mono text-[#1E293B]/40 mb-3">variant=&quot;minimal&quot; — T1, T3</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: Stethoscope, title: 'Preventívna prehliadka', description: 'Komplexné vyšetrenie zdravotného stavu', price: '35 €' },
                  { icon: Heart, title: 'Kardiológia', description: 'Starostlivosť o srdce vášho miláčika', price: '50 €' },
                  { icon: Pill, title: 'Farmakoterapia', description: 'Odborné predpisovanie liekov', price: '20 €' },
                  { icon: Microscope, title: 'Laboratórium', description: 'Výsledky do 15 minút priamo u nás', price: '25 €' },
                ].map(s => (
                  <ServiceCard key={s.title} {...s} variant="minimal" accentColor="#7BA68C" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-[#1E293B]/40 mb-3">variant=&quot;detailed&quot; — T2</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: Stethoscope, title: 'Preventívna prehliadka', description: 'Ročná kontrola zdravotného stavu vrátane odporúčaní', price: '35 €' },
                  { icon: Heart, title: 'Chirurgia', description: 'Plánované aj akútne zákroky v plne vybavenej sále', price: '80 €' },
                  { icon: Activity, title: 'Dentálna hygiena', description: 'Čistenie a extrakcia zubov pod anestéziou', price: '45 €' },
                  { icon: Microscope, title: 'Laboratórium', description: 'Krvný obraz, biochémia, moč, cytológia', price: '25 €' },
                ].map(s => (
                  <ServiceCard key={s.title} {...s} variant="detailed" accentColor="#C4704B" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-[#1E293B]/40 mb-3">variant=&quot;playful&quot; — T4</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { icon: Stethoscope, title: 'Preventívka', description: 'Ročná prehliadka + vakcíny', price: '35 €', cardBackground: '#FF6B6B', cardTextColor: '#fff' },
                  { icon: Heart, title: 'Zúbky', description: 'Čistenie a extrakcia', price: '45 €', cardBackground: '#4ECDC4', cardTextColor: '#fff' },
                  { icon: Monitor, title: 'RTG & USG', description: 'Digitálna diagnostika', price: '40 €', cardBackground: '#E8D5F5', cardTextColor: '#2D3436' },
                ].map(s => (
                  <ServiceCard key={s.title} {...s} variant="playful" />
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1B2A4A] text-white/40 text-xs text-center py-6">
        OpenVPM Component Library — {new Date().getFullYear()}
      </footer>
    </div>
  )
}

/* ── Internal helpers ─────────────────────────────────────────────── */

function ComponentHeader({ number, title, usage }: { number: string; title: string; usage: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xs font-mono font-bold text-[#1E293B]/30">{number}</span>
        <h2 className="text-2xl font-bold text-[#1E293B]">{title}</h2>
      </div>
      <pre className="mt-3 bg-[#1E293B] text-[#A5F3FC] text-xs rounded-xl px-5 py-4 overflow-x-auto leading-relaxed">
        {usage}
      </pre>
    </div>
  )
}

function DemoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-xs font-mono text-[#1E293B]/50">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
