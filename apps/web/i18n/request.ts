import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@openpims/db/client";
import { resolveLocale } from "@/lib/i18n/resolve-locale";

export default getRequestConfig(async () => {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("[i18n] Error getting session:", err);
  }

  const cookieStore = await cookies();
  const headerStore = await headers();

  let userLocale: string | null = null;
  let practiceCountry: string | null = null;

  if (session?.user && "id" in session.user && typeof session.user.id === "string") {
    try {
      const userId = session.user.id;
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
        columns: { locale: true },
        with: { practice: { columns: { country: true } } },
      });
      userLocale = user?.locale ?? null;
      practiceCountry = user?.practice?.country ?? null;
    } catch (err) {
      console.error("[i18n] Error fetching user/practice:", err);
    }
  }

  const locale = resolveLocale({
    userLocale,
    practiceCountry,
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
