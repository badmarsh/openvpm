import type { InferSelectModel } from "drizzle-orm";
import type { websiteBlocks } from "@openpims/db";
import DOMPurify from "isomorphic-dompurify";
import { ContactFormClient } from "./contact-form-client";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "ul", "ol", "li",
  "strong", "em", "b", "i", "u", "s", "a", "blockquote", "pre", "code",
  "span", "div", "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "class", "id", "colspan", "rowspan"];

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

interface BlockRendererProps {
  blocks: InferSelectModel<typeof websiteBlocks>[];
  practice: { name: string; phone: string | null; address: string | null; logoUrl: string | null } | null;
  websiteSlug?: string;
  pageSlug?: string;
}

export function BlockRenderer({ blocks, practice, websiteSlug, pageSlug }: BlockRendererProps) {
  return (
    <div className="space-y-0">
      {blocks.map((block) => (
        <Block key={block.id} block={block} practice={practice} websiteSlug={websiteSlug} pageSlug={pageSlug} />
      ))}
    </div>
  );
}

function Block({ block, practice, websiteSlug, pageSlug }: {
  block: InferSelectModel<typeof websiteBlocks>;
  practice: BlockRendererProps["practice"];
  websiteSlug?: string;
  pageSlug?: string;
}) {
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
      return <ContactFormBlock content={content} websiteSlug={websiteSlug} pageSlug={pageSlug} />;
    case "team":
      return <TeamBlock content={content} />;
    case "gallery":
      return <GalleryBlock content={content} />;
    case "opening_hours":
      return <OpeningHoursBlock content={content} />;
    case "pricing":
      return <PricingBlock content={content} />;
    case "map":
      return <MapBlock content={content} practice={practice} />;
    case "faq":
      return <FaqBlock content={content} />;
    case "blog_feed":
      return <BlogFeedBlock content={content} />;
    case "custom_html":
      return <CustomHtmlBlock content={content} />;
    default:
      return null;
  }
}

function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const subheading = (content.subheading as string) ?? "";
  const ctaText = (content.ctaText as string) ?? "";
  const ctaLink = (content.ctaLink as string) ?? "#";
  const secondaryCtaText = (content.secondaryCtaText as string) ?? "";
  const secondaryCtaLink = (content.secondaryCtaLink as string) ?? "#";
  return (
    <section className="bg-primary/5 px-6 py-20 text-center">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {ctaText && (
            <a
              href={ctaLink}
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {ctaText}
            </a>
          )}
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="inline-flex items-center rounded-lg border border-primary px-6 py-3 text-sm font-medium text-primary hover:bg-primary/5"
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
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
  const image = (content.image as string) ?? "";
  const imageAlt = (content.imageAlt as string) ?? "";
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          {html && (
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
            />
          )}
          {image && (
            <div className="shrink-0 md:w-1/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={imageAlt || heading} className="rounded-lg shadow-sm" />
            </div>
          )}
        </div>
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
              {typeof item.rating === "number" && (
                <div className="mb-2 flex gap-0.5 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={j < (item.rating as number) ? "" : "opacity-30"}>★</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">&ldquo;{(item.text as string) ?? ""}&rdquo;</p>
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
  const style = (content.style as string) ?? "primary";
  const isOutlined = style === "outlined";
  const isSecondary = style === "secondary";
  return (
    <section className="bg-primary px-6 py-16 text-primary-foreground">
      <div className="mx-auto max-w-4xl text-center">
        {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
        {description && <p className="mt-2">{description}</p>}
        {buttonText && (
          <a
            href={buttonLink}
            className={`mt-6 inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium ${isOutlined
              ? "border-2 border-white text-white hover:bg-white/10"
              : isSecondary
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-white text-primary hover:bg-white/90"
              }`}
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function ContactFormBlock({ content, websiteSlug, pageSlug }: {
  content: Record<string, unknown>;
  websiteSlug?: string;
  pageSlug?: string;
}) {
  const heading = (content.heading as string) ?? "";
  const description = (content.description as string) ?? "";
  const submitText = (content.submitText as string) ?? "Submit";
  const successMessage = (content.successMessage as string) ?? "Thank you! We will get back to you soon.";

  if (!websiteSlug) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-xl text-center text-muted-foreground">
          Contact form is unavailable.
        </div>
      </section>
    );
  }

  return (
    <ContactFormClient
      websiteSlug={websiteSlug}
      pageSlug={pageSlug}
      heading={heading}
      description={description}
      submitText={submitText}
      successMessage={successMessage}
    />
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
              {typeof member.photo === "string" && member.photo && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={member.photo}
                  alt={(member.name as string) ?? ""}
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                />
              )}
              <h3 className="font-semibold">{(member.name as string) ?? ""}</h3>
              <p className="text-sm text-muted-foreground">{(member.role as string) ?? ""}</p>
              {typeof member.bio === "string" && member.bio && (
                <p className="mt-2 text-xs text-muted-foreground">{member.bio}</p>
              )}
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
          {images.map((image, i) => {
            const url = (image.url as string) ?? "";
            const alt = (image.alt as string) ?? "";
            const caption = (image.caption as string) ?? "";
            return (
              <div key={i} className="overflow-hidden rounded-lg border bg-card shadow-sm">
                {url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={url} alt={alt} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-muted text-muted-foreground">
                    No image
                  </div>
                )}
                {caption && (
                  <p className="px-4 py-2 text-sm text-muted-foreground">{caption}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OpeningHoursBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const hours = (content.hours as Array<Record<string, unknown>>) ?? [];
  const showEmergency = (content.showEmergency as boolean) ?? false;
  const emergencyPhone = (content.emergencyPhone as string) ?? "";
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 divide-y rounded-lg border">
          {hours.map((row, i) => {
            const day = typeof row.day === "object" && row.day !== null
              ? ((row.day as Record<string, unknown>).sk as string) ?? String(row.day)
              : String(row.day);
            return (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium">{day}</span>
                <span className={`text-sm ${row.isEmergency ? "font-semibold text-destructive" : "text-muted-foreground"}`}>
                  {String(row.time)}
                </span>
              </div>
            );
          })}
        </div>
        {showEmergency && emergencyPhone && (
          <p className="mt-4 text-center text-sm font-medium text-destructive">
            Emergency: {emergencyPhone}
          </p>
        )}
      </div>
    </section>
  );
}

function PricingBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const plans = (content.plans as Array<Record<string, unknown>>) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const features = (plan.features as string[]) ?? [];
            const highlighted = (plan.highlighted as boolean) ?? false;
            return (
              <div
                key={i}
                className={`rounded-lg border p-6 shadow-sm ${highlighted ? "border-primary ring-2 ring-primary/20" : "bg-card"
                  }`}
              >
                {highlighted && (
                  <span className="mb-2 inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Popular
                  </span>
                )}
                <h3 className="font-semibold">{(plan.name as string) ?? ""}</h3>
                <p className="mt-2 text-3xl font-bold">
                  {(plan.price as string) ?? "0"}
                  {typeof plan.period === "string" && (
                    <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                  )}
                </p>
                {features.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="text-primary">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                )}
                {typeof plan.ctaText === "string" && plan.ctaText && (
                  <button
                    type="button"
                    className={`mt-6 w-full rounded-lg py-2 text-sm font-medium ${highlighted
                      ? "bg-primary text-primary-foreground"
                      : "border border-primary text-primary"
                      }`}
                  >
                    {plan.ctaText}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MapBlock({ content, practice }: {
  content: Record<string, unknown>;
  practice: BlockRendererProps["practice"];
}) {
  const heading = (content.heading as string) ?? "";
  const address = (content.address as string) ?? practice?.address ?? "";
  const embedUrl = (content.embedUrl as string) ?? "";
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {address && (
              <p className="text-muted-foreground">{address}</p>
            )}
            {practice?.phone && (
              <p className="text-muted-foreground">
                <a href={`tel:${practice.phone}`} className="hover:text-foreground">{practice.phone}</a>
              </p>
            )}
          </div>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={heading || "Map"}
              className="rounded-lg"
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted text-muted-foreground">
              Map preview
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  const items = (content.items as Array<{ question?: string; answer?: string }>) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <dl className="mt-8 divide-y rounded-lg border">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-4">
              <dt className="font-medium">{item.question ?? ""}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.answer ?? ""}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function BlogFeedBlock({ content }: { content: Record<string, unknown> }) {
  const heading = (content.heading as string) ?? "";
  // Blog feed is rendered server-side; this block shows a placeholder
  // that the public page can hydrate with actual posts data.
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Blog posts are loaded dynamically.
        </div>
      </div>
    </section>
  );
}

function CustomHtmlBlock({ content }: { content: Record<string, unknown> }) {
  const html = (content.html as string) ?? "";
  if (!html) return null;
  return (
    <section className="px-6 py-8">
      <div
        className="mx-auto max-w-6xl prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
    </section>
  );
}
