/**
 * Dynamic OG Image Generator — /og?template=template-1
 * Uses @vercel/og (ImageResponse) — no external images, pure CSS/text layout.
 * Returns a 1200×630 PNG.
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getTemplateById, TEMPLATES } from '@/lib/templates/metadata'

export const runtime = 'edge'

// Accent strip height in the layout
const STRIP_H = 10

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('template') ?? 'template-1'
  const lang = (searchParams.get('lang') ?? 'sk') as 'sk' | 'en' | 'hu'

  const tmpl = getTemplateById(id) ?? TEMPLATES[0]

  const bg      = tmpl.palette.bg
  const primary = tmpl.palette.primary
  const accent  = tmpl.palette.accent

  const name    = tmpl.name[lang]    ?? tmpl.name.sk
  const tagline = tmpl.tagline[lang] ?? tmpl.tagline.sk

  // Tags shown as pills — pick first 3
  const pills = tmpl.tags.slice(0, 3)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bg,
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Top accent strip ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${STRIP_H}px`,
            backgroundColor: accent,
          }}
        />

        {/* ── Background geometric shape (decorative) ── */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            backgroundColor: accent,
            opacity: 0.07,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            backgroundColor: primary,
            opacity: 0.05,
          }}
        />

        {/* ── Main content ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            padding: '60px 80px 40px',
          }}
        >
          {/* OpenVPM watermark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '36px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Paw icon — simple SVG inline */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <ellipse cx="5" cy="9" rx="2" ry="2.8" />
                <ellipse cx="10" cy="6.5" rx="2" ry="2.8" />
                <ellipse cx="14.5" cy="6.5" rx="2" ry="2.8" />
                <ellipse cx="19.5" cy="9" rx="2" ry="2.8" />
                <path d="M12 10c-3 0-6.5 2.5-6.5 6 0 2 1.5 4 6.5 4s6.5-2 6.5-4c0-3.5-3.5-6-6.5-6z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: primary,
                letterSpacing: '0.05em',
                opacity: 0.5,
              }}
            >
              OpenVPM
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: accent,
                backgroundColor: `${accent}18`,
                padding: '3px 10px',
                borderRadius: '20px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {tmpl.id}
            </span>
          </div>

          {/* Template name */}
          <div
            style={{
              fontSize: '60px',
              fontWeight: 800,
              color: primary,
              lineHeight: 1.1,
              marginBottom: '20px',
              maxWidth: '760px',
            }}
          >
            {name}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              color: primary,
              opacity: 0.55,
              lineHeight: 1.4,
              maxWidth: '680px',
              marginBottom: '40px',
            }}
          >
            {tagline}
          </div>

          {/* Pills row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {pills.map(tag => (
              <div
                key={tag}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: accent,
                  backgroundColor: `${accent}18`,
                  padding: '6px 16px',
                  borderRadius: '20px',
                  letterSpacing: '0.04em',
                }}
              >
                {tag}
              </div>
            ))}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: primary,
                backgroundColor: `${primary}10`,
                padding: '6px 16px',
                borderRadius: '20px',
                letterSpacing: '0.04em',
                opacity: 0.6,
              }}
            >
              Fear-Free
            </div>
          </div>
        </div>

        {/* ── Right panel — palette swatch ── */}
        <div
          style={{
            position: 'absolute',
            right: '80px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
          }}
        >
          {[
            { label: 'bg',      color: bg      },
            { label: 'primary', color: primary },
            { label: 'accent',  color: accent  },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '12px', color: primary, opacity: 0.35 }}>{color}</span>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: color,
                  border: '2px solid rgba(0,0,0,0.08)',
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px 28px',
          }}
        >
          <span style={{ fontSize: '13px', color: primary, opacity: 0.3 }}>
            openvpm.vercel.app · Veterinary Website Templates
          </span>
          <span style={{ fontSize: '13px', color: primary, opacity: 0.3 }}>
            {tmpl.slug}
          </span>
        </div>

        {/* ── Bottom accent strip ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${STRIP_H}px`,
            backgroundColor: accent,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
