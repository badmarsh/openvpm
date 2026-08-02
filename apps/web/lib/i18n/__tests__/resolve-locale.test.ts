import { describe, it, expect } from "vitest";
import { resolveLocale } from "../resolve-locale";

describe("resolveLocale", () => {
  it("uses userLocale when explicit", () => {
    expect(
      resolveLocale({
        userLocale: "sk",
        practiceCountry: "US",
        cookieLocale: "en",
        acceptLanguage: "en-US",
      })
    ).toBe("sk");
  });

  it("uses cookieLocale when userLocale is absent", () => {
    expect(
      resolveLocale({
        practiceCountry: "US",
        cookieLocale: "sk",
        acceptLanguage: "en-US",
      })
    ).toBe("sk");
  });

  it("uses practiceCountry default when user/cookie are absent", () => {
    expect(
      resolveLocale({
        practiceCountry: "SK",
        acceptLanguage: "en-US",
      })
    ).toBe("sk");
  });

  it("uses acceptLanguage when prior steps yield nothing", () => {
    expect(
      resolveLocale({
        acceptLanguage: "sk-SK,sk;q=0.9,en;q=0.8",
      })
    ).toBe("sk");
  });

  it("falls back to en", () => {
    expect(resolveLocale({})).toBe("en");
  });
});
