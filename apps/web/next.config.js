const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const { securityHeaders } = require("./lib/security-headers.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT_STANDALONE === "false" ? undefined : "standalone",
  poweredByHeader: false,
  transpilePackages: ["@openpims/api", "@openpims/db", "@openpims/email"],
  optimizeFonts: false,
  experimental: {
    // jsdom (pulled in via isomorphic-dompurify) reads assets like
    // default-stylesheet.css relative to its own module location at
    // runtime. If webpack bundles/traces it into the route output,
    // that asset isn't copied along and `next build` fails with
    // ENOENT during "Collecting page data". Keeping it external makes
    // Node resolve it from node_modules normally instead.
    serverComponentsExternalPackages: ["jsdom", "isomorphic-dompurify"],
  },
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
    const jaazUrl = process.env.JAAZ_SERVER_URL || "http://127.0.0.1:5174";

    return {
      beforeFiles: [
        {
          source: "/socket.io/:path*",
          destination: `${jaazUrl}/socket.io/:path*`,
        },
      ],
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
        // Jaaz SPA uses @vercel/analytics which requests /_vercel/insights/script.js
        // from the origin — proxy it to the Jaaz server so it doesn't 404 on Next.js.
        {
          source: "/_vercel/:path*",
          destination: `${jaazUrl}/_vercel/:path*`,
        },
      ],
      fallback: process.env.JAAZ_SERVER_URL
        ? [
          {
            // Chytí všetky /api/... requesty, ktoré neboli spracované OpenVPM API routami
            // a presmeruje ich na Jaaz server (vyžadované pre hardcoded /api cesty v Jaaz SPA).
            // Only active when JAAZ_SERVER_URL is explicitly set — avoids ECONNREFUSED when
            // Jaaz is not running.
            source: "/api/:path*",
            destination: `${jaazUrl}/api/:path*`,
          },
        ]
        : [],
    };
  },
};

module.exports = withNextIntl(nextConfig);

