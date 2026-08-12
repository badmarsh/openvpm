'use client'

import { useState } from 'react'
import {
  Stethoscope,
  Heart,
  Pill,
  Microscope,
  Monitor,
  Activity,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle,
  Menu,
  X,
  User,
} from 'lucide-react'

/* -----------------------------------------------------------------------
   Template 3: Clinical & Professional
   Cieľ: informovaní majitelia | Emócia: dôvera, autorita | CTA: Zobraziť ceny
   Target: data-driven owners | Emotion: confidence, authority | CTA: See pricing
   ----------------------------------------------------------------------- */

export default function Template3() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#0F172A]">MedVet</span>
              <span className="text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded uppercase tracking-wider">Fear-Free</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#0F172A]/60">
            <a href="#sluzby" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
              Služby <ChevronRight className="w-3 h-3" />
            </a>
            <a href="#vybavenie" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
              Vybavenie <ChevronRight className="w-3 h-3" />
            </a>
            <a href="#lekar" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
              Lekári <ChevronRight className="w-3 h-3" />
            </a>
            <a href="#ceny" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
              Ceny <ChevronRight className="w-3 h-3" />
            </a>
            <a href="#kontakt" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
              Kontakt <ChevronRight className="w-3 h-3" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#kontakt"
              className="hidden md:flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Rezervovať
            </a>
            <button className="md:hidden p-2 text-[#0F172A]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[#0F172A]/80">
            <a href="#sluzby" onClick={() => setMobileOpen(false)}>Služby</a>
            <a href="#vybavenie" onClick={() => setMobileOpen(false)}>Vybavenie</a>
            <a href="#lekar" onClick={() => setMobileOpen(false)}>Lekári</a>
            <a href="#ceny" onClick={() => setMobileOpen(false)}>Ceny</a>
            <a href="#kontakt" onClick={() => setMobileOpen(false)}>Kontakt</a>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight text-balance mb-6">
            {/* Professional veterinary medicine at the highest level */}
            Profesionálna veterinárna medicína na najvyššej úrovni
          </h1>
          <ul className="flex flex-col gap-3 mb-8">
            {[
              'Fear-Free certifikácia',
              'Digitálna diagnostika (RTG, USG)',
              'AI-asistovaný zápis pacienta',
              'Výsledky laboratória za 15 min',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#0F172A]/70">
                <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Objednať sa
            </a>
            <a
              href="#ceny"
              className="inline-flex items-center gap-2 border border-slate-200 text-[#0F172A] font-semibold px-6 py-3 rounded-lg hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
            >
              Zobraziť ceny
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            {['KVL SR', 'Fear-Free Certified', 'ISO 9001'].map(badge => (
              <span key={badge} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 text-[#0F172A]/60 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="aspect-[4/3] rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80"
            alt="Veterinár vyšetruje pacienta"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <section className="bg-[#2563EB] py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: '2 500+', label: 'vyšetrení ročne' }, // exams per year
            { stat: '98 %', label: 'spokojnosť klientov' }, // client satisfaction
            { stat: '15', label: 'rokov praxe' }, // years of practice
            { stat: '3', label: 'veterinári v tíme' }, // vets on team
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-4xl font-bold text-white">{stat}</p>
              <p className="text-white/70 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section id="sluzby" className="bg-[#F1F5F9] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Odborné služby</span>
            {/* Our services */}
            <h2 className="text-3xl font-bold text-[#0F172A] mt-2">Naše služby</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Activity, title: 'Preventívna medicína', desc: 'Ročné prehliadky, vakcinácie, parazitárna prevencia. Podkladáme presné zdravotné záznamy.', price: '35 €' },
              { icon: Stethoscope, title: 'Chirurgické zákroky', desc: 'Ortopedická, mäkkotkanivová aj akútna chirurgia s modernou anestéziou a monitoringom.', price: '80 €' },
              { icon: Heart, title: 'Dentálna starostlivosť', desc: 'Profesionálne čistenie, extrakcie, RTG zubov. Prevencia parodontologických ochorení.', price: '45 €' },
              { icon: Microscope, title: 'Laboratórna diagnostika', desc: 'Krvný obraz, biochémia, moč, cytológia — výsledky do 15 minút priamo v ambulancii.', price: '25 €' },
              { icon: Monitor, title: 'RTG & USG zobrazovanie', desc: 'Digitálny röntgen a ultrasonografia pre presný obraz vnútorných orgánov a skeletu.', price: '40 €' },
              { icon: Pill, title: 'Dermatológia', desc: 'Diagnostika a liečba kožných ochorení, alergií a parazitárnych infekcií.', price: '35 €' },
            ].map(({ icon: Icon, title, desc, price }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-slate-100 hover:border-[#2563EB]/30 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB]/8 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{title}</h3>
                <p className="text-sm text-[#0F172A]/55 leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0F172A]/40">Cena od:</span>
                  <span className="font-bold text-[#2563EB] text-sm">{price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology & Equipment ────────────────────────────────── */}
      <section id="vybavenie" className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Infraštruktúra</span>
          {/* Modern equipment */}
          <h2 className="text-3xl font-bold text-[#0F172A] mt-2 mb-6 text-balance">Moderné vybavenie</h2>
          <p className="text-[#0F172A]/60 leading-relaxed mb-8">
            {/* We invest in the latest diagnostic technology so that no pathology escapes our attention. All examinations are documented digitally. */}
            Investujeme do najnovšej diagnostickej technológie, aby nám neušla žiadna patológia. Všetky vyšetrenia sú digitálne dokumentované.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Digital X-Ray',
              'Ultrasonografia',
              'Dentálna jednotka',
              'In-house laboratórium',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 bg-[#F1F5F9] rounded-lg px-4 py-3">
                <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-sm font-medium text-[#0F172A]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="aspect-[4/3] rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80"
            alt="Moderné veterinárne vybavenie a diagnostické prístroje"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ── Doctors ───────────────────────────────────────────────── */}
      <section id="lekar" className="bg-[#F1F5F9] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Odborníci</span>
            {/* Our doctors */}
            <h2 className="text-3xl font-bold text-[#0F172A] mt-2">Náš tím lekárov</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'MVDr. Jana Kováčová', spec: 'Interna & chirurgia', exp: '12 rokov praxe', badges: ['Interné choroby', 'Mäkkotkanivová chirurgia'], initials: 'JK' },
              { name: 'MVDr. Peter Horváth', spec: 'Ortopédia & zobrazovacie metódy', exp: '8 rokov praxe', badges: ['Ortopédia', 'RTG & USG'], initials: 'PH' },
              { name: 'MVDr. Mária Varga', spec: 'Dermatológia & dentálna med.', exp: '6 rokov praxe', badges: ['Dermatológia', 'Dentálna medicína'], initials: 'MV' },
            ].map(({ name, spec, exp, badges, initials }) => (
              <div key={name} className="bg-white rounded-xl p-6 border border-slate-100">
                <img
                  src={`https://ui-avatars.com/api/?name=${initials}&background=2563EB&color=fff&size=64&bold=true`}
                  alt={name}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <h3 className="font-bold text-[#0F172A]">{name}</h3>
                <p className="text-sm text-[#0F172A]/60 mt-0.5 mb-3">{spec}</p>
                <p className="text-xs text-[#10B981] font-semibold mb-3">{exp}</p>
                <div className="flex flex-wrap gap-2">
                  {badges.map(b => (
                    <span key={b} className="text-xs bg-[#2563EB]/8 text-[#2563EB] px-2.5 py-1 rounded-md font-medium">{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Table ─────────────────────────────────────────── */}
      <section id="ceny" className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Transparentné ceny</span>
          {/* Pricing */}
          <h2 className="text-3xl font-bold text-[#0F172A] mt-2">Cenník</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tier: 'Základné vyšetrenie',
              price: '35 €',
              per: 'jednorazovo',
              features: ['Klinické vyšetrenie', 'Poradenstvo', 'Odporúčania', 'Zdravotný záznam'],
              highlight: false,
            },
            {
              tier: 'Komplexná prehliadka',
              price: '65 €',
              per: 'jednorazovo',
              features: ['Všetko z Základného', 'Krvný obraz', 'Biochemické vyšetrenie', 'Odčervenie', 'Výsledky do 15 min'],
              highlight: true,
            },
            {
              tier: 'Wellness balík',
              price: '15 €',
              per: 'mesačne',
              features: ['2x ročná prehliadka', 'Vakcinácia v cene', 'Parazitárna prevencia', 'Zľava 10 % na lieky'],
              highlight: false,
            },
          ].map(({ tier, price, per, features, highlight }) => (
            <div
              key={tier}
              className={`rounded-xl p-7 border ${highlight ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white border-slate-100'}`}
            >
              <h3 className={`font-bold mb-1 ${highlight ? 'text-white' : 'text-[#0F172A]'}`}>{tier}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-[#2563EB]'}`}>{price}</span>
                <span className={`text-sm ${highlight ? 'text-white/70' : 'text-[#0F172A]/40'}`}>/ {per}</span>
              </div>
              <ul className="flex flex-col gap-2.5 mt-6 mb-7">
                {features.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? 'text-white/90' : 'text-[#0F172A]/70'}`}>
                    <CheckCircle className={`w-4 h-4 shrink-0 ${highlight ? 'text-white' : 'text-[#10B981]'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#kontakt"
                className={`block text-center font-semibold py-3 rounded-lg text-sm transition-colors ${
                  highlight
                    ? 'bg-white text-[#2563EB] hover:bg-white/90'
                    : 'border border-slate-200 text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                Objednať sa
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────── */}
      <section className="bg-[#F1F5F9] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-[#0F172A]">4.9</span>
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#0F172A]/50">180+ recenzií na Google</p>
              </div>
            </div>
            <div className="md:ml-auto">
              <span className="inline-flex items-center gap-2 text-xs font-semibold border border-slate-200 bg-white px-3 py-2 rounded-lg text-[#0F172A]/60">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Overené recenzie — Google Maps
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { text: 'Veľmi profesionálny tím. Diagnóza bola rýchla a presná, liečba zabrala hneď. Odporúčam každému.', name: 'Martin K.', src: 'Google' },
              { text: 'Prvýkrát vidím RTG výsledky priamo na mieste. Moderné vybavenie a príjemný prístup. Späť určite prídem.', name: 'Simona L.', src: 'Google' },
              { text: 'Wellness balík sa mi veľmi vyplatí. Ušetrím na ročných prehliadkach a mám pokoj, že je Maxo zdravý.', name: 'Radovan P.', src: 'Google' },
            ].map(({ text, name, src }) => (
              <div key={name} className="bg-white rounded-xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#0F172A]/70 leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#0F172A]">{name}</span>
                  <span className="text-xs text-[#0F172A]/40 border border-slate-200 px-2 py-0.5 rounded">{src}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact & Hours ───────────────────────────────────────── */}
      <section id="kontakt" className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14">
        <div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Kontakt</span>
          <h2 className="text-3xl font-bold text-[#0F172A] mt-2 mb-8">Kde nás nájdete</h2>
          <div className="flex flex-col gap-5 mb-10">
            {[
              { icon: MapPin, label: 'Adresa', val: 'Vedecká 18, 811 02 Bratislava' },
              { icon: Phone, label: 'Telefón', val: '+421 900 000 000', href: 'tel:+421900000000' },
              { icon: Mail, label: 'Email', val: 'info@medvet.sk', href: 'mailto:info@medvet.sk' },
            ].map(({ icon: Icon, label, val, href }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB]/8 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-xs text-[#0F172A]/40 mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors">{val}</a>
                  ) : (
                    <p className="text-sm font-medium text-[#0F172A]">{val}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Map placeholder */}
          <div className="w-full aspect-video rounded-xl bg-[#F1F5F9] flex items-center justify-center text-sm text-[#0F172A]/30 border border-slate-100">
            Google Maps embed
          </div>
        </div>
        <div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Ordinačné hodiny</span>
          <h2 className="text-3xl font-bold text-[#0F172A] mt-2 mb-8">Kedy ordinujeme</h2>
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
                <tr key={day} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 text-[#0F172A]/60">{day}</td>
                  <td className="py-3 text-right font-semibold text-[#0F172A]">{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Book today */}
          <h2 className="text-3xl font-bold text-white mb-4 text-balance">Objednajte sa ešte dnes</h2>
          <p className="text-white/70 mb-8">Voľné termíny zvyčajne do 48 hodín. Zavolajte alebo rezervujte online.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 bg-white text-[#2563EB] font-semibold px-7 py-3.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Objednať online
            </a>
            <a
              href="tel:+421900000000"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +421 900 000 000
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">MedVet</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {/* Clinical veterinary care with precision and compassion. */}
              Klinická veterinárna starostlivosť s presnosťou a empatiou.
            </p>
          </div>
          {[
            { heading: 'Služby', links: ['Preventívna medicína', 'Chirurgia', 'Dentálna starostlivosť', 'Diagnostika'] },
            { heading: 'Klinika', links: ['O nás', 'Náš tím', 'Vybavenie', 'Certifikácie'] },
            { heading: 'Kontakt', links: ['Vedecká 18, Bratislava', '+421 900 000 000', 'info@medvet.sk'] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="font-semibold text-white mb-4">{heading}</h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/40">
                {links.map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <span>&copy; 2025 MedVet. Všetky práva vyhradené.</span>
          <a href="#" className="hover:text-white/50 transition-colors">Vytvorené s OpenVPM</a>
        </div>
      </footer>

      {/* Schema.org MedicalOrganization markup */}
      {/* <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        "name": "MedVet",
        "medicalSpecialty": "Veterinary",
        "address": { "@type": "PostalAddress", "streetAddress": "Vedecká 18", "addressLocality": "Bratislava" },
        "telephone": "+421900000000"
      })}</script> */}
    </div>
  )
}
