import { BookingCTA, ContactBlock, OpeningHoursTable } from "@/components/openvpm";
import type { ClinicContent } from "@/lib/templates/adapter";
import { templateMetadata } from "@/lib/templates/metadata";

interface TemplateProps {
  content: ClinicContent;
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null };
  websiteSlug: string;
}

export function EmergencyFirstTemplate({ content, practice, websiteSlug }: TemplateProps) {
  const palette = templateMetadata["emergency-first"].palette;

  // Find emergency phone from opening hours or content
  const emergencyPhone = content.hours.find((h) => h.isEmergency)?.time ?? practice.phone ?? "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.bg, fontFamily: templateMetadata["emergency-first"].fontFamily }}>
      {/* Emergency banner */}
      <div style={{ backgroundColor: palette.accent }} className="px-6 py-2 text-center text-sm font-bold text-white">
        🚨 POHOTOVOSŤ: {emergencyPhone}
      </div>

      {/* Header */}
      <header className="border-b" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold" style={{ color: palette.accent }}>{content.clinicName}</span>
          <BookingCTA accentColor={palette.accent} size="sm" />
        </div>
      </header>

      {/* Hero — emergency-first style */}
      <section className="px-6 py-16 text-center" style={{ backgroundColor: palette.muted }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-bold text-white" style={{ backgroundColor: palette.accent }}>
            🚨 24/7 Pohotovosť
          </div>
          <h1 className="text-4xl font-bold" style={{ color: palette.accent }}>{content.heroHeadline}</h1>
          {content.heroSubtext && <p className="mt-4 text-lg text-muted-foreground">{content.heroSubtext}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${emergencyPhone}`}
              className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-bold text-white"
              style={{ backgroundColor: palette.accent }}
            >
              📞 Pohotovosť: {emergencyPhone}
            </a>
            <BookingCTA accentColor={palette.accent} size="md" />
          </div>
        </div>
      </section>

      {/* Opening Hours — prominent */}
      {content.hours.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-xl">
            <h2 className="text-center text-2xl font-bold" style={{ color: palette.accent }}>Ordinačné hodiny</h2>
            <div className="mt-8">
              <OpeningHoursTable
                hours={content.hours}
                showEmergency
                emergencyPhone={emergencyPhone}
                accentColor={palette.accent}
              />
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {content.services.length > 0 && (
        <section className="px-6 py-16" style={{ backgroundColor: palette.muted }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold" style={{ color: palette.accent }}>Naše služby</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((s, i) => (
                <div key={i} className="rounded-sm border p-4" style={{ borderColor: palette.border }}>
                  <h3 className="font-semibold">{s.title}</h3>
                  {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold" style={{ color: palette.accent }}>Kontakt</h2>
          <div className="mt-8 flex justify-center">
            <ContactBlock
              address={content.address}
              phone={content.phone}
              email={content.email}
              googleMapsUrl={content.googleMapsUrl}
              accentColor={palette.accent}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: palette.border }}>
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {content.clinicName}
        </div>
      </footer>
    </div>
  );
}
