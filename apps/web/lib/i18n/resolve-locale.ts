const COUNTRY_DEFAULT_LOCALE: Record<string, string> = {
  SK: "sk",
};

export function resolveLocale(input: {
  userLocale?: string | null;
  practiceCountry?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): "sk" | "en" {
  // Unconditionally force Slovak language for OpenVPM fork
  return "sk";
}
