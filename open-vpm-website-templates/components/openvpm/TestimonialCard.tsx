/**
 * TestimonialCard
 * Reusable across all 5 templates. Renders star rating, quote, author name
 * and optional source badge (Google / Facebook).
 * Usage:
 *   import { TestimonialCard } from '@/components/openvpm'
 */

import { Star } from 'lucide-react'

export type TestimonialSource = 'google' | 'facebook'

export interface TestimonialCardProps {
  text: string
  author: string
  stars?: 1 | 2 | 3 | 4 | 5
  source?: TestimonialSource
  /** Card background colour */
  background?: string
  /** Star / accent colour */
  accentColor?: string
  className?: string
}

const SOURCE_LABEL: Record<TestimonialSource, string> = {
  google: 'Google',
  facebook: 'Facebook',
}

export function TestimonialCard({
  text,
  author,
  stars = 5,
  source,
  background = '#fff',
  accentColor = '#7BA68C',
  className = '',
}: TestimonialCardProps) {
  return (
    <article
      className={`rounded-2xl p-7 flex flex-col gap-4 ${className}`}
      style={{ backgroundColor: background }}
      aria-label={`Recenzia od ${author}`}
    >
      {/* Stars */}
      <div className="flex gap-1" aria-label={`${stars} z 5 hviezd`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4"
            style={{
              fill: i < stars ? '#F59E0B' : 'transparent',
              color: i < stars ? '#F59E0B' : '#D1D5DB',
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-sm leading-relaxed flex-1 opacity-75">
        &ldquo;{text}&rdquo;
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="font-semibold text-sm">{author}</p>
        {source && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded border"
            style={{
              borderColor: accentColor,
              color: accentColor,
              backgroundColor: `${accentColor}10`,
            }}
          >
            {SOURCE_LABEL[source]}
          </span>
        )}
      </div>
    </article>
  )
}
