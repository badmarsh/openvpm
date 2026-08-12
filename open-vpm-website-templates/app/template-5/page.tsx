'use client'

import { useState } from 'react'
import {
  Phone,
  AlertTriangle,
  Heart,
  Shield,
  MapPin,
  Navigation,
  Clock,
  Calendar,
  ChevronRight,
  Activity,
  Droplets,
  Car,
  Menu,
  X,
  Star,
  CheckCircle,
  User,
} from 'lucide-react'

/* -----------------------------------------------------------------------
   Template 5: Emergency First
   Cieľ: naliehavá starostlivosť | Emócia: pokoj, urgentnosť | CTA: Volať TERAZ
   Target: urgent care seekers | Emotion: reassurance, urgency | CTA: Call NOW
   ----------------------------------------------------------------------- */

const EMERGENCY_PHONE = '+421 900 000 000'
const EMERGENCY_HREF = 'tel:+421900000000'

export default function Template5() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
          70% { box-shadow: 0 0 0 14px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .pulse-ring { animation: pulse-ring 1.6s ease-out infinite; }
      `}</style>

      {/* ── Emergency Banner (sticky) ─────────────────────────────── */}
      <div className="sticky top-0 z-[60] bg-[#DC2626] text-white">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Emergency alert icon */}
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="font-bold text-sm tracking-wide uppercase">Pohotovosť 24/7</span>
          </div>
          <a
            href={EMERGENCY_HREF}
            className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity"
            aria-label={`Volajte pohotovosť: ${EMERGENCY_PHONE}`}
          >
            <Phone className="w-5 h-5" />
            {EMERGENCY_PHONE}
          </a>
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">Otvorené 24/7</span>
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-[44px] z-50 bg-[#1E293B] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DC2626] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg">VetPohotovosť</span>
              <span className="text-[10px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded uppercase tracking-wider">24/7</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/60">
            <a href="#pohotovost" className="hover:text-white transition-colors">Pohotovosť</a>
            <a href="#navod" className="hover:text-white transition-colors">Ako sa pripraviť</a>
            <a href="#sluzby" className="hover:text-white transition-colors">Služby</a>
            <a href="#kontakt" className="hover:text-white transition-colors">Kontakt</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={EMERGENCY_HREF}
              className="hidden md:flex items-center gap-2 bg-[#DC2626] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#b91c1c] transition-colors pulse-ring"
            >
              <Phone className="w-4 h-4" />
              Pohotovosť
            </a>
            <button className="md:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1E293B] px-6 py-4 flex flex-col gap-4 text-sm font-medium text-white/70">
            <a href="#pohotovost" onClick={() => setMobileOpen(false)}>Pohotovosť</a>
            <a href="#navod" onClick={() => setMobileOpen(false)}>Ako sa pripraviť</a>
            <a href="#sluzby" onClick={() => setMobileOpen(false)}>Služby</a>
            <a href="#kontakt" onClick={() => setMobileOpen(false)}>Kontakt</a>
            <a href={EMERGENCY_HREF} className="flex items-center gap-2 bg-[#DC2626] text-white font-bold px-5 py-3 rounded-xl justify-center">
              <Phone className="w-4 h-4" /> Volajte pohotovosť
            </a>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-[#1E293B] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div>
            {/* Veterinary emergency — we're here when you need us most */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight text-balance mb-6">
              Veterinárna pohotovosť —<br />
              <span className="text-[#DC2626]">sme tu, keď to</span><br />
              najviac potrebujete
            </h1>
            <p className="text-white/60 leading-relaxed mb-8 text-lg">
              {/* Available 24 hours a day, 7 days a week. Call us immediately — we'll advise you even before you arrive. */}
              K dispozícii 24 hodín denne, 7 dní v týždni. Zavolajte nám okamžite — poradíme vám ešte pred príchodom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={EMERGENCY_HREF}
                className="inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-[#b91c1c] transition-colors pulse-ring"
              >
                <Phone className="w-5 h-5" />
                Volať pohotovosť
              </a>
              <a
                href="#kontakt"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#3B82F6] text-[#3B82F6] font-semibold px-7 py-4 rounded-xl hover:bg-[#3B82F6]/10 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Bežný termín
              </a>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Clock, label: 'Odozva do 15 min' },
                { icon: Shield, label: 'Dostupné 24/7' },
                { icon: Navigation, label: 'GPS navigácia' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-semibold text-white/60">
                  <Icon className="w-4 h-4 text-[#3B82F6]" />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80"
              alt="Veterinárny pohotovostný tím pri práci"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </section>

      {/* ── When to Call Immediately ──────────────────────────────── */}
      <section id="pohotovost" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-l-4 border-[#DC2626] pl-6 mb-12">
            <h2 className="text-3xl font-bold text-[#1E293B]">Kedy okamžite volať</h2>
            {/* Call immediately — do not wait */}
            <p className="text-[#1E293B]/60 mt-1">Volajte ihneď — nečakajte</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Activity, title: 'Ťažké dýchanie', desc: 'Zrýchlené, ťažké alebo nezvyčajné dýchanie' },
              { icon: AlertTriangle, title: 'Požitie toxínu', desc: 'Akékoľvek podozrenie na otravu alebo toxín' },
              { icon: Droplets, title: 'Silné krvácanie', desc: 'Vonkajšie alebo vnútorné krvácanie' },
              { icon: Car, title: 'Nehoda / Zrazenie', desc: 'Trauma po dopravnej nehode alebo páde' },
              { icon: Activity, title: 'Záchvaty', desc: 'Kŕče, strata vedomia alebo dezorientácia' },
              { icon: Heart, title: 'Pôrodné komplikácie', desc: 'Problémy počas pôrodu, slabosť šteniat' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-6 border-l-4 border-[#DC2626] bg-[#F8FAFC]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <h3 className="font-bold text-[#1E293B]">{title}</h3>
                </div>
                <p className="text-sm text-[#1E293B]/60 leading-relaxed mb-4">{desc}</p>
                <a
                  href={EMERGENCY_HREF}
                  className="inline-flex items-center gap-1.5 bg-[#DC2626] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#b91c1c] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Volajte: {EMERGENCY_PHONE}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pre-Arrival Guide ─────────────────────────────────────── */}
      <section id="navod" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            {/* How to prepare */}
            <h2 className="text-3xl font-bold text-[#1E293B]">Ako sa pripraviť</h2>
            <p className="text-[#1E293B]/55 mt-2">Štyri kroky pre bezpečný príchod</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', icon: Phone, title: 'Zavolajte nám', desc: 'Popíšte stav zvieraťa — poradíme čo robiť ešte pred príchodom.', color: '#DC2626' },
              { step: '2', icon: Car, title: 'Bezpečný transport', desc: 'Ako bezpečne previezť zranené zviera. Neimobilizujte pri kŕčoch.', color: '#F59E0B' },
              { step: '3', icon: Navigation, title: 'Príchod ku nám', desc: 'Navigácia priamo k zadnému vchodu. Parkovanie zdarma 24/7.', color: '#3B82F6' },
              { step: '4', icon: Activity, title: 'Okamžitá starostlivosť', desc: 'Pohotovostné prípady ošetrujeme do 5 minút od príchodu.', color: '#10B981' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="bg-white rounded-xl p-6 border border-slate-100 relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                  style={{ backgroundColor: color }}
                >
                  {step}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <h3 className="font-bold text-[#1E293B]">{title}</h3>
                </div>
                <p className="text-sm text-[#1E293B]/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section id="sluzby" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-10">Naše služby</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Emergency services */}
            <div className="rounded-xl p-7 bg-[#DC2626]/5 border border-[#DC2626]/20">
              <h3 className="font-bold text-lg text-[#DC2626] mb-5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Pohotovostné služby
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  { svc: 'Akútna chirurgia', price: 'od 200 €' },
                  { svc: 'Intenzívna starostlivosť', price: 'od 80 €/h' },
                  { svc: 'Toxikológia', price: 'od 50 €' },
                  { svc: 'Krvná transfúzia', price: 'od 120 €' },
                  { svc: 'Stabilizácia pacienta', price: 'od 50 €' },
                ].map(({ svc, price }) => (
                  <li key={svc} className="flex items-center justify-between py-2.5 border-b border-[#DC2626]/10 last:border-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                      <ChevronRight className="w-4 h-4 text-[#DC2626]" />
                      {svc}
                    </div>
                    <span className="text-sm font-bold text-[#DC2626]">{price}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Regular services */}
            <div className="rounded-xl p-7 bg-[#3B82F6]/5 border border-[#3B82F6]/20">
              <h3 className="font-bold text-lg text-[#3B82F6] mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bežné služby
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  { svc: 'Preventívna prehliadka', price: '35 €' },
                  { svc: 'Vakcinácia', price: 'od 20 €' },
                  { svc: 'Dentálna hygiena', price: 'od 45 €' },
                  { svc: 'Kastrácia / Sterilizácia', price: 'od 80 €' },
                  { svc: 'Laboratórna diagnostika', price: 'od 25 €' },
                ].map(({ svc, price }) => (
                  <li key={svc} className="flex items-center justify-between py-2.5 border-b border-[#3B82F6]/10 last:border-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                      <ChevronRight className="w-4 h-4 text-[#3B82F6]" />
                      {svc}
                    </div>
                    <span className="text-sm font-bold text-[#3B82F6]">{price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Doctors on Duty ─────────────────────────────────���─────── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-10">
            {/* Currently on duty */}
            Práve slúžia
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'MVDr. Jana Kováčová', spec: 'Chirurgia & urgentná medicína', status: 'available', initials: 'JK', bg: '1E293B' },
              { name: 'MVDr. Peter Horváth', spec: 'Interna & diagnostika', status: 'busy', initials: 'PH', bg: '3B82F6' },
              { name: 'MVDr. Mária Varga', spec: 'Dermatológia & intenzívna starostlivosť', status: 'available', initials: 'MV', bg: '1E293B' },
            ].map(({ name, spec, status, initials, bg }) => (
              <div key={name} className="bg-white rounded-xl p-6 border border-slate-100 flex items-start gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${initials}&background=${bg}&color=fff&size=56&bold=true`}
                  alt={name}
                  className="w-14 h-14 rounded-full shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-[#1E293B] text-sm">{name}</h3>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: status === 'available' ? '#10B981' : '#F59E0B' }}
                      aria-label={status === 'available' ? 'Dostupný' : 'Zaneprázdnený'}
                    />
                  </div>
                  <p className="text-xs text-[#1E293B]/55 mb-2">{spec}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                    backgroundColor: status === 'available' ? '#10B981/10' : '#F59E0B/10',
                    color: status === 'available' ? '#059669' : '#d97706',
                    background: status === 'available' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  }}>
                    {status === 'available' ? 'Dostupný' : 'Zaneprázdnený'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location & Hours ──────────────────────────────────────── */}
      <section id="kontakt" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-[#1E293B] mb-6">Kde nás nájdete</h2>
            {/* Map placeholder */}
            <div className="w-full aspect-video rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-sm text-[#1E293B]/30 mb-6">
              Google Maps embed
            </div>
            <div className="flex flex-col gap-3 mb-6">
              {[
                { icon: MapPin, val: 'Lekárska 8, 811 04 Bratislava' },
                { icon: Navigation, val: '48.1486° N, 17.1077° E (GPS)' },
                { icon: Car, val: 'Parkovisko: 20 miest zdarma, 24/7' },
              ].map(({ icon: Icon, val }) => (
                <div key={val} className="flex items-center gap-3 text-sm text-[#1E293B]/70">
                  <Icon className="w-4 h-4 text-[#DC2626] shrink-0" />
                  {val}
                </div>
              ))}
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#3B82F6] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2563eb] transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Navigovať k nám
            </a>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1E293B] mb-6">Ordinačné hodiny</h2>
            <table className="w-full text-sm mb-4">
              <tbody>
                {[
                  { day: 'Pondelok – Piatok', time: '8:00 – 20:00', emerg: false },
                  { day: 'Sobota', time: '9:00 – 14:00', emerg: false },
                  { day: 'Nedeľa', time: 'Pohotovosť', emerg: true },
                  { day: 'Sviatky', time: 'Pohotovosť', emerg: true },
                  { day: 'POHOTOVOSŤ 24/7', time: EMERGENCY_PHONE, emerg: true },
                ].map(({ day, time, emerg }) => (
                  <tr key={day} className={`border-b last:border-0 ${emerg ? 'bg-[#DC2626]/5' : ''}`}>
                    <td className={`py-3 pr-4 font-medium ${emerg ? 'text-[#DC2626]' : 'text-[#1E293B]/70'}`}>{day}</td>
                    <td className={`py-3 text-right font-bold ${emerg ? 'text-[#DC2626]' : 'text-[#1E293B]'}`}>
                      {emerg && day === 'POHOTOVOSŤ 24/7' ? (
                        <a href={EMERGENCY_HREF} className="hover:underline">{time}</a>
                      ) : time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[#1E293B]/40 italic">
              {/* Emergency surcharge applies outside regular hours. */}
              Mimo bežných hodín sa účtuje pohotovostný príplatok 30 €.
            </p>
          </div>
        </div>
      </section>

      {/* ── Emergency Testimonials ────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-10">Príbehy z pohotovosti</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { text: 'Zachránili nám Fíkuša o 2. hodine v noci. Volali sme z auta a doktor bol pri dverách keď sme prišli.', name: 'Andrea K.' },
              { text: 'Náš pes prehltol cudzí predmet. Reakcia bola bleskurýchla, operácia sa podarila. Navždy im vďačná.', name: 'Tomáš M.' },
              { text: 'Prišli sme v panice o polnoci. Celý tím bol pokojný, profesionálny a náš Leo sa zotavil.', name: 'Lucia B.' },
            ].map(({ text, name }) => (
              <div key={name} className="bg-white rounded-xl p-6 border-l-4 border-[#DC2626]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-[#1E293B]/70 leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <span className="font-semibold text-sm text-[#1E293B]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Pricing ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-3">Cenník pohotovostných služieb</h2>
          <p className="text-[#1E293B]/55 text-sm mb-10">
            {/* Prices are indicative. You will receive an exact quote before any procedure. */}
            Ceny sú orientačné, presnú kalkuláciu dostanete pred zákrokom.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Pohotovostný príplatok', price: '30 €', desc: 'Mimo bežných hodín' },
              { title: 'Akútne vyšetrenie', price: '50 €', desc: 'Kompletné vyšetrenie ihneď' },
              { title: 'Pohotovostná chirurgia', price: 'od 200 €', desc: 'Závisí od zákroku' },
              { title: 'Hospitalizácia', price: '40 €/noc', desc: 'Vrátane monitorovania' },
            ].map(({ title, price, desc }) => (
              <div key={title} className="rounded-xl p-6 bg-[#F8FAFC] border border-slate-100">
                <p className="text-2xl font-bold text-[#DC2626] mb-2">{price}</p>
                <h3 className="font-semibold text-[#1E293B] mb-1">{title}</h3>
                <p className="text-xs text-[#1E293B]/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#1E293B] py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Núdzový prípad?</p>
            <h3 className="text-3xl font-bold text-white mb-4">Pohotovosť</h3>
            <a
              href={EMERGENCY_HREF}
              className="inline-flex items-center gap-3 bg-[#DC2626] text-white font-bold text-xl px-8 py-4 rounded-xl hover:bg-[#b91c1c] transition-colors pulse-ring"
            >
              <Phone className="w-6 h-6" />
              {EMERGENCY_PHONE}
            </a>
          </div>
          <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Plánovaná návšteva?</p>
            <h3 className="text-3xl font-bold text-white mb-4">Bežný termín</h3>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-3 bg-[#3B82F6] text-white font-bold text-xl px-8 py-4 rounded-xl hover:bg-[#2563eb] transition-colors"
            >
              <Calendar className="w-6 h-6" />
              Rezervovať online
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#DC2626] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">VetPohotovosť</span>
            </div>
            {/* Emergency phone prominent in footer */}
            <a href={EMERGENCY_HREF} className="flex items-center gap-2 text-[#DC2626] font-bold text-lg hover:opacity-80 transition-opacity mb-4">
              <Phone className="w-5 h-5" />
              {EMERGENCY_PHONE}
            </a>
            <p className="text-white/40 text-xs leading-relaxed">
              {/* In the event of a life-threatening emergency, call emergency services immediately. */}
              V prípade život ohrozujúceho stavu volajte pohotovosť ihneď.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Rýchle odkazy</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/40">
              <li><a href="#pohotovost" className="hover:text-white transition-colors">Kedy volať</a></li>
              <li><a href="#navod" className="hover:text-white transition-colors">Ako sa pripraviť</a></li>
              <li><a href="#sluzby" className="hover:text-white transition-colors">Služby & ceny</a></li>
              <li><a href="#kontakt" className="hover:text-white transition-colors">Mapa & hodiny</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Kontakt</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/40">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#DC2626] shrink-0" /> Lekárska 8, Bratislava</li>
              <li><a href={EMERGENCY_HREF} className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 text-[#DC2626] shrink-0" /> {EMERGENCY_PHONE}</a></li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#3B82F6] shrink-0" /> Pohotovosť 24/7</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <span>&copy; 2025 VetPohotovosť. Všetky práva vyhradené.</span>
          <a href="#" className="hover:text-white/50 transition-colors">Vytvorené s OpenVPM</a>
        </div>
      </footer>

      {/* Schema.org EmergencyService markup */}
      {/* <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["VeterinaryCare", "EmergencyService"],
        "name": "VetPohotovosť",
        "openingHours": ["Mo-Su 00:00-24:00"],
        "telephone": "+421900000000",
        "address": { "@type": "PostalAddress", "streetAddress": "Lekárska 8", "addressLocality": "Bratislava" }
      })}</script> */}
    </div>
  )
}
