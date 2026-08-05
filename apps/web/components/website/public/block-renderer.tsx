import type { InferSelectModel } from "drizzle-orm";
import type { websiteBlocks } from "@openpims/db";

interface BlockRendererProps {
  blocks: InferSelectModel<typeof websiteBlocks>[];
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null } | null;
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="space-y-0">
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: InferSelectModel<typeof websiteBlocks> }) {
  const content = (block.content as Record<string, unknown>) ?? {};
  switch (block.blockType) {
    case "hero":
      return <HeroBlock content={content} />;
    case "services":
      return <ServicesBlock content={content} />;
    case "about":
      return <AboutBlock content={content} />;
    case "testimonials":
      return <TestimonialsBlock content={content} />;
    case "cta":
      return <CtaBlock content={content} />;
    case "contact_form":
      return <ContactFormBlock content={content} />;
    case "team":
      return <TeamBlock content={content} />;
    case "gallery":
      return <GalleryBlock content={content} />;
    case "opening_hours":
      return <OpeningHoursBlock content={content} />;
    default:
      return null;
  }
}

function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const subheading = (content.subheading as string) ?? "";
  const ctaText = (content.ctaText as string) ?? "";
  const ctaLink = (content.ctaLink as string) ?? "#";
  return (
    <section className="bg-primary/5 px-6 py-20 text-center">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className="mt-8 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function ServicesBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const services = (content.services as Array<{ title?: unknown; description?: unknown; price?: unknown }>) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && (
          <h2 className="text-center text-2xl font-bold">{heading}</h2>
        )}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold">{(service.title as string) ?? ""}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {(service.description as string) ?? ""}
              </p>
              {typeof service.price === "string" && (
                <p className="mt-3 text-sm font-medium text-primary">
                  {service.price}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const html = (content.content as string) ?? "";
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
        {html && (
          <div
            className="prose prose-slate mt-4 max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  );
}

function TestimonialsBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const testimonials = (content.testimonials as Array<Record<string, unknown>>) ?? [];
  return (
    <section className="bg-muted/30 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">"{(item.text as string) ?? ""}"</p>
              <p className="mt-4 font-semibold">{(item.name as string) ?? ""}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const description = (content.description as string) ?? "";
  const buttonText = (content.buttonText as string) ?? "";
  const buttonLink = (content.buttonLink as string) ?? "#";
  return (
    <section className="bg-primary px-6 py-16 text-primary-foreground">
      <div className="mx-auto max-w-4xl text-center">
        {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
        {description && <p className="mt-2">{description}</p>}
        {buttonText && (
          <a
            href={buttonLink}
            className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-primary hover:bg-white/90"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function ContactFormBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const submitText = (content.submitText as string) ?? "Submit";
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <form className="mt-8 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full rounded-lg border px-4 py-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded-lg border px-4 py-2"
            required
          />
          <textarea
            name="message"
            placeholder="Message"
            rows={4}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2 text-primary-foreground"
          >
            {submitText}
          </button>
        </form>
      </div>
    </section>
  );
}

function TeamBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const members = (content.members as Array<Record<string, unknown>>) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 text-center shadow-sm">
              <h3 className="font-semibold">{(member.name as string) ?? ""}</h3>
              <p className="text-sm text-muted-foreground">{(member.role as string) ?? ""}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const images = (content.images as Array<Record<string, unknown>>) ?? [];
  return (
    <section className="bg-muted/30 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{(image.caption as string) ?? ""}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpeningHoursBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const hours = (content.hours as Array<Record<string, unknown>>) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 divide-y rounded-lg border">
          {hours.map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{String(row.day)}</span>
              <span className="text-muted-foreground">{String(row.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}