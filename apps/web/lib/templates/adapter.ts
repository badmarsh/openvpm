import type { InferSelectModel } from "drizzle-orm";
import type { websiteBlocks } from "@openpims/db";

export interface ClinicContent {
  clinicName: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  googleMapsUrl?: string;
  foundedYear?: number;
  heroHeadline: string;
  heroSubtext: string;
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  team: TeamMember[];
  hours: HoursRow[];
}

export interface ServiceItem {
  icon?: string;
  title: string;
  description?: string;
  price?: string;
  link?: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
  rating?: number;
  avatar?: string;
  source?: "google" | "internal";
}

export interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
}

export interface HoursRow {
  day: { sk: string; en: string; hu?: string } | string;
  time: string;
  isEmergency?: boolean;
}

type Block = InferSelectModel<typeof websiteBlocks>;

interface PracticeData {
  name: string;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  email?: string;
  settings?: Record<string, unknown>;
}

export function mapBlocksToClinicContent(
  blocks: Block[],
  practice: PracticeData
): ClinicContent {
  const content: ClinicContent = {
    clinicName: practice.name,
    address: practice.address ?? "",
    phone: practice.phone ?? "",
    email: "",
    heroHeadline: "",
    heroSubtext: "",
    services: [],
    testimonials: [],
    team: [],
    hours: [],
  };

  const settings = (practice.settings ?? {}) as Record<string, unknown>;
  content.email = (settings.email as string) ?? "";
  content.googleMapsUrl = (settings.googleMapsUrl as string) ?? undefined;
  content.foundedYear = (settings.foundedYear as number) ?? undefined;

  for (const block of blocks) {
    const c = (block.content as Record<string, unknown>) ?? {};

    switch (block.blockType) {
      case "hero":
        content.heroHeadline = (c.heading as string) ?? "";
        content.heroSubtext = (c.subheading as string) ?? "";
        break;
      case "services":
        content.services = (c.services as ServiceItem[]) ?? [];
        break;
      case "testimonials":
        content.testimonials = (c.testimonials as TestimonialItem[]) ?? [];
        break;
      case "team":
        content.team = (c.members as TeamMember[]) ?? [];
        break;
      case "opening_hours":
        if (c.source === "practice_settings") {
          content.hours = (settings.openingHours as HoursRow[]) ?? (c.hours as HoursRow[]) ?? [];
        } else {
          content.hours = (c.hours as HoursRow[]) ?? [];
        }
        break;
    }
  }

  return content;
}
