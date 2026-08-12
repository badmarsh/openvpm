/**
 * FearFreeBadge
 * Three visual styles matching the 5 templates:
 *  - "minimal"  → T1 (Clean & Modern) + T3 (Clinical)
 *  - "full"     → T2 (Warm & Trusting)
 *  - "playful"  → T4 (Playful & Friendly)
 * Usage:
 *   import { FearFreeBadge } from '@/components/openvpm'
 */

import { ShieldCheck, Heart, Sparkles } from 'lucide-react'

export type FearFreeBadgeVariant = 'minimal' | 'full' | 'playful'

export interface FearFreeBadgeProps {
  variant?: FearFreeBadgeVariant
  className?: string
}

export function FearFreeBadge({ variant = 'minimal', className = '' }: FearFreeBadgeProps) {
  if (variant === 'minimal') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}
        style={{
          borderColor: '#10B981',
          color: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.08)',
        }}
        role="img"
        aria-label="Fear-Free certifikovaná klinika"
      >
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        Fear-Free
      </span>
    )
  }

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex flex-col items-center gap-2 rounded-2xl px-6 py-4 ${className}`}
        style={{ backgroundColor: '#FFE4D6', color: '#C4704B' }}
        role="img"
        aria-label="Fear-Free certifikovaná klinika"
      >
        <Heart className="w-7 h-7 fill-current" aria-hidden="true" />
        <div className="text-center">
          <p className="font-bold text-sm leading-none">Fear-Free</p>
          <p className="text-xs mt-0.5 opacity-70">Certifikovaná klinika</p>
        </div>
      </div>
    )
  }

  // playful
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-sm ${className}`}
      style={{ backgroundColor: '#E8D5F5', color: '#2D3436' }}
      role="img"
      aria-label="Fear-Free certifikovaná klinika"
    >
      <Sparkles className="w-4 h-4" style={{ color: '#FF6B6B' }} aria-hidden="true" />
      Fear-Free klinika
      <span
        className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: '#FF6B6B', color: '#fff' }}
      >
        CERT
      </span>
    </div>
  )
}
