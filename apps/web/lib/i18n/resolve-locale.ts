const COUNTRY_DEFAULT_LOCALE: Record<string, string> = {
  SK: "sk",
};

export function resolveLocale(input: {
  userLocale?: string | null;
  practiceCountry?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): "sk" | "en" {
  if (input.userLocale === "sk" || input.userLocale === "en") {
    return input.userLocale; // explicit user override always wins
  }
  if (input.cookieLocale === "sk" || input.cookieLocale === "en") {
    return input.cookieLocale;
  }
  if (input.practiceCountry && COUNTRY_DEFAULT_LOCALE[input.practiceCountry]) {
    return COUNTRY_DEFAULT_LOCALE[input.practiceCountry] as "sk";
  }
  if (input.acceptLanguage?.toLowerCase().startsWith("sk")) {
    return "sk";
  }
  return "en";
}
