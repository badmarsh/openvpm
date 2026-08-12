/**
 * BookingCTA
 * Full-width call-to-action banner. Variant colour matches each template:
 *   navy      → T1 (Clean & Modern)
 *   terracotta → T2 (Warm & Trusting)
 *   blue      → T3 (Clinical & Professional)
 *   coral     → T4 (Playful & Friendly)
 *   red       → T5 (Emergency First)
 * Usage:
 *   import { BookingCTA } from '@/components/openvpm'
 */

import { Phone, Calendar } from 'lucide-react'

export type BookingCTAVariant = 'navy' | 'terracotta' | 'blue' | 'coral' | 'red'

export interface BookingCTAProps {
  phone: string
  onlineBookingUrl?: string
  variant?: BookingCTAVariant
  /** Override headline */
  headline?: string
  /** Override subtext */
  subtext?: string
}

const VARIANT_STYLES: Record<
  BookingCTAVariant,
  { bg: string; text: string; secondaryBg: string; secondaryText: string; secondaryBorder: string }
> = {
  navy: {
    bg: '#1B2A4A',
    text: '#fff',
    secondaryBg: '#7BA68C',
    secondaryText: '#fff',
    secondaryBorder: '#7BA68C',
  },
  terracotta: {
    bg: '#C4704B',
    text: '#fff',
    secondaryBg: 'transparent',
    secondaryText: '#fff',
    secondaryBorder: 'rgba(255,255,255,0.6)',
  },
  blue: {
    bg: '#2563EB',
    text: '#fff',
    secondaryBg: 'transparent',
    secondaryText: '#fff',
    secondaryBorder: 'rgba(255,255,255,0.5)',
  },
  coral: {
    bg: '#FF6B6B',
    text: '#fff',
    secondaryBg: '#4ECDC4',
    secondaryText: '#fff',
    secondaryBorder: '#4ECDC4',
  },
  red: {
    bg: '#DC2626',
    text: '#fff',
    secondaryBg: 'transparent',
    secondaryText: '#fff',
    secondaryBorder: 'rgba(255,255,255,0.5)',
  },
}

export function BookingCTA({
  phone,
  onlineBookingUrl,
  variant = 'navy',
  headline = 'Potrebujete termín?',
  subtext = 'Rezervujte si návštevu online alebo nám zavolajte priamo.',
}: BookingCTAProps) {
  const s = VARIANT_STYLES[variant]

  return (
    <section
      className="w-full py-16 px-6"
      style={{ backgroundColor: s.bg }}
      aria-labelledby="cta-heading"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          id="cta-heading"
          className="text-3xl md:text-4xl font-bold mb-3 text-balance"
          style={{ color: s.text }}
        >
          {headline}
        </h2>
        <p className="mb-10 text-lg" style={{ color: s.text, opacity: 0.65 }}>
          {subtext}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {onlineBookingUrl && (
            <a
              href={onlineBookingUrl}
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full text-sm transition-opacity hover:opacity-85"
              style={{ backgroundColor: s.secondaryBg, color: s.secondaryText, border: `2px solid ${s.secondaryBorder}` }}
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              Rezervovať online
            </a>
          )}
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full text-sm border-2 transition-opacity hover:opacity-85"
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              color: s.text,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
            aria-label={`Zavolajte nám: ${phone}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {phone}
          </a>
        </div>
      </div>
    </section>
  )
}
