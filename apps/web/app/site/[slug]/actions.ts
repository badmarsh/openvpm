"use server";

import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@openpims/db/client";
import {
  websites, websiteSubmissions, communications,
  crmAutomations, crmAutomationLogs,
} from "@openpims/db";
import { rateLimit } from "@/lib/rate-limit";

const contactFormSchema = z.object({
  websiteSlug: z.string().min(3).max(128),
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(32).optional(),
  message: z.string().min(1).max(5000),
  pageSlug: z.string().max(128).optional(),
  consentTimestamp: z.string().datetime(),
});

export async function submitContactFormAction(
  rawInput: z.infer<typeof contactFormSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = contactFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }
  const input = parsed.data;

  // Rate limit: 5 submissions per IP per hour (server actions don't have IP, use slug+email as key)
  const rateKey = `website-contact:${input.websiteSlug}:${input.email}`;
  const rateResult = await rateLimit({
    key: rateKey,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateResult.success) {
    return { success: false, error: "Too many submissions. Please try again later." };
  }

  // Resolve website from slug
  const site = await db.query.websites.findFirst({
    where: and(
      eq(websites.slug, input.websiteSlug),
      isNull(websites.deletedAt)
    ),
    columns: { id: true, practiceId: true },
  });
  if (!site) {
    return { success: false, error: "Site not found" };
  }

  // Insert into websiteSubmissions
  const [submission] = await db.insert(websiteSubmissions).values({
    websiteId: site.id,
    submissionType: "contact",
    formData: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? "",
      message: input.message,
      pageSlug: input.pageSlug ?? "",
      consentTimestamp: input.consentTimestamp,
    },
  }).returning();

  // Create a communication record (inbox)
  const [comm] = await db.insert(communications).values({
    practiceId: site.practiceId,
    channel: "email",
    direction: "inbound",
    subject: `Website contact form: ${input.name}`,
    content: `${input.message}\n\n---\nFrom: ${input.name} <${input.email}>\nPhone: ${input.phone ?? "N/A"}`,
    status: "pending",
  }).returning();

  if (comm?.id) {
    await db.update(websiteSubmissions)
      .set({ communicationId: comm.id, updatedAt: new Date() })
      .where(eq(websiteSubmissions.id, submission.id));
  }

  // Fire "website_form_submission" automations
  const matchingAutomations = await db.query.crmAutomations.findMany({
    where: and(
      eq(crmAutomations.practiceId, site.practiceId),
      eq(crmAutomations.triggerType, "website_form_submission"),
      eq(crmAutomations.isActive, true),
      isNull(crmAutomations.deletedAt)
    ),
  });
  if (matchingAutomations.length > 0) {
    await db.insert(crmAutomationLogs).values(
      matchingAutomations.map((automation) => ({
        practiceId: site.practiceId,
        automationId: automation.id,
        clientId: comm?.id ?? submission.id,
        status: "pending" as const,
        channel: automation.actionType,
        messageContent: `Website contact form from ${input.name} <${input.email}>`,
      }))
    );
  }

  return { success: true };
}
