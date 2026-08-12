'use client'

import { useState } from 'react'
import {
  Heart,
  Stethoscope,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react'

/* -----------------------------------------------------------------------
   Template 4: Playful & Friendly (Playful Paws)
   Cieľ: mladí majitelia, sociálne siete | Emócia: zábava, prístupnosť | CTA: Navštívte nás
   Target: young owners, social media | Emotion: fun, approachable | CTA: Visit us
   ----------------------------------------------------------------------- */

function WaveDivider({ fill, bg }: { fill: string; bg: string }) {
  return (
    <div className="w-full overflow-hidden leading-none" style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 block" aria-hidden="true">
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill={fill} />
      </svg>
    </div>
  )
}

function PawPrint({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="5" cy="9" rx="2" ry="2.8" />
      <ellipse cx="10" cy="6.5" rx="2" ry="2.8" />
      <ellipse cx="14.5" cy="6.5" rx="2" ry="2.8" />
      <ellipse cx="19.5" cy="9" rx="2" ry="2.8" />
      <path d="M12 10c-3 0-6.5 2.5-6.5 6 0 2 1.5 4 6.5 4s6.5-2 6.5-4c0-3.5-3.5-6-6.5-6z" />
    </svg>
  )
}

const faqs = [
  { q: 'Ako sa objednám? Je to jednoduche?', a: 'Super jednoduché! Zavolajte, napíšte alebo vyplňte formulár online. Zvyčajne máme miesto do 2 dní.' },
  { q: 'Ošetrujete aj exotické zvieratá?', a: 'Áno! Máme skúsenosti s králikmi, morčatami, hadmi, papagájmi a ďalšími exotmi.' },
  { q: 'Čo je Fear-Free certifikácia?', a: 'Znamená to, že robíme všetko pre to, aby sa vaše zvieratko u nás nestresovalo. Menej stresu = lepšia skúsenosť pre všetkých!' },
  { q: 'Akceptujete platby kartou?', a: 'Áno, platíte kartou, hotovosťou aj prevodom. Faktúru vystavíme na požiadanie.' },
  { q: 'Mám priniesť čokoľvek špeciálne?', a: 'Vakcinačný preukaz a dobrú náladu. Zvyšok nechajte na nás!' },
]

export default function Template4() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#FFFDF7', color: '#2D3436' }}>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .pulse-scale { animation: pulse-scale 2s ease-in-out infinite; }
        .card-hover:hover { transform: rotate(-1deg) scale(1.02); transition: transform 0.2s ease; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFFDF7', borderColor: '#FFE66D' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6B6B' }}>
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: '#2D3436' }}>Šteniatko</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: '#2D3436', opacity: 0.7 }}>
            <a href="#sluzby" className="hover:opacity-100 transition-opacity">Čo robíme</a>
            <a href="#o-nas" className="hover:opacity-100 transition-opacity">O nás</a>
            <a href="#ceny" className="hover:opacity-100 transition-opacity">Ceny</a>
            <a href="#faq" className="hover:opacity-100 transition-opacity">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#kontakt"
              className="hidden md:flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-transform hover:scale-105"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              <Calendar className="w-4 h-4" />
              Rezervovať
            </a>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4 text-sm font-medium" style={{ backgroundColor: '#FFFDF7', borderColor: '#FFE66D' }}>
            <a href="#sluzby" onClick={() => setMobileOpen(false)}>Čo robíme</a>
            <a href="#o-nas" onClick={() => setMobileOpen(false)}>O nás</a>
            <a href="#ceny" onClick={() => setMobileOpen(false)}>Ceny</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: '#FFFDF7' }}>
        {/* Decorative background paw prints */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          {[[8, 10], [20, 65], [75, 8], [88, 55], [50, 90], [35, 40]].map(([x, y], i) => (
            <PawPrint
              key={i}
              className="absolute w-12 h-12 opacity-10"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#E8D5F5'][i % 4],
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full mb-8"
            style={{ backgroundColor: '#E8D5F5', color: '#2D3436' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#FF6B6B' }} />
            {/* Fear-Free Certified clinic */}
            Fear-Free certifikovaná klinika
          </div>
          {/* Hi! We're here for your pet */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-balance mb-5" style={{ color: '#2D3436' }}>
            Ahoj! Sme tu pre<br />
            <span style={{ color: '#FF6B6B' }}>tvojho miláčika</span>
          </h1>
          <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: '#2D3436', opacity: 0.65 }}>
            {/* Fun, caring and fear-free veterinary care that your pet will actually enjoy. We promise! */}
            Zábavná, starostlivá a Fear-Free veterinárna starostlivosť, ktorú si tvoje zvieratko skutočne užije. Sľubujeme!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-full text-lg transition-transform hover:scale-105 pulse-scale"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              <Calendar className="w-5 h-5" />
              Rezervovať termín
            </a>
            <a
              href="#sluzby"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full text-lg border-2 transition-transform hover:scale-105"
              style={{ borderColor: '#4ECDC4', color: '#4ECDC4' }}
            >
              <Sparkles className="w-5 h-5" />
              Pozrite si naše služby
            </a>
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFE66D" bg="#FFFDF7" />

      {/* ── Services ──────────────────────────────────────────────── */}
      <section id="sluzby" className="py-20" style={{ backgroundColor: '#FFE66D' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            {/* What we do */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#2D3436' }}>Čo robíme</h2>
            <p className="mt-2 text-base" style={{ color: '#2D3436', opacity: 0.65 }}>Kompletná starostlivosť na jednom mieste</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: '🩺', title: 'Preventívka', desc: 'Ročná prehliadka + vakcíny', bg: '#FF6B6B', text: '#fff' },
              { emoji: '🦷', title: 'Zúbky', desc: 'Čistenie a extrakcia', bg: '#4ECDC4', text: '#fff' },
              { emoji: '💉', title: 'Očkovanie', desc: 'Kompletný vakcinačný plán', bg: '#FFE66D', text: '#2D3436' },
              { emoji: '🔬', title: 'Laboratórium', desc: 'Krvný obraz za 15 minút', bg: '#E8D5F5', text: '#2D3436' },
              { emoji: '📸', title: 'RTG & USG', desc: 'Digitálna diagnostika', bg: '#4ECDC4', text: '#fff' },
              { emoji: '🚑', title: 'Pohotovosť', desc: 'Sme tu aj v núdzi', bg: '#FF6B6B', text: '#fff' },
            ].map(({ emoji, title, desc, bg, text }) => (
              <div
                key={title}
                className="rounded-3xl p-7 card-hover cursor-default"
                style={{ backgroundColor: bg, color: text }}
              >
                <span className="text-4xl mb-4 block" role="img" aria-label={title}>{emoji}</span>
                <h3 className="font-bold text-xl mb-1">{title}</h3>
                <p className="text-sm opacity-80">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFFDF7" bg="#FFE66D" />

      {/* ── About ─────────────────────────────────────────────────── */}
      <section id="o-nas" className="py-20" style={{ backgroundColor: '#FFFDF7' }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden order-last md:order-first">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80"
              alt="Šťastný pes so svojím majiteľom"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            {/* Our clinic is a dream come true */}
            <h2 className="text-4xl font-bold text-balance mb-5" style={{ color: '#2D3436' }}>
              Naša klinika je<br />
              <span style={{ color: '#FF6B6B' }}>splnený sen</span>
            </h2>
            <p className="text-base leading-relaxed mb-3" style={{ color: '#2D3436', opacity: 0.65 }}>
              {/* We opened our clinic to make veterinary care a positive experience — for animals and their owners. No more stress, no more fear! */}
              Kliniku sme otvorili s cieľom urobiť z veterinárnej starostlivosti pozitívny zážitok — pre zvieratká aj ich majiteľov. Koniec stresu, koniec strachu!
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#2D3436', opacity: 0.65 }}>
              {/* Every member of our team is Fear-Free certified and genuinely loves animals. */}
              Každý člen nášho tímu je Fear-Free certifikovaný a skutočne miluje zvieratá.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '🐕', label: '500+ psov ročne' },
                { emoji: '🐱', label: '300+ mačiek ročne' },
                { emoji: '🐰', label: 'Aj exotické zvieratá!' },
                { emoji: '☕', label: 'Káva zadarmo!' },
              ].map(({ emoji, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-sm"
                  style={{ backgroundColor: '#FFE66D', color: '#2D3436' }}
                >
                  <span className="text-xl" role="img" aria-label="">{emoji}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#E8D5F5" bg="#FFFDF7" />

      {/* ── Reviews ───────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#E8D5F5' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            {/* What our pals say */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#2D3436' }}>Čo hovoria naši kamoši</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { stars: '🌟🌟🌟🌟🌟', text: 'Rex sa konečne nebál ísť k vetovi! Tím je fantastický a celý zákrok prebehol bez slzičiek.', name: 'Zuzka', pet: '🐕' },
              { stars: '🌟🌟🌟🌟🌟', text: 'Moja mačka Mia si tam dokonca chrupkala. Neverila som vlastným očiam. 10/10!', name: 'Nina', pet: '🐱' },
              { stars: '🌟🌟🌟🌟🌟', text: 'Prišli sme s králikom a odišli spokojní. Vedia o exotoch naozaj veľa!', name: 'Michal', pet: '🐰' },
              { stars: '🌟🌟🌟🌟🌟', text: 'Rýchle objednanie, priateľský personál a lacnejšie ako som čakala. Super!', name: 'Lucia', pet: '🐕' },
            ].map(({ stars, text, name, pet }) => (
              <div key={name} className="rounded-3xl p-6 relative" style={{ backgroundColor: '#FFFDF7' }}>
                <div className="text-xl mb-3" role="img" aria-label="5 hviezd">{stars}</div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#2D3436', opacity: 0.7 }}>
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label="zviera">{pet}</span>
                  <span className="font-bold text-sm" style={{ color: '#FF6B6B' }}>{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFFDF7" bg="#E8D5F5" />

      {/* ── Team ──────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#FFFDF7' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            {/* Meet the crew */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#2D3436' }}>Náš skvelý tím</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { name: 'MVDr. Jana K.', role: 'Hlavná veterinárka a milovníčka psov', fun: 'Má 3 mačky a 1 psa', border: '#FF6B6B', seed: 'jana' },
              { name: 'Bc. Petra H.', role: 'Veterinárna sestra a papagájí nadšenec', fun: 'Cvičí s papagájom agility', border: '#4ECDC4', seed: 'petra' },
              { name: 'Lucia T.', role: 'Recepčná a expert na objatia', fun: 'Každý deň prinesie sušienky', border: '#FFE66D', seed: 'lucia' },
            ].map(({ name, role, fun, border, seed }) => (
              <div key={name} className="text-center">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`}
                  alt={name}
                  className="w-28 h-28 rounded-full mx-auto mb-4 border-4 object-cover"
                  style={{ borderColor: border, backgroundColor: '#FFFDF7' }}
                />
                <h3 className="font-bold" style={{ color: '#2D3436' }}>{name}</h3>
                <p className="text-sm mt-1 mb-2" style={{ color: '#2D3436', opacity: 0.65 }}>{role}</p>
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: border, color: border === '#FFE66D' ? '#2D3436' : '#fff' }}
                >
                  {fun}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="#4ECDC4" bg="#FFFDF7" />

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section id="ceny" className="py-20" style={{ backgroundColor: '#4ECDC4' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-balance text-white">Priateľské ceny</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-center">
            {[
              { emoji: '🐾', tier: 'Šteniatko', price: '15 €', per: 'mesačne', features: ['2x prehliadka / rok', 'Základná vakcína', 'Poradenstvo online'], highlight: false },
              { emoji: '🐾', tier: 'Dospelý', price: '20 €', per: 'mesačne', features: ['3x prehliadka / rok', 'Kompletná vakcinácia', 'Odčervenie zahrnuté', 'Zľava 15 % na lieky'], highlight: true },
              { emoji: '🐾', tier: 'Senior', price: '25 €', per: 'mesačne', features: ['4x prehliadka / rok', 'Kompletné vyšetrenia', 'Krvný obraz 2x / rok', 'Zľava 20 % na lieky'], highlight: false },
            ].map(({ emoji, tier, price, per, features, highlight }) => (
              <div
                key={tier}
                className={`rounded-3xl p-7 ${highlight ? 'scale-105 shadow-xl' : ''}`}
                style={{ backgroundColor: highlight ? '#FF6B6B' : '#FFFDF7' }}
              >
                <div className="text-3xl mb-3" role="img" aria-label="labka">{emoji}</div>
                <h3 className="font-bold text-xl mb-1" style={{ color: highlight ? '#fff' : '#2D3436' }}>{tier}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold" style={{ color: highlight ? '#fff' : '#FF6B6B' }}>{price}</span>
                  <span className="text-sm" style={{ color: highlight ? '#fff' : '#2D3436', opacity: highlight ? 0.8 : 0.5 }}>/ {per}</span>
                </div>
                <ul className="flex flex-col gap-2.5 mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: highlight ? '#fff' : '#2D3436', opacity: highlight ? 0.9 : 0.75 }}>
                      <PawPrint className="w-4 h-4 shrink-0" style={{ color: highlight ? '#fff' : '#4ECDC4' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#kontakt"
                  className="block text-center font-bold py-3 rounded-full text-sm transition-transform hover:scale-105"
                  style={{
                    backgroundColor: highlight ? '#fff' : '#4ECDC4',
                    color: highlight ? '#FF6B6B' : '#fff',
                  }}
                >
                  Vybrať plán
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFFDF7" bg="#4ECDC4" />

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-20" style={{ backgroundColor: '#FFFDF7' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            {/* Got questions? */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#2D3436' }}>Máte otázky?</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl overflow-hidden border-2"
                style={{ borderColor: openFaq === idx ? '#FF6B6B' : '#FFE66D' }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-semibold text-sm" style={{ color: '#2D3436' }}>{faq.q}</span>
                  <ChevronDown
                    className="w-5 h-5 shrink-0 ml-4 transition-transform duration-200"
                    style={{ color: '#FF6B6B', transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#2D3436', opacity: 0.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section id="kontakt" className="relative overflow-hidden py-20" style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
      }}>
        <svg viewBox="0 0 1440 40" className="absolute top-0 left-0 w-full" aria-hidden="true" style={{ transform: 'scaleY(-1)' }}>
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,0 L0,0 Z" fill="#FFFDF7" />
        </svg>
        <div className="max-w-2xl mx-auto px-6 text-center pt-8">
          {/* Come to us! */}
          <h2 className="text-4xl font-bold text-white text-balance mb-4">Poďte k nám!</h2>
          <p className="text-white/80 text-lg mb-10">
            {/* Book an appointment in 30 seconds. We're looking forward to you and your pet! */}
            Rezervujte termín za 30 sekúnd. Tešíme sa na vás a vášho miláčika!
          </p>
          <a
            href="tel:+421900000000"
            className="inline-flex items-center gap-2 text-lg font-bold px-10 py-4 rounded-full transition-transform hover:scale-105 mb-6"
            style={{ backgroundColor: '#fff', color: '#FF6B6B' }}
          >
            <Calendar className="w-5 h-5" />
            Rezervovať termín
          </a>
          <p className="text-white/70 flex items-center justify-center gap-2 text-lg font-semibold">
            <Phone className="w-5 h-5" />
            <a href="tel:+421900000000" className="hover:text-white transition-colors">+421 900 000 000</a>
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#2D3436' }}>
        {/* Paw print top border */}
        <div className="flex justify-center gap-4 pt-6 pb-2">
          {[...Array(8)].map((_, i) => (
            <PawPrint key={i} className="w-5 h-5 opacity-20" style={{ color: ['#FF6B6B', '#4ECDC4', '#FFE66D'][i % 3] }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6B6B' }}>
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Šteniatko</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {/* Fear-Free certified veterinary clinic for the whole family. */}
              Fear-Free certifikovaná veterinárna klinika pre celú rodinu.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Sledujte nás</h4>
            <div className="flex gap-4">
              {['Instagram', 'TikTok', 'Facebook'].map(name => (
                <a key={name} href="#" className="text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-70" style={{ backgroundColor: '#FF6B6B', color: '#fff' }}>{name}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Kde nás nájdete</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/50">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" style={{ color: '#FF6B6B' }} /> Hlavná 42, Bratislava</li>
              <li><a href="tel:+421900000000" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 shrink-0" style={{ color: '#4ECDC4' }} /> +421 900 000 000</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <span>&copy; 2025 Šteniatko. Všetky práva vyhradené.</span>
          {/* Created with love and OpenVPM */}
          <a href="#" className="hover:text-white/50 transition-colors">Vytvorené s OpenVPM</a>
        </div>
      </footer>
    </div>
  )
}
