const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const { securityHeaders } = require("./lib/security-headers.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: ["@openpims/api", "@openpims/db", "@openpims/email"],
  optimizeFonts: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    // Jaaz Marketing Studio — proxy /jaaz-proxy/* na interný Docker service.
    // JAAZ_SERVER_URL je server-side env variable (bez NEXT_PUBLIC_), takže
    // URL Jaaz servera nie je nikdy odhalená klientovi (browseru).
    // Keď nie je nastavená, rewrite sa nevykoná a /jaaz-proxy/* vráti 404.
    const jaazUrl = process.env.JAAZ_SERVER_URL || "http://localhost:5174";

    return [
      {
        source: "/jaaz-proxy/:path*",
        destination: `${jaazUrl}/:path*`,
      },
      {
        source: "/assets/:path*",
        destination: `${jaazUrl}/assets/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${jaazUrl}/static/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${jaazUrl}/socket.io/:path*`,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

