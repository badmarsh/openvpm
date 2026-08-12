'use client'

import { useState } from 'react'
import {
  Stethoscope,
  Heart,
  Pill,
  Microscope,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Calendar,
  Menu,
  X,
} from 'lucide-react'

/* -----------------------------------------------------------------------
   Template 1: Clean & Modern
   Cieľ: mestskí profesionáli | Emócia: dôvera, prémium | CTA: Rezervovať online
   Target: urban professionals | Emotion: trust, premium | CTA: Book online
   ----------------------------------------------------------------------- */

export default function Template1() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-[#1B2A4A] font-sans scroll-smooth">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#7BA68C] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-[#1B2A4A] leading-none">VetKlinka</span>
              <span className="ml-2 text-[10px] font-medium bg-[#7BA68C]/15 text-[#7BA68C] px-2 py-0.5 rounded-full uppercase tracking-wide">Fear-Free</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1B2A4A]/70">
            <a href="#sluzby" className="hover:text-[#7BA68C] transition-colors">Služby</a>
            <a href="#o-nas" className="hover:text-[#7BA68C] transition-colors">O nás</a>
            <a href="#recenzie" className="hover:text-[#7BA68C] transition-colors">Recenzie</a>
            <a href="#kontakt" className="hover:text-[#7BA68C] transition-colors">Kontakt</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#kontakt"
              className="hidden md:flex items-center gap-2 bg-[#1B2A4A] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#7BA68C] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Rezervovať
            </a>
            <button
              className="md:hidden p-2 text-[#1B2A4A]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Otvoriť menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[#1B2A4A]/80">
            <a href="#sluzby" onClick={() => setMobileOpen(false)}>Služby</a>
            <a href="#o-nas" onClick={() => setMobileOpen(false)}>O nás</a>
            <a href="#recenzie" onClick={() => setMobileOpen(false)}>Recenzie</a>
            <a href="#kontakt" onClick={() => setMobileOpen(false)}>Kontakt</a>
            <a href="#kontakt" className="bg-[#1B2A4A] text-white text-center px-5 py-2.5 rounded-full" onClick={() => setMobileOpen(false)}>
              Rezervovať termín
            </a>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          {/* Care you can trust */}
          <p className="text-sm font-semibold text-[#7BA68C] uppercase tracking-widest mb-4">Veterinárna klinika</p>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#1B2A4A] leading-tight text-balance mb-6">
            Starostlivosť,<br />ktorej môžete<br />
            <span className="text-[#7BA68C]">dôverovať</span>
          </h1>
          <p className="text-lg text-[#1B2A4A]/60 leading-relaxed mb-10 max-w-md">
            {/* Providing professional, compassionate veterinary care for your beloved companions since 2009. */}
            Profesionálna a láskavá starostlivosť o vašich miláčikov od roku 2009. Sme tu pre vás aj pre nich.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 bg-[#1B2A4A] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#7BA68C] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Rezervovať termín
            </a>
            <a
              href="#sluzby"
              className="inline-flex items-center gap-2 border-2 border-[#1B2A4A] text-[#1B2A4A] font-semibold px-7 py-3.5 rounded-full hover:bg-[#1B2A4A] hover:text-white transition-colors"
            >
              Naše služby
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80"
              alt="Veterinár s pokojným psom pri vyšetrení"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-5 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7BA68C]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#7BA68C] fill-[#7BA68C]" />
            </div>
            <div>
              <p className="font-bold text-[#1B2A4A] text-sm">4.9 / 5.0</p>
              <p className="text-xs text-[#1B2A4A]/50">180+ recenzií</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section id="sluzby" className="bg-[#F5F5F0] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#7BA68C] uppercase tracking-widest mb-3">Čo ponúkame</p>
            {/* Our services */}
            <h2 className="text-4xl font-bold text-[#1B2A4A] text-balance">Naše služby</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, title: 'Preventívna prehliadka', desc: 'Komplexné vyšetrenie zdravotného stavu' },
              { icon: Heart, title: 'Kardiológia', desc: 'Starostlivosť o srdce vášho miláčika' },
              { icon: Pill, title: 'Farmakoterapia', desc: 'Odborné predpisovanie liekov' },
              { icon: Microscope, title: 'Laboratórna diagnostika', desc: 'Výsledky do 15 minút priamo u nás' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-7 border border-gray-100 group hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[#7BA68C]/10 flex items-center justify-center mb-5 group-hover:bg-[#7BA68C]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#7BA68C]" />
                </div>
                <h3 className="font-semibold text-[#1B2A4A] mb-2">{title}</h3>
                <p className="text-sm text-[#1B2A4A]/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      <section id="o-nas" className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden order-last md:order-first">
          <img
            src="https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=800&q=80"
            alt="Interiér veterinárnej kliniky"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#7BA68C] uppercase tracking-widest mb-4">O nás</p>
          {/* About us */}
          <h2 className="text-4xl font-bold text-[#1B2A4A] mb-6 text-balance">Váš partner v starostlivosti o zdravie</h2>
          <p className="text-[#1B2A4A]/60 leading-relaxed mb-4">
            {/* Our clinic has been providing top-quality veterinary care since 2009. Our experienced team of veterinarians and nurses treats every animal with the same love and dedication as their own pets. */}
            Naša klinika poskytuje najkvalitnejšiu veterinárnu starostlivosť od roku 2009. Náš tím skúsených veterinárov a sestier ošetruje každé zviera s rovnakou láskou a odhodlaním ako vlastné domáce zvieratá.
          </p>
          <p className="text-[#1B2A4A]/60 leading-relaxed mb-10">
            {/* We use modern diagnostic equipment and continuously educate ourselves so we can offer our clients the best that veterinary medicine has to offer. */}
            Využívame moderné diagnostické vybavenie a neustále sa vzdelávame, aby sme mohli ponúknuť našim klientom to najlepšie, čo veterinárna medicína ponúka.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { stat: '1000+', label: 'spokojných klientov' },
              { stat: '15+', label: 'rokov skúseností' },
              { stat: 'Fear-Free', label: 'certifikácia' },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-[#F5F5F0] rounded-xl p-4 text-center">
                <p className="font-bold text-[#1B2A4A] text-lg leading-tight">{stat}</p>
                <p className="text-xs text-[#1B2A4A]/55 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section id="recenzie" className="bg-[#F5F5F0] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#7BA68C] uppercase tracking-widest mb-3">Recenzie</p>
            {/* What our clients say */}
            <h2 className="text-4xl font-bold text-[#1B2A4A] text-balance">Čo hovoria naši klienti</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'Úžasná starostlivosť! Doktor bol veľmi trpezlivý s mojím nervóznym psíkom. Vrátim sa určite.', name: 'Mária K.' },
              { quote: 'Najlepšia veterinárna klinika v meste. Rýchla diagnostika a profesionálny prístup. Odporúčam každému.', name: 'Ján P.' },
              { quote: 'Môj kocúr je po operácii úplne zdravý. Ďakujem celému tímu za skvelú prácu a ľudský prístup.', name: 'Zuzana M.' },
            ].map(({ quote, name }) => (
              <div key={name} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Review text */}
                <p className="text-[#1B2A4A]/70 leading-relaxed mb-6 text-sm">&ldquo;{quote}&rdquo;</p>
                <p className="font-semibold text-[#1B2A4A] text-sm">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Opening Hours + Contact ────────────────────────────────── */}
      <section id="kontakt" className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16">
        <div>
          {/* Opening hours */}
          <p className="text-sm font-semibold text-[#7BA68C] uppercase tracking-widest mb-4">Ordinačné hodiny</p>
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-8">Kedy nás nájdete</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                { day: 'Pondelok', time: '8:00 – 18:00' },
                { day: 'Utorok', time: '8:00 – 18:00' },
                { day: 'Streda', time: '8:00 – 16:00' },
                { day: 'Štvrtok', time: '8:00 – 18:00' },
                { day: 'Piatok', time: '8:00 – 16:00' },
                { day: 'Sobota', time: '9:00 – 13:00' },
                { day: 'Nedeľa', time: 'Zatvorené' },
              ].map(({ day, time }) => (
                <tr key={day} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 text-[#1B2A4A]/70 font-medium">{day}</td>
                  <td className="py-3 text-right text-[#1B2A4A] font-semibold">{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          {/* Contact */}
          <p className="text-sm font-semibold text-[#7BA68C] uppercase tracking-widest mb-4">Kontakt</p>
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-8">Spojte sa s nami</h2>
          <div className="flex flex-col gap-5 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7BA68C]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#7BA68C]" />
              </div>
              <div>
                <p className="text-xs text-[#1B2A4A]/50 mb-0.5">Adresa</p>
                <p className="text-sm font-medium text-[#1B2A4A]">Hlavná 42, 811 01 Bratislava</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7BA68C]/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#7BA68C]" />
              </div>
              <div>
                <p className="text-xs text-[#1B2A4A]/50 mb-0.5">Telefón</p>
                <a href="tel:+421900000000" className="text-sm font-medium text-[#1B2A4A] hover:text-[#7BA68C] transition-colors">
                  +421 900 000 000
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7BA68C]/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#7BA68C]" />
              </div>
              <div>
                <p className="text-xs text-[#1B2A4A]/50 mb-0.5">Email</p>
                <a href="mailto:info@vetklinika.sk" className="text-sm font-medium text-[#1B2A4A] hover:text-[#7BA68C] transition-colors">
                  info@vetklinika.sk
                </a>
              </div>
            </div>
          </div>
          <a
            href="tel:+421900000000"
            className="inline-flex items-center gap-2 bg-[#7BA68C] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#6a9478] transition-colors"
          >
            <Phone className="w-4 h-4" />
            Zavolajte nám
          </a>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="bg-[#1B2A4A] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Need an appointment? */}
          <h2 className="text-4xl font-bold text-white mb-4 text-balance">Potrebujete termín?</h2>
          <p className="text-white/60 mb-10 text-lg">
            {/* Reserve your visit online or call us directly. */}
            Rezervujte si návštevu online alebo nám zavolajte priamo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 bg-[#7BA68C] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#6a9478] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Rezervovať online
            </a>
            <a
              href="tel:+421900000000"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-[#1B2A4A] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Zavolať
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-[#1B2A4A] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-[#7BA68C] flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">VetKlinika</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {/* Professional veterinary care with a human touch. Bratislava since 2009. */}
              Profesionálna veterinárna starostlivosť s ľudským prístupom. Bratislava od roku 2009.
            </p>
          </div>
          <div>
            {/* Quick links */}
            <h4 className="font-semibold text-white mb-5">Rýchle odkazy</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/50">
              <li><a href="#sluzby" className="hover:text-white transition-colors">Služby</a></li>
              <li><a href="#o-nas" className="hover:text-white transition-colors">O nás</a></li>
              <li><a href="#recenzie" className="hover:text-white transition-colors">Recenzie</a></li>
              <li><a href="#kontakt" className="hover:text-white transition-colors">Kontakt &amp; Hodiny</a></li>
            </ul>
          </div>
          <div>
            {/* Contact */}
            <h4 className="font-semibold text-white mb-5">Kontakt</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/50">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Hlavná 42, Bratislava</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+421900000000" className="hover:text-white transition-colors">+421 900 000 000</a>
              </li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:info@vetklinika.sk" className="hover:text-white transition-colors">info@vetklinika.sk</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>&copy; 2025 VetKlinika. Všetky práva vyhradené.</span>
          {/* Created with OpenVPM */}
          <a href="#" className="hover:text-white/60 transition-colors">Vytvorené s OpenVPM</a>
        </div>
      </footer>

      {/* Schema.org LocalBusiness markup */}
      {/* <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VeterinaryCare",
        "name": "VetKlinika",
        "address": { "@type": "PostalAddress", "streetAddress": "Hlavná 42", "addressLocality": "Bratislava" },
        "telephone": "+421900000000",
        "openingHours": ["Mo-Tu 08:00-18:00","We 08:00-16:00","Th 08:00-18:00","Fr 08:00-16:00","Sa 09:00-13:00"]
      })}</script> */}
    </div>
  )
}
