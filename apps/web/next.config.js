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
    // Jaaz Marketing Studio — proxy na interný Docker service.
    // JAAZ_SERVER_URL je server-side env variable (bez NEXT_PUBLIC_).
    const jaazUrl = process.env.JAAZ_SERVER_URL || "http://jaaz-server:5174";

    return {
      afterFiles: [
        {
          source: "/jaaz-proxy/:path*",
          destination: `${jaazUrl}/:path*`,
        },
        {
          source: "/jaaz-proxy",
          destination: `${jaazUrl}/`,
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
      ],
      fallback: [
        {
          // Chytí všetky /api/... requesty, ktoré neboli spracované OpenVPM API routami
          // a presmeruje ich na Jaaz server (vyžadované pre hardcoded /api cesty v Jaaz SPA).
          source: "/api/:path*",
          destination: `${jaazUrl}/api/:path*`,
        }
      ]
    };
  },
};

module.exports = withNextIntl(nextConfig);

