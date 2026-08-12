/**
 * ServiceCard
 * Three visual variants to match the 5 templates:
 *  - "minimal"  → T1 (Clean & Modern) + T3 (Clinical)
 *  - "detailed" → T2 (Warm & Trusting) — shows price prominently
 *  - "playful"  → T4 (Playful & Friendly) — coloured background, emoji-friendly
 * Usage:
 *   import { ServiceCard } from '@/components/openvpm'
 */

import type { LucideIcon } from 'lucide-react'

export type ServiceCardVariant = 'minimal' | 'detailed' | 'playful'

export interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  price?: string
  variant?: ServiceCardVariant
  /** Accent / icon colour — used in minimal & detailed */
  accentColor?: string
  /** Background colour — used in playful */
  cardBackground?: string
  /** Text colour — used in playful */
  cardTextColor?: string
  className?: string
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  price,
  variant = 'minimal',
  accentColor = '#7BA68C',
  cardBackground = '#fff',
  cardTextColor = '#1B2A4A',
  className = '',
}: ServiceCardProps) {
  if (variant === 'minimal') {
    return (
      <div
        className={`bg-white rounded-2xl p-7 border border-gray-100 group hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${className}`}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-[#1B2A4A] mb-2">{title}</h3>
        <p className="text-sm text-[#1B2A4A]/55 leading-relaxed">{description}</p>
        {price && (
          <p className="text-sm font-bold mt-4" style={{ color: accentColor }}>
            od {price}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div
        className={`rounded-2xl p-6 border flex flex-col gap-3 ${className}`}
        style={{ backgroundColor: cardBackground, borderColor: `${accentColor}25` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} aria-hidden="true" />
          </div>
          {price && (
            <span className="font-bold text-sm" style={{ color: accentColor }}>
              od {price}
            </span>
          )}
        </div>
        <h3 className="font-semibold" style={{ color: cardTextColor }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: cardTextColor, opacity: 0.6 }}>
          {description}
        </p>
      </div>
    )
  }

  // playful
  return (
    <div
      className={`rounded-3xl p-7 cursor-default transition-transform hover:-rotate-1 hover:scale-[1.02] duration-200 ${className}`}
      style={{ backgroundColor: cardBackground, color: cardTextColor }}
    >
      <Icon className="w-8 h-8 mb-4 opacity-90" aria-hidden="true" />
      <h3 className="font-bold text-xl mb-1">{title}</h3>
      <p className="text-sm opacity-80 leading-relaxed">{description}</p>
      {price && (
        <p className="text-sm font-bold mt-4 opacity-90">od {price}</p>
      )}
    </div>
  )
}
