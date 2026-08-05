import { BookingCTA, ContactBlock, ServiceCard } from "@/components/openvpm";
import type { ClinicContent } from "@/lib/templates/adapter";
import { templateMetadata } from "@/lib/templates/metadata";

interface TemplateProps {
  content: ClinicContent;
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null };
  websiteSlug: string;
}

export function ClinicalProfessionalTemplate({ content, practice, websiteSlug }: TemplateProps) {
  const palette = templateMetadata["clinical-professional"].palette;

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.bg, fontFamily: templateMetadata["clinical-professional"].fontFamily }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold" style={{ color: palette.accent }}>{content.clinicName}</span>
          <nav className="hidden gap-6 md:flex">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground">Služby</a>
            <a href="#team" className="text-sm font-medium text-muted-foreground hover:text-foreground">Tím</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">Kontakt</a>
          </nav>
          <BookingCTA accentColor={palette.accent} size="sm" />
        </div>
      </header>

      {/* Hero — split layout */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold" style={{ color: palette.accent }}>{content.heroHeadline}</h1>
            {content.heroSubtext && <p className="mt-4 text-lg text-muted-foreground">{content.heroSubtext}</p>}
            <div className="mt-8">
              <BookingCTA accentColor={palette.accent} size="md" />
            </div>
          </div>
          <div className="rounded-lg p-8" style={{ backgroundColor: palette.muted }}>
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

      {/* Services — data-focused list */}
      {content.services.length > 0 && (
        <section id="services" className="px-6 py-16" style={{ backgroundColor: palette.muted }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold" style={{ color: palette.accent }}>Naše služby</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((s, i) => (
                <ServiceCard key={i} accentColor={palette.accent} {...s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {content.team.length > 0 && (
        <section id="team" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold" style={{ color: palette.accent }}>Náš tím</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.team.map((m, i) => (
                <div key={i} className="rounded-lg border p-4" style={{ borderColor: palette.border }}>
                  <p className="font-semibold">{m.name}</p>
                  {m.role && <p className="text-sm text-muted-foreground">{m.role}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: palette.border }}>
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {content.clinicName}
        </div>
      </footer>
    </div>
  );
}
