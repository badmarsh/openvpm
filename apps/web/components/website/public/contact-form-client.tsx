"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { submitContactFormAction } from "@/app/site/[slug]/actions";

interface ContactFormClientProps {
  websiteSlug: string;
  pageSlug?: string;
  heading: string;
  description?: string;
  submitText: string;
  successMessage: string;
}

export function ContactFormClient({
  websiteSlug,
  pageSlug,
  heading,
  description,
  submitText,
  successMessage,
}: ContactFormClientProps) {
  const t = useTranslations("website");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!consented) {
      setError(t("public.consentRequired"));
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const phone = data.get("phone") as string;
    const message = data.get("message") as string;

    setIsSubmitting(true);
    try {
      const result = await submitContactFormAction({
        websiteSlug,
        name,
        email,
        phone: phone || undefined,
        message,
        pageSlug,
        consentTimestamp: new Date().toISOString(),
      });
      if (result.success) {
        setSubmitted(true);
        form.reset();
        setConsented(false);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-lg font-medium text-green-600">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm text-muted-foreground underline"
          >
            {t("public.submitAnother")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        {heading && <h2 className="text-center text-2xl font-bold">{heading}</h2>}
        {description && (
          <p className="mt-2 text-center text-muted-foreground">{description}</p>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t("public.namePlaceholder")}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder={t("public.emailPlaceholder")}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder={t("public.phonePlaceholder")}
            className="w-full rounded-lg border px-4 py-2"
          />
          <textarea
            name="message"
            placeholder={t("public.messagePlaceholder")}
            rows={4}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>{t("public.consentText")}</span>
          </label>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary py-2 text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              submitText
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
