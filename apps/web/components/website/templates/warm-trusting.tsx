import { BookingCTA, ContactBlock, TestimonialCard } from "@/components/openvpm";
import type { ClinicContent } from "@/lib/templates/adapter";
import { templateMetadata } from "@/lib/templates/metadata";

interface TemplateProps {
  content: ClinicContent;
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null };
  websiteSlug: string;
}

export function WarmTrustingTemplate({ content, practice, websiteSlug }: TemplateProps) {
  const palette = templateMetadata["warm-trusting"].palette;

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.bg, fontFamily: templateMetadata["warm-trusting"].fontFamily }}>
      {/* Header */}
      <header style={{ backgroundColor: palette.accent }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-white">{content.clinicName}</span>
          <BookingCTA accentColor={palette.accent} size="sm" />
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <h1 className="text-4xl font-bold" style={{ color: palette.accent }}>{content.heroHeadline}</h1>
        {content.heroSubtext && <p className="mt-4 text-lg text-muted-foreground">{content.heroSubtext}</p>}
        <div className="mt-8">
          <BookingCTA accentColor={palette.accent} size="lg" />
        </div>
      </section>

      {/* Testimonials first — warm/trusting style emphasizes reviews */}
      {content.testimonials.length > 0 && (
        <section className="px-6 py-20" style={{ backgroundColor: palette.muted }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold" style={{ color: palette.accent }}>Naši klienti nám dôverujú</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.testimonials.map((t, i) => (
                <TestimonialCard key={i} accentColor={palette.accent} {...t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {content.services.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold" style={{ color: palette.accent }}>Naše služby</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {content.services.map((s, i) => (
                <div key={i} className="rounded-lg border p-6" style={{ backgroundColor: palette.card, borderColor: palette.border }}>
                  <h3 className="font-semibold" style={{ color: palette.accent }}>{s.title}</h3>
                  {s.description && <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>}
                  {s.price && <p className="mt-2 text-sm font-medium" style={{ color: palette.accent }}>{s.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="px-6 py-20" style={{ backgroundColor: palette.muted }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold" style={{ color: palette.accent }}>Kontakt</h2>
          <div className="mt-10 flex justify-center">
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
      <footer style={{ backgroundColor: palette.accent }} className="px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-white">
          © {new Date().getFullYear()} {content.clinicName}
        </div>
      </footer>
    </div>
  );
}
