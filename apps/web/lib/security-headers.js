// Jaaz Marketing Studio — conditional CSP additions.
// Jaaz frontend beží cez Next.js proxy (same-origin), takže potrebujeme:
//   frame-src 'self'      — povolenie same-origin iframe pre /tools/jaaz page
//   connect-src ws://...  — WebSocket pre real-time generovanie (ak Jaaz ho používa)
// Všetky Jaaz CSP pridania sú podmienené existenciou JAAZ_SERVER_URL.
const jaazCspExtras = process.env.NEXT_PUBLIC_JAAZ_ENABLED !== "false"
  ? {
      // Same-origin iframe pre Jaaz UI komponent
      frameSrc: "'self'",
      // WebSocket pre live updates (Jaaz generovanie asynchrónne)
      connectSrcExtra: "ws://localhost:5174 wss://localhost:5174 ws://jaaz-server:5174 wss://jaaz-server:5174",
    }
  : { frameSrc: null, connectSrcExtra: null };

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  jaazCspExtras.frameSrc ? `frame-src ${jaazCspExtras.frameSrc}` : null,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  [
    "script-src 'self' 'unsafe-inline'",
    process.env.NODE_ENV === "development" ? "'unsafe-eval'" : null,
    "https://va.vercel-scripts.com",
  ]
    .filter(Boolean)
    .join(" "),
  [
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    jaazCspExtras.connectSrcExtra,
  ]
    .filter(Boolean)
    .join(" "),
  "worker-src 'self' blob:",
  process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : null,
]
  .filter(Boolean)
  .join("; ");


const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

function applySecurityHeaders(response) {
  for (const { key, value } of securityHeaders) {
    response.headers.set(key, value);
  }
  return response;
}

module.exports = {
  contentSecurityPolicy,
  securityHeaders,
  applySecurityHeaders,
};
