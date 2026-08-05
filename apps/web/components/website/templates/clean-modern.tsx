import { BookingCTA, ContactBlock, ServiceCard, TestimonialCard } from "@/components/openvpm";
import type { ClinicContent } from "@/lib/templates/adapter";
import { templateMetadata } from "@/lib/templates/metadata";

interface TemplateProps {
  content: ClinicContent;
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null };
  websiteSlug: string;
}

export function CleanModernTemplate({ content, practice, websiteSlug }: TemplateProps) {
  const palette = templateMetadata["clean-modern"].palette;

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.bg, fontFamily: templateMetadata["clean-modern"].fontFamily }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold" style={{ color: palette.accent }}>{content.clinicName}</span>
          <BookingCTA href={`/site/${websiteSlug}/contact`} accentColor={palette.accent} size="sm" />
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center" style={{ backgroundColor: palette.muted }}>
        <h1 className="text-5xl font-bold tracking-tight" style={{ color: palette.accent }}>{content.heroHeadline}</h1>
        {content.heroSubtext && <p className="mt-4 text-xl text-muted-foreground">{content.heroSubtext}</p>}
        <div className="mt-8">
          <BookingCTA accentColor={palette.accent} size="lg" />
        </div>
      </section>

      {/* Services */}
      {content.services.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold">Naše služby</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.services.map((s, i) => (
                <ServiceCard key={i} accentColor={palette.accent} {...s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {content.testimonials.length > 0 && (
        <section className="px-6 py-20" style={{ backgroundColor: palette.muted }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold">Čo hovoria naši klienti</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.testimonials.map((t, i) => (
                <TestimonialCard key={i} accentColor={palette.accent} {...t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Kontakt</h2>
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
      <footer className="border-t px-6 py-8" style={{ borderColor: palette.border }}>
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {content.clinicName}
        </div>
      </footer>
    </div>
  );
}
