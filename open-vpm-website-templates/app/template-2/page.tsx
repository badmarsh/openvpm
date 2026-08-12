'use client'

import { useState } from 'react'
import {
  Heart,
  Shield,
  Award,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  User,
  Menu,
  X,
  Stethoscope,
  Calendar,
} from 'lucide-react'

/* -----------------------------------------------------------------------
   Template 2: Warm & Trusting
   Cieľ: rodiny, dlhodobí klienti | Emócia: pohodlie, spolupatričnosť | CTA: Zavolajte
   Target: families, long-term clients | Emotion: comfort, belonging | CTA: Call us
   ----------------------------------------------------------------------- */

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

const services = [
  {
    title: 'Preventívna prehliadka',
    shortDesc: 'Ročná kontrola zdravotného stavu',
    fullDesc: 'Komplexné vyšetrenie zahŕňa kontrolu všetkých orgánových systémov, meranie teploty, hmotnosti a odporúčania pre ďalšiu starostlivosť. Cena od 35 €.',
  },
  {
    title: 'Vakcinácia',
    shortDesc: 'Kompletný vakcinačný plán',
    fullDesc: 'Ochráňte svojho miláčika pred najčastejšími infekčnými chorobami. Vystavujeme medzinárodné vakcinačné preukazy. Cena od 20 €.',
  },
  {
    title: 'Chirurgia',
    shortDesc: 'Plánované aj akútne zákroky',
    fullDesc: 'Operujeme v plne vybavenej operačnej sále s modernou anestéziou. Kastrácia, sterilizácia, ortopedické aj mäkkotkanivové operácie. Cena od 80 €.',
  },
  {
    title: 'Dentálna hygiena',
    shortDesc: 'Čistenie a extrakcia zubov',
    fullDesc: 'Zubný kameň a parodontitída sú časté problémy. Ponúkame profesionálne čistenie pod anestéziou aj bez nej. Cena od 45 €.',
  },
  {
    title: 'Laboratórna diagnostika',
    shortDesc: 'Výsledky do 15 minút',
    fullDesc: 'Vlastné laboratórium umožňuje rýchlu diagnózu — krvný obraz, biochémia, moč, cytológia. Cena od 25 €.',
  },
  {
    title: 'Pohotovosť',
    shortDesc: 'Sme tu aj v núdzi',
    fullDesc: 'Pohotovostné prípady riešime prednostne. V prípade núdze zavolajte — poradíme vám ešte pred príchodom. Príplatok 30 €.',
  },
]

const faqs = [
  { q: 'Ako sa objednám na vyšetrenie?', a: 'Môžete zavolať, napísať email alebo vyplniť formulár na webe. Obvykle máme voľné termíny do 2 pracovných dní.' },
  { q: 'Akceptujete poistenie domácich zvierat?', a: 'Áno, spolupracujeme s viacerými poisťovňami. Vystavujeme potrebné doklady pre refundáciu.' },
  { q: 'Čo mám priniesť na prvú návštevu?', a: 'Vakcinačný preukaz, akékoľvek lieky, ktoré zviera užíva, a ideálne aj vzorku trusu.' },
  { q: 'Ošetrujete aj exotické zvieratá?', a: 'Áno, máme skúsenosti s králikmi, morčatami, plazmi aj vtáctvom.' },
  { q: 'Je klinika vybavená Fear-Free?', a: 'Áno, sme certifikovaní Fear-Free veterinári. Každý zákrok robíme s maximálnym dôrazom na pohodu zvieraťa.' },
]

export default function Template2() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openService, setOpenService] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#FFF8F0', color: '#3D6B4F' }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FFE4D6' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#C4704B' }}>
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: '#3D6B4F' }}>Srdiečko</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#8B6F47' }}>
            <a href="#sluzby" className="hover:opacity-70 transition-opacity">Služby</a>
            <a href="#tim" className="hover:opacity-70 transition-opacity">Náš tím</a>
            <a href="#faq" className="hover:opacity-70 transition-opacity">FAQ</a>
            <a href="#kontakt" className="hover:opacity-70 transition-opacity">Kontakt</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+421900000000"
              className="hidden md:flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4704B' }}
            >
              <Phone className="w-4 h-4" />
              Zavolajte nám
            </a>
            <button className="md:hidden p-2" style={{ color: '#3D6B4F' }} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4 text-sm font-medium" style={{ backgroundColor: '#FFF8F0', borderColor: '#FFE4D6', color: '#8B6F47' }}>
            <a href="#sluzby" onClick={() => setMobileOpen(false)}>Služby</a>
            <a href="#tim" onClick={() => setMobileOpen(false)}>Náš tím</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
            <a href="#kontakt" onClick={() => setMobileOpen(false)}>Kontakt</a>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative paw prints background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          {[[10, 15], [30, 50], [60, 20], [80, 70], [50, 85]].map(([x, y], i) => (
            <PawPrint key={i} className="absolute w-16 h-16" style={{ left: `${x}%`, top: `${y}%`, color: '#C4704B' }} />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-8"
            style={{ backgroundColor: '#FFE4D6', color: '#C4704B' }}
          >
            <PawPrint className="w-4 h-4" />
            Veterinárna klinika Srdiečko
          </div>
          {/* Your pets feel at home here */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-balance mb-6" style={{ color: '#3D6B4F' }}>
            Vaši miláčikovia<br />
            sú u nás <span style={{ color: '#C4704B' }}>ako doma</span>
          </h1>
          <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: '#8B6F47' }}>
            {/* A clinic where every pet receives personal care and every owner gets full attention. We treat your companions as our own. */}
            Klinika, kde každé zviera dostáva osobnú pozornosť a každý majiteľ cíti plnú starostlivosť. Vaše zvieratká ošetrujeme ako vlastné.
          </p>
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-full text-lg transition-opacity hover:opacity-90 shadow-lg"
            style={{ backgroundColor: '#C4704B' }}
          >
            <Calendar className="w-5 h-5" />
            Rezervovať termín
          </a>
        </div>
      </section>

      {/* ── Why Us Feature Strip ───────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: '#FFE4D6' }}>
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Heart, label: 'Láskavý prístup', desc: 'Každé zviera zaslúži lásku' }, // Gentle approach
            { icon: Shield, label: 'Bezpečná starostlivosť', desc: 'Fear-Free certifikovaní' }, // Safe care
            { icon: Award, label: 'Certifikovaný tím', desc: '15+ rokov skúseností' }, // Certified team
            { icon: Clock, label: 'Flexibilné hodiny', desc: 'Vrátane sobôt' }, // Flexible hours
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C4704B' }}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-base" style={{ color: '#3D6B4F' }}>{label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8B6F47' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials Carousel ─────────────────────────────────── */}
      <section id="recenzie" className="py-24" style={{ backgroundColor: '#FFE4D6' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            {/* What our clients say */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#3D6B4F' }}>Čo hovoria naši klienti</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { text: 'Úžasná skúsenosť. Môj pes sa nebál ani minútu. Pani doktorka je veľmi milá a trpezlivá.', name: 'Katarína B.', pet: 'mamička Rexíka' },
              { text: 'Rýchle objednanie, príjemné prostredie, profesionálna starostlivosť. Odporúčam všetkým!', name: 'Tomáš N.', pet: 'tatko Filipa' },
              { text: 'Zachránili mi mačičku po nehode. Som nesmierne vďačná celému tímu za ich nasadenie.', name: 'Eva H.', pet: 'mamička Mišky' },
              { text: 'Najlepší veterinár akého sme mali. Vždy si nájde čas vysvetliť všetko do detailu.', name: 'Milan D.', pet: 'tatko Golda' },
            ].map(({ text, name, pet }) => (
              <div key={name} className="rounded-3xl p-7 shadow-md relative" style={{ backgroundColor: '#FFF8F0' }}>
                <div className="text-5xl leading-none font-serif mb-3" style={{ color: '#C4704B', opacity: 0.3 }}>&ldquo;</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#8B6F47' }}>{text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFE4D6' }}>
                    <User className="w-4 h-4" style={{ color: '#C4704B' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#3D6B4F' }}>{name}</p>
                    <p className="text-xs" style={{ color: '#8B6F47' }}>{pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────── */}
      <section id="tim" className="py-24" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            {/* Meet our team */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#3D6B4F' }}>Spoznajte náš tím</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { name: 'MVDr. Jana Kováčová', role: 'Hlavná veterinárka', bio: 'Špecializácia na interné choroby a chirurgiu malých zvierat.', initials: 'JK' },
              { name: 'Bc. Petra Horváthová', role: 'Veterinárna sestra', bio: 'Odborníčka na ošetrovateľskú starostlivosť a rehabilitáciu.', initials: 'PH' },
              { name: 'Lucia Tóthová', role: 'Recepcia', bio: 'Postará sa o vaše objednanie a zodpovie všetky otázky.', initials: 'LT' },
            ].map(({ name, role, bio, initials }) => (
              <div key={name} className="text-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${initials}&background=C4704B&color=fff&size=112&bold=true`}
                  alt={name}
                  className="w-28 h-28 rounded-full mx-auto mb-5"
                />
                <h3 className="font-bold text-base" style={{ color: '#3D6B4F' }}>{name}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: '#C4704B' }}>{role}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#8B6F47' }}>{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Accordion ────────────────────────────────────── */}
      <section id="sluzby" className="py-24" style={{ backgroundColor: '#FFE4D6' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#3D6B4F' }}>Naše služby</h2>
          </div>
          <div className="flex flex-col gap-3">
            {services.map((svc, idx) => (
              <div
                key={svc.title}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#FFF8F0' }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-opacity hover:opacity-80"
                  onClick={() => setOpenService(openService === idx ? null : idx)}
                  aria-expanded={openService === idx}
                >
                  <div>
                    <h3 className="font-semibold" style={{ color: '#3D6B4F' }}>{svc.title}</h3>
                    <p className="text-sm mt-0.5" style={{ color: '#8B6F47' }}>{svc.shortDesc}</p>
                  </div>
                  <ChevronDown
                    className="w-5 h-5 shrink-0 ml-4 transition-transform duration-200"
                    style={{ color: '#C4704B', transform: openService === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {openService === idx && (
                  <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#8B6F47' }}>
                    {svc.fullDesc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────��────────────────────────── */}
      <section id="faq" className="py-24" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            {/* Frequently asked questions */}
            <h2 className="text-4xl font-bold text-balance" style={{ color: '#3D6B4F' }}>Často kladené otázky</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div key={faq.q} className="rounded-2xl overflow-hidden border" style={{ borderColor: '#FFE4D6' }}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-opacity hover:opacity-80"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-semibold text-sm" style={{ color: '#3D6B4F' }}>{faq.q}</span>
                  <ChevronDown
                    className="w-5 h-5 shrink-0 ml-4 transition-transform duration-200"
                    style={{ color: '#C4704B', transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#8B6F47' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section id="kontakt" className="py-24" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          {/* Are you ready to visit us? */}
          <h2 className="text-4xl font-bold text-balance mb-4" style={{ color: '#3D6B4F' }}>Ste pripravení navštíviť nás?</h2>
          <p className="text-lg leading-relaxed mb-10" style={{ color: '#8B6F47' }}>
            {/* Book an appointment online or just give us a call. We look forward to you and your pet. */}
            Rezervujte termín online alebo nám jednoducho zavolajte. Tešíme sa na vás a vášho miláčika.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+421900000000"
              className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-full text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4704B' }}
            >
              <Phone className="w-5 h-5" />
              Zavolajte nám
            </a>
            <a
              href="mailto:info@srdieckoklinika.sk"
              className="inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-full text-lg border-2 transition-colors"
              style={{ borderColor: '#C4704B', color: '#C4704B' }}
            >
              <Mail className="w-5 h-5" />
              Napíšte nám
            </a>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center text-sm" style={{ color: '#8B6F47' }}>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: '#C4704B' }} /> Hlavná 42, Bratislava</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: '#C4704B' }} /> Po–Pia: 8:00–18:00</span>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#8B6F47' }}>
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#C4704B' }}>
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Srdiečko</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {/* Loving veterinary care for every companion. Fear-Free Certified. */}
              Láskavá veterinárna starostlivosť pre každého miláčika. Fear-Free certifikovaní.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-5">Sledujte nás</h4>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'TikTok'].map(name => (
                <a key={name} href="#" className="text-xs text-white/60 hover:text-white transition-colors">{name}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-5">Kontakt</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/60">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Hlavná 42, Bratislava</li>
              <li><a href="tel:+421900000000" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 shrink-0" /> +421 900 000 000</a></li>
            </ul>
            <div className="mt-5 inline-block text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: '#C4704B', color: 'white' }}>
              Fear-Free Certified
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>&copy; 2025 Srdiečko. Všetky práva vyhradené.</span>
          {/* Created with OpenVPM */}
          <a href="#" className="hover:text-white/60 transition-colors">Vytvorené s OpenVPM</a>
        </div>
      </footer>
    </div>
  )
}
