import { BookingCTA, ContactBlock, FearFreeBadge, ServiceCard, TestimonialCard } from "@/components/openvpm";
import type { ClinicContent } from "@/lib/templates/adapter";
import { templateMetadata } from "@/lib/templates/metadata";

interface TemplateProps {
  content: ClinicContent;
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null };
  websiteSlug: string;
}

export function PlayfulFriendlyTemplate({ content, practice, websiteSlug }: TemplateProps) {
  const palette = templateMetadata["playful-friendly"].palette;

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.bg, fontFamily: templateMetadata["playful-friendly"].fontFamily }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-2xl font-bold" style={{ color: palette.accent }}>🐾 {content.clinicName}</span>
          <BookingCTA accentColor={palette.accent} size="sm" />
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center" style={{ backgroundColor: palette.muted }}>
        <div className="mx-auto max-w-3xl">
          <FearFreeBadge variant="playful" accentColor={palette.accent} />
          <h1 className="mt-6 text-4xl font-bold" style={{ color: palette.accent }}>{content.heroHeadline}</h1>
          {content.heroSubtext && <p className="mt-4 text-lg text-muted-foreground">{content.heroSubtext}</p>}
          <div className="mt-8">
            <BookingCTA accentColor={palette.accent} size="lg" />
          </div>
        </div>
      </section>

      {/* Services */}
      {content.services.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold" style={{ color: palette.accent }}>Čo pre vás robíme 🐱</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <h2 className="text-center text-3xl font-bold" style={{ color: palette.accent }}>Naši klienti ❤️</h2>
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
          <h2 className="text-center text-3xl font-bold" style={{ color: palette.accent }}>Príďte nás navštíviť! 📍</h2>
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
      <footer className="px-6 py-8" style={{ backgroundColor: palette.accent }}>
        <div className="mx-auto max-w-6xl text-center text-sm text-white">
          © {new Date().getFullYear()} {content.clinicName} 🐾
        </div>
      </footer>
    </div>
  );
}
