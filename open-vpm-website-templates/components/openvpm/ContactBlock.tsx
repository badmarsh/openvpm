/**
 * ContactBlock
 * Renders address, phone, email and optional Google Maps link
 * with lucide-react icons. Phone uses tel: and email uses mailto:.
 * Usage:
 *   import { ContactBlock } from '@/components/openvpm'
 */

import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'

export interface ContactBlockProps {
  address: string
  phone: string
  email: string
  googleMapsUrl?: string
  /** Icon & link accent colour */
  accentColor?: string
  /** Card background — set to 'transparent' to skip */
  background?: string
}

export function ContactBlock({
  address,
  phone,
  email,
  googleMapsUrl,
  accentColor = '#7BA68C',
  background = 'transparent',
}: ContactBlockProps) {
  const rows: { icon: React.ElementType; label: string; value: string; href?: string }[] = [
    {
      icon: MapPin,
      label: 'Adresa',
      value: address,
      href: googleMapsUrl,
    },
    {
      icon: Phone,
      label: 'Telefón',
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
    },
  ]

  return (
    <div
      className="flex flex-col gap-4"
      style={background !== 'transparent' ? { background, borderRadius: '1rem', padding: '1.5rem' } : undefined}
    >
      {rows.map(({ icon: Icon, label, value, href }) => (
        <div key={label} className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium opacity-50 mb-0.5">{label}</p>
            {href ? (
              <a
                href={href}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                target={label === 'Adresa' && googleMapsUrl ? '_blank' : undefined}
                rel={label === 'Adresa' && googleMapsUrl ? 'noopener noreferrer' : undefined}
              >
                {value}
                {label === 'Adresa' && googleMapsUrl && (
                  <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-40" aria-hidden="true" />
                )}
              </a>
            ) : (
              <p className="text-sm font-medium">{value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
